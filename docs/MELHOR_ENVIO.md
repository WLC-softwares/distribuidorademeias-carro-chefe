# 📦 Integração com Melhor Envio

## 🎯 Por Que Melhor Envio?

✅ **Múltiplas transportadoras** (Correios, Jadlog, Azul, Loggi)  
✅ **Preços mais competitivos** (até 50% de desconto)  
✅ **API simples** e bem documentada  
✅ **Sem burocracia** ou contrato necessário  
✅ **Ambiente sandbox** gratuito para testes  
✅ **Dashboard completo** para gestão  

## 🚀 Configuração em 3 Passos

### 1️⃣ Criar Conta

**Sandbox (Testes)**: https://sandbox.melhorenvio.com.br/  
**Produção**: https://melhorenvio.com.br/

### 2️⃣ Cadastrar Aplicativo

1. Faça login
2. Menu: **Configurações** → **Aplicativos**
3. Clique em **"Novo aplicativo"**
4. Preencha:
   - **Nome**: DISTRIBUIDORA CARRO CHEFE
   - **Site**: https://distribuidorademeias-carro-chefe.vercel.app/
   - **Descrição**: "E-commerce de meias com cálculo de frete automático"
5. **Copie o token** gerado

### 3️⃣ Configurar `.env`

```env
# Melhor Envio
MELHOR_ENVIO_TOKEN="seu_token_aqui"
MELHOR_ENVIO_CEP_ORIGEM="03020000"
MELHOR_ENVIO_SANDBOX="true"  # false para produção
```

## ✅ Testar

```bash
npm run dev
```

1. Adicione produtos ao carrinho
2. Vá para o checkout
3. Digite CEP: `04545-000`
4. Clique em **"Calcular"**

Você verá múltiplas opções de frete com logos das transportadoras!

## 💡 Dicas

- Use **Sandbox** primeiro (gratuito)
- Token nunca expira
- API totalmente gratuita para cotação
- Só paga quando gerar etiqueta

## 📚 Documentação

- **API Docs**: https://docs.melhorenvio.com.br/
- **Sandbox**: https://sandbox.melhorenvio.com.br/
- **Suporte**: Chat no painel

---

**Implementação**: ✅ Completa  
**Tempo de setup**: ~5 minutos  
**Custo**: 🆓 Gratuito

