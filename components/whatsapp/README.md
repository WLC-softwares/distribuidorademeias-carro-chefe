# Componente WhatsApp Float

Botão flutuante do WhatsApp que aparece no canto inferior direito de todas as páginas.

## Uso

O componente já está integrado no layout principal (`app/layout.tsx`) e aparece automaticamente em todas as páginas.

## Configuração

### 1. Adicione a variável de ambiente

No arquivo `.env.local`:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER="5511961667767"
```

**Formato do número:**
- Código do país + DDD + número
- Sem espaços, hífens ou parênteses
- Exemplo: `5511961667767`

### 2. Reinicie o servidor

Após adicionar ou alterar a variável, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Funcionalidades

- ✅ Botão fixo no canto inferior direito
- ✅ Animação de pulso
- ✅ Texto "Fale conosco" aparece no hover
- ✅ Abre o WhatsApp com mensagem pré-definida
- ✅ Responsivo (mobile e desktop)
- ✅ Cor verde oficial do WhatsApp (#25D366)

## Personalização

### Alterar a mensagem padrão

Edite o arquivo `components/whatsapp/WhatsAppFloat.tsx`:

```typescript
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Sua%20mensagem%20aqui`;
```

### Alterar a posição

Modifique as classes `bottom-6` e `right-6` para outras posições:

```tsx
className="fixed bottom-4 left-4 ..."  // Canto inferior esquerdo
className="fixed top-4 right-4 ..."     // Canto superior direito
```

### Alterar o tamanho do ícone

Modifique a prop `size` do componente `MessageCircle`:

```tsx
<MessageCircle size={40} />  // Maior
<MessageCircle size={24} />  // Menor
```

## Troubleshooting

### Erro de Hydration

Se receber erro:
```
Error: A tree hydrated but some attributes didn't match...
```

**Solução:** Certifique-se de que a variável de ambiente começa com `NEXT_PUBLIC_`:
```env
✅ NEXT_PUBLIC_WHATSAPP_NUMBER="5511961667767"
❌ WHATSAPP_NUMBER="5511961667767"  # Não funciona no cliente!
```

### Número não aparece

1. Verifique se a variável está no `.env.local`
2. Reinicie o servidor
3. Verifique no console: `console.log(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)`

### Botão não aparece

Verifique se o componente está importado no layout:

```tsx
// app/layout.tsx
import { WhatsAppFloat } from "@/components/whatsapp";

// Dentro do return
<WhatsAppFloat />
```

## Remover o Componente

Para remover o botão do WhatsApp:

1. Remova a importação no `app/layout.tsx`:
```tsx
// import { WhatsAppFloat } from "@/components/whatsapp"; // Remover
```

2. Remova o componente do JSX:
```tsx
// <WhatsAppFloat /> // Remover
```

