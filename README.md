# 🎓 Studr — Plataforma Inteligente de Preparação para o ENEM

> Plataforma full-stack para preparação ao ENEM utilizando Inteligência Artificial.

---

## 📖 Visão Geral

O **Studr** é uma plataforma educacional desenvolvida para auxiliar estudantes na preparação para o ENEM através de Inteligência Artificial.

Principais recursos:

* Geração automática de questões
* Correção de redações
* Tutor IA via chat
* Simulados com TRI
* Plano de estudos personalizado
* Sistema de planos
* Painel administrativo

---

## ✨ Funcionalidades

### 🤖 IA

* Geração de questões inéditas
* Correção de redações
* Tutor conversacional
* Explicação de respostas

### 📝 Simulados

* Simulados completos
* Correção automática
* Pontuação TRI

### 🗺️ Estudos

* Plano personalizado
* Estatísticas de desempenho
* Histórico de atividades

### 👨‍💼 Administração

* Gestão de usuários
* Gestão de planos
* Dashboard administrativo

---

## 🛠 Stack

| Camada          | Tecnologia         |
| --------------- | ------------------ |
| Frontend        | React 18           |
| Linguagem       | TypeScript         |
| Build Tool      | Vite               |
| CSS             | Tailwind CSS       |
| Backend         | Node.js + Express  |
| ORM             | Prisma             |
| Banco           | PostgreSQL         |
| IA              | OpenAI GPT-4o-mini |
| Auth            | JWT                |
| Backend Deploy  | Railway            |
| Frontend Deploy | Vercel             |

---

## 🏗 Arquitetura

```text
Frontend React
      ↓
 REST API (Express)
      ↓
 Prisma ORM
      ↓
 PostgreSQL
      ↓
 OpenAI API
```

---

## 📂 Estrutura do Projeto

```text
studr/
├── client/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── types.ts
│   ├── constants.ts
│   └── App.tsx
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── index.js
│
├── documentos/
├── public/
└── package.json
```

---

## ⚙️ Variáveis de Ambiente

### `server/.env`

```env
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
PORT=3001

NODE_ENV=development

FRONTEND_URL=

KIWIFY_WEBHOOK_SECRET=
```

### `client/.env`

```env
VITE_API_URL=http://localhost:3001
```

---

## 🚀 Desenvolvimento Local

### Instalar dependências

```bash
npm install
cd server && npm install
```

### Aplicar migrações

```bash
cd server
npx prisma migrate dev
```

### Gerar cliente Prisma

```bash
npx prisma generate
```

### Executar projeto

```bash
npm run dev
```

Serviços:

| Serviço  | Porta |
| -------- | ----: |
| Frontend |  5173 |
| Backend  |  3001 |

---

## 🔐 Sistema de Autenticação

A autenticação utiliza JWT com sessão única.

Fluxo:

```text
Login
  ↓
JWT
  ↓
Middleware Auth
  ↓
Rotas Protegidas
```

Funcionalidades:

* Login
* Registro
* Renovação de sessão
* Logout
* Proteção de rotas

---

## 💳 Sistema de Planos

Planos disponíveis:

* Trial
* Premium
* Admin

A validação dos limites é feita no backend:

```text
server/services/planService.js
```

---

## 🛒 Integração Kiwify

Webhook:

```http
POST /api/webhook/kiwify
```

Eventos suportados:

* `order.approved`
* `order.refunded`

Fluxo:

```text
Kiwify
   ↓
Webhook
   ↓
Validação
   ↓
Atualização do banco
```

---

## 🔌 API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Questões

```http
POST /api/questions/generate
GET  /api/questions
```

### Redação

```http
POST /api/essay/correct
```

### Chat IA

```http
POST /api/chat/message
```

### Simulados

```http
GET  /api/mock-exams
POST /api/mock-exams/submit
```

### Administração

```http
GET  /api/admin/users
PATCH /api/admin/users/:id
DELETE /api/admin/users/:id
```

---

## 👤 Usuários de Teste

| E-mail                                          | Plano   |
| ----------------------------------------------- | ------- |
| [admin@studr.com.br](mailto:admin@studr.com.br) | Admin   |
| [trial@teste.com](mailto:trial@teste.com)       | Trial   |
| [premium@teste.com](mailto:premium@teste.com)   | Premium |

As senhas são configuradas via seed.

---

## 🌱 Seed do Banco

Executar:

```bash
npx prisma db seed
```

Caso necessário:

```bash
npx prisma migrate reset
```

---

## ☁️ Deploy

### Railway

Variáveis obrigatórias:

* DATABASE_URL
* JWT_SECRET
* OPENAI_API_KEY
* FRONTEND_URL
* KIWIFY_WEBHOOK_SECRET

Comando de inicialização:

```bash
npm start
```

Migrações:

```bash
npx prisma migrate deploy
```

---

### Vercel

Configuração:

| Campo            | Valor         |
| ---------------- | ----------
### Prisma Client desatualizado

```bash--- |
| Root Directory   | client        |
| Build Command    | npm run build |
| Output Directory | dist          |

Variável:

```env
VITE_API_URL=https://api.seudominio.com
```

---
### Prisma Client desatualizado

```bash

## 🧰 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build frontend
cd client && npm run build

# Prisma Studio
### Prisma Client desatualizado

```bash
cd server && npx prisma studio

# Gerar Prisma Client
npx prisma generate

# Nova migração
npx prisma migrate dev --name nome

# Produção
npx prisma migrate deploy

### Prisma Client desatualizado

```bash
# Reset do banco
npx prisma migrate reset

# Verificar TypeScript
cd client && npx tsc --noEmit
```

---

## 🐛 Troubleshooting

### Prisma Client desatualizado

```bash
npx prisma generate
```

### Resetar banco

```bash
npx prisma migrate reset
```

### Abrir banco visualmente

```bash
npx prisma studio
```opções

---

## 📚 Documentação

A pasta `documentos/` contém:

* Relatórios
* Homologações
* Briefings
* Documentação interna

---


---

## 📞 Contato

**Projeto:** Studr / SBM Cloud

**Responsável:** Fabio Patricio

**E-mail:** [appmagic2026@gmail.com](mailto:appmagic2026@gmail.com)

---

© 2026 Studr — Todos os direitos reservados.
