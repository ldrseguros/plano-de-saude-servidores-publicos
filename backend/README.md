# Brasil Saúde Servidor - Backend CRM

Sistema de CRM para gestão de planos de saúde para servidores públicos municipais de Anicuns, Goiás.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados (Neon)
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Limitação de requisições

## 📋 Funcionalidades

### Sistema de Leads

- ✅ Criação e gestão de leads/usuários
- ✅ Sistema de status por cores:
  - 🟢 **Verde**: Adesão confirmada e completa
  - 🟡 **Amarelo**: Adesão iniciada mas não finalizada
  - 🔴 **Vermelho**: Não iniciou ou abandonou o processo

### Gestão de Adesão

- ✅ 7 etapas do processo de adesão:
  1. **PERSONAL_DATA** - Dados pessoais
  2. **DEPENDENTS_DATA** - Dados dos dependentes
  3. **PLAN_SELECTION** - Escolha do plano
  4. **DOCUMENTS** - Documentos
  5. **PAYMENT** - Pagamento
  6. **ANALYSIS** - Análise
  7. **APPROVAL** - Aprovação

### Dashboard e Analytics

- ✅ Estatísticas em tempo real
- ✅ Distribuição por status
- ✅ Taxa de conversão
- ✅ Atividades recentes
- ✅ Distribuição por etapas

### Gestão de Dependentes

- ✅ Adicionar/editar/remover dependentes
- ✅ Tipos de plano por dependente
- ✅ Relacionamento familiar

### Logs de Atividade

- ✅ Rastreamento completo de ações
- ✅ Histórico detalhado por usuário
- ✅ Tipos de atividade categorizados

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### Users

- Dados pessoais e profissionais
- Status do lead e etapa atual
- Controle de atividade

#### Dependents

- Informações dos dependentes
- Relacionamento familiar
- Tipo de plano escolhido

#### UserEnrollmentSteps

- Controle das 7 etapas de adesão
- Status de conclusão
- Dados específicos por etapa

#### ActivityLogs

- Histórico completo de atividades
- Detalhes em JSON
- Rastreamento temporal

### Enums

- **LeadStatus**: GREEN, YELLOW, RED
- **PlanType**: WARD, PRIVATE_ROOM, DENTAL
- **EnrollmentStep**: 7 etapas do processo
- **ActivityType**: 8 tipos de atividade

## 🛠️ Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL (Neon)
- npm ou yarn

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração do Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"

# JWT
JWT_SECRET="brasil_saude_servidor_jwt_secret_key_2024"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configuração do Banco de Dados

#### Gerar o Prisma Client

```bash
npm run db:generate
```

#### Executar Migrações

```bash
npm run db:migrate
```

#### Popular com Dados de Exemplo

```bash
npm run db:seed
```

### 4. Executar o Servidor

#### Desenvolvimento

```bash
npm run dev
```

#### Produção

```bash
npm start
```

## 📡 API Endpoints

### Health Check

```
GET /health - Status do sistema e conexão com banco
```

### Usuários/Leads

```
POST   /api/users              - Criar novo lead
GET    /api/users              - Listar leads (com filtros e paginação)
GET    /api/users/:id          - Obter lead específico
PUT    /api/users/:id          - Atualizar lead
PATCH  /api/users/:id/status   - Atualizar status do lead
DELETE /api/users/:id          - Deletar lead
GET    /api/users/dashboard/stats - Estatísticas do dashboard
```

### Dependentes

```
POST   /api/dependents/user/:userId - Adicionar dependente
GET    /api/dependents/user/:userId - Listar dependentes do usuário
PUT    /api/dependents/:id          - Atualizar dependente
DELETE /api/dependents/:id          - Deletar dependente
```

### Adesão

```
GET  /api/enrollment/user/:userId/steps              - Obter etapas do usuário
GET  /api/enrollment/user/:userId/progress           - Obter progresso da adesão
PUT  /api/enrollment/user/:userId/step/:step         - Atualizar etapa
POST /api/enrollment/user/:userId/step/:step/complete - Completar etapa
```

## 🔍 Filtros e Busca

### Parâmetros de Query para /api/users

- `page` - Página (padrão: 1)
- `limit` - Itens por página (padrão: 10)
- `status` - Filtrar por status (GREEN, YELLOW, RED)
- `step` - Filtrar por etapa atual
- `search` - Busca por nome, email, CPF ou telefone
- `sortBy` - Campo para ordenação (padrão: createdAt)
- `sortOrder` - Ordem (asc/desc, padrão: desc)

### Exemplo de Uso

```
GET /api/users?status=YELLOW&step=DOCUMENTS&search=joão&page=1&limit=20
```

## 🔒 Segurança

- **Helmet** - Headers de segurança
- **Rate Limiting** - Proteção contra spam
- **CORS** - Controle de origem
- **Input Validation** - Validação de dados
- **Error Handling** - Tratamento seguro de erros

## 📊 Monitoramento

### Logs

- Logs estruturados por nível
- Rastreamento de atividades
- Logs de erro detalhados

### Health Check

- Status da aplicação
- Conexão com banco de dados
- Informações do ambiente

## 🚀 Deploy

### Variáveis de Ambiente de Produção

```env
NODE_ENV=production
DATABASE_URL="sua_url_do_neon"
JWT_SECRET="chave_secreta_forte"
FRONTEND_URL="https://seu-frontend.com"
```

### Scripts Úteis

```bash
npm run db:studio    # Abrir Prisma Studio
npm run db:generate  # Gerar Prisma Client
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular banco com dados
```

## 📈 Próximas Funcionalidades

- [ ] Sistema de autenticação completo
- [ ] Upload de documentos
- [ ] Notificações por email
- [ ] Relatórios em PDF
- [ ] Integração com WhatsApp
- [ ] Sistema de backup automático
- [ ] Métricas avançadas
- [ ] API de webhooks

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

---

**Brasil Saúde Servidor** - Sistema de gestão de planos de saúde para servidores públicos de Anicuns, GO.
