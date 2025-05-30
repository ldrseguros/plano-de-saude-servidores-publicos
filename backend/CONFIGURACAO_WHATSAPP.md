# 📱 Guia de Configuração do WhatsApp com Twilio

## 🎯 **Passo a Passo para Configurar WhatsApp**

### **1. Criar Conta no Twilio**

1. Acesse: https://twilio.com
2. Clique em **"Sign up"**
3. Preencha seus dados
4. Confirme seu email e telefone

### **2. Configurar WhatsApp Sandbox**

1. No dashboard do Twilio, vá em **"Messaging"** → **"Try it out"** → **"Send a WhatsApp message"**
2. Você verá um número sandbox e um código de ativação
3. **Envie uma mensagem** do seu WhatsApp para o número sandbox com o código
   - Exemplo: `join gentle-tiger` para o número `+1 415 523 8886`

### **3. Obter Credenciais**

1. No dashboard, vá em **"Account"** → **"API keys & tokens"**
2. Copie:
   - **Account SID** (ex: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (ex: `your_auth_token_here`)

### **4. Configurar o Arquivo .env**

Adicione as seguintes variáveis no arquivo `.env`:

```env
# === CONFIGURAÇÕES WHATSAPP (TWILIO) ===
WHATSAPP_API_TYPE=twilio
WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TO=whatsapp:+5562999647923
```

### **5. Testar a Configuração**

Execute o teste para verificar se tudo está funcionando:

```bash
# No diretório backend
node teste-notificacao.js
```

## 🔧 **Configurações Detalhadas**

### **Para Ambiente de Teste (Sandbox):**

```env
WHATSAPP_API_TYPE=twilio
WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM=whatsapp:+14155238886    # Número sandbox do Twilio
WHATSAPP_TO=whatsapp:+5562999647923    # SEU número (deve estar ativado no sandbox)
```

### **Para Ambiente de Produção (Após Aprovação):**

```env
WHATSAPP_API_TYPE=twilio
WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM=whatsapp:+5511999999999  # Seu número aprovado pelo WhatsApp
WHATSAPP_TO=whatsapp:+5562333344444    # Número para receber notificações
```

## 📋 **Números de Teste Disponíveis**

O Twilio oferece diferentes números sandbox por região:

| País           | Número Sandbox    | Formato Para .env       |
| -------------- | ----------------- | ----------------------- |
| Estados Unidos | +1 415 523 8886   | whatsapp:+14155238886   |
| Brasil         | +55 11 9xxxx-xxxx | whatsapp:+5511xxxxxxxxx |
| Global         | +1 415 523 8886   | whatsapp:+14155238886   |

## ⚡ **Teste Rápido**

### **1. Verificar Configuração:**

```bash
# No backend
npm test:whatsapp
```

### **2. Enviar Teste Manual:**

```bash
curl -X GET "http://localhost:5000/api/notifications/test/whatsapp"
```

### **3. Resultado Esperado:**

```json
{
  "success": true,
  "message": "WhatsApp test message sent successfully",
  "messageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

## 🚨 **Troubleshooting**

### **Erro 401 - Unauthorized**

- ✅ Verifique se `WHATSAPP_ACCOUNT_SID` e `WHATSAPP_AUTH_TOKEN` estão corretos
- ✅ Confirme que não há espaços extras nas variáveis
- ✅ Teste as credenciais no dashboard do Twilio

### **Erro 21614 - 'To' number is not a valid WhatsApp number**

- ✅ Verifique se seu número está ativado no sandbox
- ✅ Confirme o formato: `whatsapp:+5562999647923`
- ✅ Envie novamente a mensagem de ativação para o sandbox

### **Erro 21612 - The 'From' number is not a valid WhatsApp number**

- ✅ Use o número sandbox exato fornecido pelo Twilio
- ✅ Formato: `whatsapp:+14155238886`

### **Erro 21408 - Permission to send an SMS has not been enabled**

- ✅ Certifique-se de estar usando WhatsApp, não SMS
- ✅ Prefixe os números com `whatsapp:`

## 💰 **Custos**

### **Sandbox (Gratuito):**

- ✅ Ilimitado para testes
- ❌ Apenas números pré-ativados
- ❌ Marca "sandbox" nas mensagens

### **Produção:**

- 💵 ~R$ 0,30 por mensagem
- ✅ Qualquer número do WhatsApp
- ✅ Mensagens profissionais
- ✅ Templates personalizados

## 🎉 **Próximos Passos**

1. **✅ Configure o sandbox** e teste
2. **✅ Submeta seu número** para aprovação do WhatsApp Business
3. **✅ Configure templates** de mensagem personalizados
4. **✅ Monitore os logs** de entrega

## 📞 **Suporte**

- 📧 **Email:** suporte@empresa.com
- 💬 **WhatsApp:** +55 62 9999-99999
- 🌐 **Twilio Docs:** https://www.twilio.com/docs/whatsapp

---

**🔔 Lembre-se:** Após configurar, as notificações serão enviadas automaticamente quando uma adesão for aprovada!
