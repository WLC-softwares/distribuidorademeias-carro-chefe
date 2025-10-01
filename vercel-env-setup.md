# 🔧 Configuração de Variáveis de Ambiente na Vercel

## ❌ **Problema Atual:**
O projeto está falhando com erro 500 porque as variáveis de ambiente não estão configuradas na Vercel.

## ✅ **Solução:**

### 1. **Acesse o Dashboard da Vercel:**
- Vá para: https://vercel.com/dashboard
- Selecione seu projeto: `distribuidorademeias-carro-chefe`

### 2. **Configure as Variáveis de Ambiente:**
Vá em **Settings** → **Environment Variables** e adicione:

#### **DATABASE_URL** (OBRIGATÓRIO)
```
postgresql://username:password@host:5432/database_name
```
**Exemplo com Neon/PlanetScale:**
```
postgresql://user:pass@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### **AUTH_SECRET** (OBRIGATÓRIO)
```
qualquer-string-secreta-longa-e-aleatoria
```
**Gerar:** https://generate-secret.vercel.app/32

#### **NEXTAUTH_URL** (OBRIGATÓRIO)
```
https://distribuidorademeias-carro-chefe-2duor2p5p.vercel.app
```

#### **GOOGLE_CLIENT_ID** (OPCIONAL)
```
seu-google-client-id
```

#### **GOOGLE_CLIENT_SECRET** (OPCIONAL)
```
seu-google-client-secret
```

### 3. **Redeploy:**
Após adicionar as variáveis, faça um novo deploy:
- Vá em **Deployments**
- Clique nos 3 pontos do último deploy
- Selecione **Redeploy**

## 🗄️ **Opções de Banco de Dados:**

### **Opção 1: Neon (Recomendado - Gratuito)**
1. Acesse: https://neon.tech
2. Crie conta gratuita
3. Crie novo projeto
4. Copie a `DATABASE_URL` gerada

### **Opção 2: PlanetScale (MySQL)**
1. Acesse: https://planetscale.com
2. Crie conta gratuita
3. Crie novo banco
4. Copie a `DATABASE_URL`

### **Opção 3: Supabase (PostgreSQL)**
1. Acesse: https://supabase.com
2. Crie conta gratuita
3. Crie novo projeto
4. Vá em Settings → Database
5. Copie a `DATABASE_URL`

## 🚀 **Após Configurar:**
1. As variáveis serão aplicadas automaticamente
2. O banco será populado com dados de exemplo
3. O login funcionará: `admin@distribuidora.com` / `admin123`

## 📝 **Nota:**
O projeto já tem o schema Prisma configurado e o seed script pronto. Só precisa do banco de dados!
