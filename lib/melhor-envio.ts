/**
 * Integração com a API do Melhor Envio
 * Plataforma agregadora de transportadoras (Correios, Jadlog, Azul, etc)
 * Documentação: https://docs.melhorenvio.com.br/
 */

export interface MelhorEnvioShippingParams {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  package: {
    weight: number; // em kg
    width: number; // em cm
    height: number; // em cm
    length: number; // em cm
  };
}

export interface MelhorEnvioService {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
}

export interface ShippingOption {
  codigo: string;
  nome: string;
  empresa: string;
  valor: number;
  prazoEntrega: number;
  logo?: string;
}

/**
 * Calcula dimensões do pacote baseado na quantidade de itens
 */
export function calculatePackageDimensions(
  totalWeight: number,
  itemCount: number,
): { weight: number; width: number; height: number; length: number } {
  let packageWeight = 0.1;
  let length = 20;
  let width = 15;
  let height = 5;

  if (itemCount >= 51) {
    length = 40;
    width = 30;
    height = 20;
    packageWeight = 0.3;
  } else if (itemCount >= 21) {
    length = 30;
    width = 25;
    height = 15;
    packageWeight = 0.25;
  } else if (itemCount >= 6) {
    length = 25;
    width = 20;
    height = 10;
    packageWeight = 0.15;
  }

  return {
    weight: totalWeight + packageWeight,
    width,
    height,
    length,
  };
}

/**
 * Parse seguro de resposta JSON da API
 * Retorna um objeto vazio se a resposta estiver vazia
 */
async function safeJsonParse(response: Response, defaultValue: any = {}) {
  const text = await response.text();

  if (!text || text.trim() === "") {
    console.log("⚠️ Resposta vazia da API Melhor Envio");

    return defaultValue;
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error("❌ Erro ao parsear resposta JSON:", text.substring(0, 200));
    throw new Error("Resposta inválida da API do Melhor Envio");
  }
}

/**
 * Verifica se as credenciais estão configuradas
 */
export function hasMelhorEnvioCredentials(): boolean {
  return !!process.env.MELHOR_ENVIO_TOKEN;
}
/**
 * Calcula o frete usando a API do Melhor Envio
 */
export async function calculateShipping(
  params: MelhorEnvioShippingParams,
): Promise<ShippingOption[]> {
  // Verificar credenciais obrigatórias
  if (!hasMelhorEnvioCredentials()) {
    console.error("❌ Melhor Envio: Token não configurado");
    throw new Error(
      "Serviço de frete indisponível. Configure MELHOR_ENVIO_TOKEN no arquivo .env",
    );
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  console.log("📦 Melhor Envio: Calculando frete...", {
    from: params.from.postal_code,
    to: params.to.postal_code,
    weight: params.package.weight,
    dimensions: `${params.package.length}x${params.package.width}x${params.package.height}`,
  });

  try {
    const response = await fetch(`${apiUrl}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
      body: JSON.stringify(params),
    });

    console.log("🔍 Melhor Envio: Resposta da API:", response);

    if (!response.ok) {
      const errorText = await response.text();

      console.error("❌ Melhor Envio API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      // Retornar erro específico baseado no status
      if (response.status === 401) {
        throw new Error(
          "Token do Melhor Envio inválido ou expirado. Verifique suas credenciais.",
        );
      } else if (response.status === 422) {
        throw new Error(
          "Erro ao calcular frete. Verifique os dados do pacote (peso, dimensões e CEPs).",
        );
      } else {
        throw new Error(
          `Erro ao consultar Melhor Envio (${response.status}). Tente novamente em alguns instantes.`,
        );
      }
    }

    const servicesRaw: any[] = await safeJsonParse(response, []);

    console.log(
      `✅ Melhor Envio: ${servicesRaw.length} opções retornadas pela API`,
    );

    if (servicesRaw.length === 0) {
      console.warn("⚠️ API retornou 0 opções");
      throw new Error(
        "Nenhuma opção de frete disponível para este endereço. Entre em contato conosco.",
      );
    }

    // Filtrar serviços que retornaram erro (ex: "Transportadora não atende este trecho")
    const servicesValid = servicesRaw.filter((service: any) => {
      if (service.error) {
        console.warn(
          `⚠️ ${service.company.name} ${service.name}: ${service.error}`,
        );

        return false;
      }

      return true;
    });

    console.log(
      `📦 ${servicesValid.length} opções válidas (${servicesRaw.length - servicesValid.length} com erro)`,
    );

    const results: ShippingOption[] = servicesValid
      .map((service: any) => {
        // Tentar obter o preço customizado ou o preço padrão
        const priceStr = service.custom_price || service.price || "0";
        const price = parseFloat(priceStr);

        return {
          codigo: service.id.toString(),
          nome: service.name,
          empresa: service.company.name,
          valor: price,
          prazoEntrega: service.delivery_time,
          logo: service.company.picture,
        };
      })
      .filter((option) => {
        // Filtrar opções com preço inválido (NaN ou <= 0) - backup de segurança
        if (isNaN(option.valor) || option.valor <= 0) {
          console.warn(
            `⚠️ Opção ${option.empresa} ${option.nome} ignorada (preço inválido: ${option.valor})`,
          );

          return false;
        }

        return true;
      });

    if (results.length === 0) {
      console.warn("⚠️ Nenhuma opção disponível após filtro");
      throw new Error("Nenhuma opção de frete disponível para este endereço.");
    }

    // Ordenar por preço
    results.sort((a, b) => a.valor - b.valor);

    console.log(
      "📊 Opções processadas:",
      results.map((r) => `${r.empresa} ${r.nome} - R$ ${r.valor}`),
    );

    return results;
  } catch (error) {
    // Se já é um erro nosso, repassar
    if (error instanceof Error) {
      throw error;
    }

    // Erro desconhecido
    console.error("❌ Erro inesperado ao calcular frete:", error);
    throw new Error("Erro ao calcular frete. Tente novamente mais tarde.");
  }
}

/**
 * Valida um CEP
 */
export function validateCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, "");

  return cepLimpo.length === 8;
}

/**
 * Formata um CEP
 */
export function formatCEP(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) return cep;

  return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
}

// ==================== GESTÃO DE ENVIOS ====================

export interface CartItemParams {
  service: number;
  agency?: number;
  from: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    state_register?: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
    postal_code: string;
    note?: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    state_register?: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
    postal_code: string;
    note?: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    unitary_value: number;
  }>;
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
  options: {
    insurance_value: number;
    receipt: boolean;
    own_hand: boolean;
    reverse: boolean;
    non_commercial: boolean;
    invoice?: {
      key: string;
    };
    platform?: string;
    tags?: Array<{
      tag: string;
      url?: string;
    }>;
  };
}

/**
 * Inserir frete no carrinho
 * https://docs.melhorenvio.com.br/reference/inserir-fretes-no-carrinho
 */
export async function addToCart(params: CartItemParams) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/cart`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("❌ Erro ao adicionar ao carrinho:", errorText);

      // Tentar parsear o erro para mostrar mensagem mais clara
      try {
        const errorData = JSON.parse(errorText);
        const errorMessage =
          errorData.message || errorData.error || `Erro ${response.status}`;

        throw new Error(errorMessage);
      } catch (parseError) {
        throw new Error(`Erro ao adicionar ao carrinho: ${response.status}`);
      }
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao adicionar ao carrinho:", error);
    throw error;
  }
}

/**
 * Listar itens do carrinho
 * https://docs.melhorenvio.com.br/reference/listar-itens-do-carrinho
 */
export async function getCartItems() {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/cart`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar carrinho: ${response.status}`);
    }

    return await safeJsonParse(response, []);
  } catch (error) {
    console.error("❌ Erro ao listar carrinho:", error);
    throw error;
  }
}

/**
 * Remover item do carrinho
 */
export async function removeFromCart(itemId: string) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/cart/${itemId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao remover do carrinho: ${response.status}`);
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao remover do carrinho:", error);
    throw error;
  }
}

/**
 * Comprar fretes (Checkout)
 * https://docs.melhorenvio.com.br/reference/compra-de-fretes-1
 */
export async function checkoutShipments(orderIds: string[]) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/shipment/checkout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
      body: JSON.stringify({ orders: orderIds }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("❌ Erro ao fazer checkout:", errorText);
      throw new Error(`Erro ao fazer checkout: ${response.status}`);
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao fazer checkout:", error);
    throw error;
  }
}

/**
 * Gerar etiquetas
 * https://docs.melhorenvio.com.br/reference/geracao-de-etiquetas
 */
export async function generateLabels(orderIds: string[]) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/shipment/generate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
      body: JSON.stringify({ orders: orderIds }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("❌ Erro ao gerar etiquetas:", errorText);
      throw new Error(`Erro ao gerar etiquetas: ${response.status}`);
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao gerar etiquetas:", error);
    throw error;
  }
}

/**
 * Imprimir etiquetas
 * https://docs.melhorenvio.com.br/reference/impressao-de-etiquetas
 */
export async function printLabels(
  orderIds: string[],
  mode: "private" | "public" = "private",
) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/shipment/print`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
      body: JSON.stringify({ mode, orders: orderIds }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("❌ Erro ao imprimir etiquetas:", errorText);
      throw new Error(`Erro ao imprimir etiquetas: ${response.status}`);
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao imprimir etiquetas:", error);
    throw error;
  }
}

/**
 * Listar etiquetas/envios
 * https://docs.melhorenvio.com.br/reference/listar-etiquetas
 */
export async function listShipments(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());
  if (params?.status) queryParams.append("status", params.status);

  try {
    const response = await fetch(
      `${apiUrl}/me/orders?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "Distribuidora de Meias",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erro ao listar envios: ${response.status}`);
    }

    return await safeJsonParse(response, {
      data: [],
      current_page: 1,
      total: 0,
      per_page: 15,
      last_page: 1,
    });
  } catch (error) {
    console.error("❌ Erro ao listar envios:", error);
    throw error;
  }
}

/**
 * Buscar informações de um envio específico
 */
export async function getShipment(orderId: string) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/orders/${orderId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar envio: ${response.status}`);
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao buscar envio:", error);
    throw error;
  }
}

/**
 * Motivos de cancelamento do Melhor Envio
 * https://docs.melhorenvio.com.br/reference/cancelamento-de-etiquetas
 * TESTADO NO SANDBOX: ID 4 funciona
 */
export enum CancelReasonId {
  ENDERECO_INCORRETO = 4, // Endereço incorreto (TESTADO ✅)
}

/**
 * Cancelar etiqueta
 * https://docs.melhorenvio.com.br/reference/cancelamento-de-etiquetas
 */
export async function cancelShipment(
  orderId: string,
  reasonId: CancelReasonId = CancelReasonId.ENDERECO_INCORRETO,
  description?: string,
) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  const payload = {
    order: {
      id: orderId,
      reason_id: reasonId,
      description: description || "Cancelamento solicitado pelo sistema",
    },
  };

  try {
    const response = await fetch(`${apiUrl}/me/shipment/cancel`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("❌ Erro ao cancelar envio:", errorText);
      console.error("❌ Status:", response.status);

      // Se o erro for de reason_id inválido, tentar sem ele (ambiente sandbox)
      if (errorText.includes("reason_id")) {
        console.log("⚠️ Tentando cancelar sem reason_id (modo sandbox)...");

        const retryPayload = {
          order: {
            id: orderId,
            description: description || "Cancelamento solicitado pelo sistema",
          },
        };

        const retryResponse = await fetch(`${apiUrl}/me/shipment/cancel`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "User-Agent": "Distribuidora de Meias",
          },
          body: JSON.stringify(retryPayload),
        });

        if (retryResponse.ok) {
          console.log("✅ Cancelamento sem reason_id bem-sucedido!");

          return await safeJsonParse(retryResponse);
        } else {
          const retryErrorText = await retryResponse.text();

          console.error(
            "❌ Erro na segunda tentativa (sem reason_id):",
            retryErrorText,
          );
          console.error(
            "❌ Status da segunda tentativa:",
            retryResponse.status,
          );
        }
      }

      // Tentar parsear o erro para mostrar mensagem mais clara
      try {
        const errorData = JSON.parse(errorText);
        const errorMessage =
          errorData.message || errorData.error || `Erro ${response.status}`;

        throw new Error(errorMessage);
      } catch (parseError) {
        throw new Error(`Erro ao cancelar envio: ${response.status}`);
      }
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao cancelar envio:", error);
    throw error;
  }
}

/**
 * Rastrear envio
 * https://docs.melhorenvio.com.br/reference/rastreio-de-envios
 */
export async function trackShipment(orders: string[]) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/shipment/tracking`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
      body: JSON.stringify({ orders }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao rastrear envio: ${response.status}`);
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("❌ Erro ao rastrear envio:", error);
    throw error;
  }
}

/**
 * Listar transportadoras
 * https://docs.melhorenvio.com.br/reference/listar-transportadoras
 */
export async function listCarriers() {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/shipment/companies`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar transportadoras: ${response.status}`);
    }

    return await safeJsonParse(response, []);
  } catch (error) {
    console.error("❌ Erro ao listar transportadoras:", error);
    throw error;
  }
}

/**
 * Listar agências
 * https://docs.melhorenvio.com.br/reference/listar-agencias-e-opcoes-de-filtro
 */
export async function listAgencies(params?: {
  company?: number;
  country?: string;
  state?: string;
  city?: string;
}) {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  const queryParams = new URLSearchParams();

  if (params?.company) queryParams.append("company", params.company.toString());
  if (params?.country) queryParams.append("country", params.country);
  if (params?.state) queryParams.append("state", params.state);
  if (params?.city) queryParams.append("city", params.city);

  try {
    const response = await fetch(
      `${apiUrl}/me/shipment/agencies?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "Distribuidora de Meias",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erro ao listar agências: ${response.status}`);
    }

    return await safeJsonParse(response, []);
  } catch (error) {
    console.error("❌ Erro ao listar agências:", error);
    throw error;
  }
}

/**
 * Obter saldo da carteira
 */
export async function getBalance() {
  if (!hasMelhorEnvioCredentials()) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  try {
    const response = await fetch(`${apiUrl}/me/balance`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar saldo: ${response.status}`);
    }

    return await safeJsonParse(response, { balance: 0 });
  } catch (error) {
    console.error("❌ Erro ao buscar saldo:", error);
    throw error;
  }
}
