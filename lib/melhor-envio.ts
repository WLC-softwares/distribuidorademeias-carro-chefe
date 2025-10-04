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
  // Se não tem credenciais, usa simulação
  if (!hasMelhorEnvioCredentials()) {
    return calculateShippingSimulated(params);
  }

  try {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const apiUrl = process.env.MELHOR_ENVIO_API_URL || "https://melhorenvio.com.br/api/v2";

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

      console.error("Erro API Melhor Envio:", response.status, errorText);

      // Fallback para simulação
      return calculateShippingSimulated(params);
    }

    const services: MelhorEnvioService[] = await response.json();

    const results: ShippingOption[] = services.map((service) => ({
      codigo: service.id.toString(),
      nome: service.name,
      empresa: service.company.name,
      valor: parseFloat(service.custom_price || service.price),
      prazoEntrega: service.delivery_time,
      logo: service.company.picture,
    }));

    // Ordenar por preço
    results.sort((a, b) => a.valor - b.valor);

    return results;
  } catch (error) {
    console.error("Erro ao calcular frete:", error);

    return calculateShippingSimulated(params);
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
      valor: Number((15 + peso * 5).toFixed(2)),
      prazoEntrega: 7,
    },
    {
      codigo: "2",
      nome: "SEDEX",
      empresa: "Correios",
      valor: Number((25 + peso * 8).toFixed(2)),
      prazoEntrega: 2,
    },
    {
      codigo: "3",
      nome: "Express",
      empresa: "Jadlog",
      valor: Number((20 + peso * 6).toFixed(2)),
      prazoEntrega: 3,
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
