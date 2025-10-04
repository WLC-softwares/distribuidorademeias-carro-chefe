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
    throw new Error("Serviço de frete indisponível. Configure MELHOR_ENVIO_TOKEN no arquivo .env");
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL || "https://melhorenvio.com.br/api/v2";

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Melhor Envio API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      // Retornar erro específico baseado no status
      if (response.status === 401) {
        throw new Error("Token do Melhor Envio inválido ou expirado. Verifique suas credenciais.");
      } else if (response.status === 422) {
        throw new Error("Erro ao calcular frete. Verifique os dados do pacote (peso, dimensões e CEPs).");
      } else {
        throw new Error(`Erro ao consultar Melhor Envio (${response.status}). Tente novamente em alguns instantes.`);
      }
    }

    const services: MelhorEnvioService[] = await response.json();

    console.log(`✅ Melhor Envio: ${services.length} opções retornadas pela API`);

    if (services.length === 0) {
      console.warn("⚠️ API retornou 0 opções");
      throw new Error("Nenhuma opção de frete disponível para este endereço. Entre em contato conosco.");
    }

    const results: ShippingOption[] = services
      .map((service) => ({
        codigo: service.id.toString(),
        nome: service.name,
        empresa: service.company.name,
        valor: parseFloat(service.custom_price || service.price),
        prazoEntrega: service.delivery_time,
        logo: service.company.picture,
      }))
      .filter((option) => {
        // Filtrar apenas: PAC, SEDEX (Correios) e Express (Jadlog)
        const isCorreiosPAC = option.empresa === "Correios" && option.nome === "PAC";
        const isCorreiosSEDEX = option.empresa === "Correios" && option.nome === "SEDEX";
        const isJadlogExpress = option.empresa === "Jadlog" && option.nome === "Express";

        return isCorreiosPAC || isCorreiosSEDEX || isJadlogExpress;
      });

    // Verificar se restou alguma opção após o filtro
    if (results.length === 0) {
      console.warn("⚠️ Nenhuma opção disponível após filtro (PAC, SEDEX, Jadlog Express)");
      throw new Error("Nenhuma opção de frete disponível (PAC, SEDEX ou Jadlog Express) para este endereço.");
    }

    // Ordenar por preço
    results.sort((a, b) => a.valor - b.valor);

    console.log("📊 Opções processadas:", results.map(r => `${r.empresa} ${r.nome} - R$ ${r.valor}`));
    console.log(`🔍 Filtradas ${results.length} de ${services.length} opções`);

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
 * Calcula o frete simulado (para desenvolvimento)
 */
export async function calculateShippingSimulated(
  params: MelhorEnvioShippingParams,
): Promise<ShippingOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const peso = params.package.weight;

  return [
    {
      codigo: "1",
      nome: "PAC",
      empresa: "Correios",
      valor: Number((12 + peso * 4).toFixed(2)),
      prazoEntrega: 7,
      logo: "https://melhorenvio.com.br/images/shipping-companies/correios.png",
    },
    {
      codigo: "2",
      nome: "SEDEX",
      empresa: "Correios",
      valor: Number((22 + peso * 7).toFixed(2)),
      prazoEntrega: 2,
      logo: "https://melhorenvio.com.br/images/shipping-companies/correios.png",
    },
    {
      codigo: "3",
      nome: "Express",
      empresa: "Jadlog",
      valor: Number((18 + peso * 5).toFixed(2)),
      prazoEntrega: 3,
      logo: "https://melhorenvio.com.br/images/shipping-companies/jadlog.png",
    },
  ];
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
