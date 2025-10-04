# Configuração do Melhor Envio

## O que é o Melhor Envio?

O Melhor Envio é uma plataforma agregadora de transportadoras que permite consultar e contratar fretes de múltiplas empresas (Correios, Jadlog, Loggi, LATAM Cargo, etc.) através de uma única API.

## ⚠️ Configuração Obrigatória

**IMPORTANTE:** O sistema está configurado para **NUNCA usar modo simulado**. As credenciais do Melhor Envio são **obrigatórias** para o funcionamento do cálculo de frete.

Se as credenciais não estiverem configuradas, o sistema retornará erro ao tentar calcular o frete.

## Como Configurar (Produção)

### 1. Criar Conta no Melhor Envio

1. Acesse: https://melhorenvio.com.br
2. Crie uma conta gratuita
3. Complete o cadastro da sua empresa

### 2. Obter Token de API

1. Acesse o painel do Melhor Envio
2. Vá em **Configurações** > **API**
3. Gere um **Token de Produção**
4. Copie o token gerado

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
# Melhor Envio Configuration
MELHOR_ENVIO_TOKEN=seu_token_aqui
MELHOR_ENVIO_API_URL=https://melhorenvio.com.br/api/v2
MELHOR_ENVIO_CEP_ORIGEM=01310100
```

**Importante:**
- `MELHOR_ENVIO_TOKEN`: Token obtido no painel
- `MELHOR_ENVIO_API_URL`: URL da API (produção)
- `MELHOR_ENVIO_CEP_ORIGEM`: CEP da sua loja/depósito (Brás - São Paulo: 01310100)

### 4. Configurar CEP de Origem

O CEP de origem deve ser o endereço de onde os produtos serão enviados. Para o Brás em São Paulo, use:

```
01310100 (Brás - São Paulo, SP)
```

### 5. Testar a Integração

Após configurar, reinicie o servidor e teste o cálculo de frete. Você deverá ver as opções disponíveis.

## Opções de Frete Disponíveis

O sistema está configurado para exibir apenas as seguintes opções de frete (filtradas da API do Melhor Envio):

1. **PAC** (Correios) - Econômico, 7 dias úteis
2. **SEDEX** (Correios) - Rápido, 2 dias úteis  
3. **Express** (Jadlog) - Intermediário, 3 dias úteis

> **Nota:** O sistema filtra automaticamente as opções da API para exibir apenas essas 3 transportadoras mais confiáveis.

## Comportamento em Caso de Erro

Se houver problemas com a configuração ou API, o sistema **NÃO usará valores simulados**. Em vez disso:

- ❌ **Sem credenciais**: Erro "Serviço de frete indisponível"
- ❌ **Token inválido**: Erro "Token inválido ou expirado"
- ❌ **API fora do ar**: Erro "Tente novamente em alguns instantes"
- ❌ **Sem opções disponíveis**: Mensagem para entrar em contato

Isso garante que **nunca sejam exibidos valores incorretos ou simulados** aos clientes.

## Custos

### Melhor Envio
- ✅ **Consultas de frete**: Grátis e ilimitadas
- ✅ **Valores reais** da API do Melhor Envio
- ✅ **Contratação de fretes**: Disponível (taxa por envio)
- ✅ **Rastreamento integrado**: Incluído
- ✅ **Suporte técnico**: Disponível
- 💰 **Custo**: Taxa apenas na contratação do frete (não na consulta)

## Vantagens do Melhor Envio

1. **Múltiplas Transportadoras**: Compare preços de 10+ transportadoras
2. **Economia**: Até 80% de desconto comparado ao balcão
3. **Rastreamento**: Acompanhe todas as entregas em um só lugar
4. **Impressão de Etiquetas**: Gere etiquetas automaticamente
5. **API Simples**: Fácil integração

## Documentação Oficial

- Site: https://melhorenvio.com.br
- Documentação API: https://docs.melhorenvio.com.br/
- Painel: https://melhorenvio.com.br/painel

## Suporte

Se tiver dúvidas sobre a integração:
1. Consulte a documentação oficial
2. Entre em contato com o suporte do Melhor Envio
3. Verifique os logs da aplicação para erros de API

