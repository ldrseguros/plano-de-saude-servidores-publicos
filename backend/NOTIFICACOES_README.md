# Sistema de Notificações por Email e WhatsApp

Este documento descreve o sistema de notificações implementado para enviar alertas automáticos quando uma adesão ao plano de saúde é finalizada.

## 📋 Funcionalidades

### ✅ Envio Automático de Notificações

- **Trigger**: Quando a etapa `APPROVAL` é completada
- **Email**: Enviado para um endereço fixo configurado (ex: adesoes@empresa.com)
- **WhatsApp**: Enviado para um número fixo configurado (ex: setor comercial)
- **Conteúdo**: Dados do cliente, plano contratado, valor, data e link para o PDF

### ✅ Múltiplos Provedores de WhatsApp

- Twilio
- MessageBird
- WhatsApp Business API
- API genérica personalizável

### ✅ Log e Monitoramento

- Registro de todas as tentativas de envio
- Status de cada notificação (PENDING, SENT, ERROR, RETRYING)
- Histórico completo por usuário
- Capacidade de reenvio para notificações que falharam

### ✅ Anexos de PDF

- Anexa automaticamente o PDF da adesão no email
- Link para download do PDF nas notificações

## 🚀 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `env.example` para `.env` e configure as variáveis:

```bash
cp env.example .env
```

#### Configurações de Email

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASSWORD="sua-senha-de-app-gmail"
EMAIL_NOTIFICACAO="adesoes@empresa.com"
```

#### Configurações de WhatsApp

```env
WHATSAPP_API_TYPE="twilio"  # ou messagebird, whatsapp-business, generic
WHATSAPP_API_URL="https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json"
WHATSAPP_API_KEY="your_twilio_auth_token"
WHATSAPP_NUMERO_ORIGEM="+5511999999999"
WHATSAPP_NUMERO_DESTINO="+5511888888888"
```

### 2. Configuração do Gmail

Para usar o Gmail como provedor SMTP:

1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma senha de app específica:
   - Vá para: Conta Google > Segurança > Senhas de app
   - Selecione "E-mail" e "Outro dispositivo personalizado"
   - Use a senha gerada na variável `EMAIL_PASSWORD`

### 3. Configuração de Provedores WhatsApp

#### Twilio

```env
WHATSAPP_API_TYPE="twilio"
WHATSAPP_API_URL="https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json"
WHATSAPP_API_KEY="your_auth_token"
WHATSAPP_NUMERO_ORIGEM="whatsapp:+14155238886"  # Twilio Sandbox
WHATSAPP_NUMERO_DESTINO="whatsapp:+5511999999999"
```

#### MessageBird

```env
WHATSAPP_API_TYPE="messagebird"
WHATSAPP_API_URL="https://conversations.messagebird.com/v1/conversations/CONVERSATION_ID/messages"
WHATSAPP_API_KEY="your_access_key"
```

#### WhatsApp Business API

```env
WHATSAPP_API_TYPE="whatsapp-business"
WHATSAPP_API_URL="https://graph.facebook.com/v17.0/PHONE_NUMBER_ID"
WHATSAPP_API_KEY="your_permanent_token"
```

## 📡 API Endpoints

### Teste de Configuração

```http
GET /api/notifications/test/email
GET /api/notifications/test/whatsapp
GET /api/notifications/test/all
```

### Histórico de Notificações

```http
GET /api/notifications/user/:userId/history?limit=20
```

### Reenvio de Notificações

```http
POST /api/notifications/user/:userId/resend
```

### Envio Manual

```http
POST /api/notifications/user/:userId/send
Content-Type: application/json

{
  "documentId": "uuid-do-documento-pdf" // opcional
}
```

## 🔧 Como Funciona

### Fluxo Automático

1. **Usuário completa a etapa APPROVAL**
2. **Sistema busca o PDF mais recente** gerado para o usuário
3. **Coleta dados da adesão** (nome, email, plano, valor, etc.)
4. **Cria logs de notificação** no banco de dados
5. **Envia email e WhatsApp** de forma assíncrona
6. **Atualiza status** dos logs conforme sucesso/falha

### Estrutura dos Dados

#### Email

- **Para**: Endereço configurado em `EMAIL_NOTIFICACAO`
- **Assunto**: "Nova adesão realizada"
- **Corpo**: HTML formatado com dados da adesão
- **Anexo**: PDF do contrato (se disponível)

#### WhatsApp

- **Para**: Número configurado em `WHATSAPP_NUMERO_DESTINO`
- **Formato**: Texto com emojis e formatação markdown
- **Conteúdo**: Nome, plano, valor, data

### Tratamento de Erros

- **Falhas de envio não interrompem** o fluxo principal de adesão
- **Logs detalhados** de todos os erros
- **Capacidade de reenvio** para notificações que falharam
- **Timeout configurável** para evitar travamentos

## 🗄️ Banco de Dados

### Tabela `notification_logs`

```sql
CREATE TABLE notification_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- EMAIL, WHATSAPP
  status TEXT NOT NULL, -- PENDING, SENT, ERROR, RETRYING
  message TEXT NOT NULL,
  data JSONB,          -- Dados enviados
  response_data JSONB, -- Resposta do provedor
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🧪 Testes

### Testar Configuração de Email

```bash
curl http://localhost:3001/api/notifications/test/email
```

### Testar Configuração de WhatsApp

```bash
curl http://localhost:3001/api/notifications/test/whatsapp
```

### Enviar Notificação de Teste

```bash
curl -X POST http://localhost:3001/api/notifications/user/USER_ID/send \
  -H "Content-Type: application/json" \
  -d '{"documentId": "DOCUMENT_ID"}'
```

## 🐛 Solução de Problemas

### Email não está sendo enviado

1. Verifique as credenciais SMTP
2. Teste a configuração: `GET /api/notifications/test/email`
3. Verifique os logs do servidor
4. Confirme que a senha de app está correta (Gmail)

### WhatsApp não está sendo enviado

1. Verifique as credenciais da API
2. Teste a configuração: `GET /api/notifications/test/whatsapp`
3. Confirme que o número de destino está no formato correto
4. Verifique se o provedor está ativo

### PDF não está sendo anexado

1. Verifique se o PDF foi gerado corretamente
2. Confirme permissões de leitura do arquivo
3. Verifique o caminho do arquivo no banco de dados

## 📊 Monitoramento

### Logs de Console

O sistema gera logs detalhados para monitoramento:

```
Iniciando envio de notificações para usuário abc123
Usuário encontrado: João da Silva
Documento encontrado: adesao-joao.pdf
PDF lido com sucesso: 1234567 bytes
Dados do plano extraídos: { nome: 'Plano Premium', valor: 'R$ 350,00' }
Email enviado com sucesso: <message-id>
WhatsApp enviado com sucesso: whatsapp-123456
Notificações processadas: 2/2 enviadas com sucesso
```

### Métricas Disponíveis

- Total de notificações enviadas
- Taxa de sucesso por tipo (email/WhatsApp)
- Tempo médio de envio
- Notificações com erro para reenvio

## 🔒 Segurança

- **Senhas criptografadas** em variáveis de ambiente
- **Timeout configurável** para evitar ataques de negação de serviço
- **Rate limiting** nas APIs de teste
- **Logs sanitizados** (sem dados sensíveis)

## 🚀 Deployment

1. Configure todas as variáveis de ambiente no servidor
2. Execute as migrações: `npx prisma migrate deploy`
3. Reinicie o servidor
4. Teste as configurações usando os endpoints de teste

## 📈 Próximas Funcionalidades

- [ ] Templates personalizáveis para email e WhatsApp
- [ ] Notificações por SMS
- [ ] Dashboard de monitoramento
- [ ] Webhook para notificações em tempo real
- [ ] Integração com Slack/Teams
- [ ] Notificações push para mobile
