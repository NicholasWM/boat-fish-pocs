# Ornith — Whitelabel Boat Rental SaaS

SaaS whitelabel para locação de barcos de pesca e passeios. Cada cliente (tenant) opera com branding próprio, features configuráveis, dentro de uma única instância Next.js.

## 🚀 Funcionalidades

- **Multi-tenancy**: Isolamento completo de dados por tenant
- **Branding personalizado**: Logo, cores e nome por tenant
- **Feature flags**: Ative/desative módulos por tenant
- **CRUD completo**: Barcos, Reservas, Tripulação, Clientes, Pagamentos
- **Autenticação**: NextAuth com credentials provider
- **Middleware de tenant**: Resolução automática do tenant via URL

## 🛠️ Stack

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS
- **ORM**: Drizzle ORM
- **Banco**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth
- **Deploy**: Vercel / Docker

## 🤖 Modelos de IA Utilizados

Este projeto foi desenvolvido inteiramente por agentes de IA locais:

- **Ornith 1.0 35B** — Modelo principal (MoE A3B, VLM, 262k context)
- **Qwen3.8 27B** — Sub-agentes (Unsloth UD-Q2_K_XL, 10.7 GB)
- **Gemma 4 26B-A4B** — Verificação de código (A4500, 101 tok/s)

## 📁 Estrutura do Projeto

```
ornith/
├── app/
│   ├── tenant/[tenantSlug]/  ← Rotas do tenant (dashboard, bookings, etc)
│   ├── api/                  ← API routes
│   ├── auth/                 ← Login page
│   └── layout.tsx
├── components/
│   ├── layout/               ← Sidebar, Topbar, TenantWrapper
│   ├── ui/                   ← Componentes reutilizáveis
│   └── tenant/               ← TenantProvider
├── lib/
│   ├── auth/                 ← NextAuth config e session
│   ├── branding/             ← Theme do tenant
│   ├── db/                   ← Drizzle schema e client
│   └── tenant/               ← Resolver e features
├── middleware.ts              ← Tenant resolution
├── scripts/
│   └── seed.ts              ← Seed do banco
└── drizzle/                  ← Migrations
```

## 🚀 Getting Started

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

```bash
# Gerar migrations
npm run db:generate

# Aplicar migrations
npm run db:migrate

# Seed com dados de exemplo
npm run db:seed
```

### 3. Rodar desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 👥 Tenants de Exemplo

### Demo Marina
- **URL**: `/tenant/demo/dashboard`
- **Email**: `admin@demo.com`
- **Senha**: `demo123`

### Pescando Vida
- **URL**: `/tenant/pescandovida/dashboard`
- **Email**: `admin@pescandovida.com`
- **Senha**: `pescando123`

## 🔐 Autenticação

O middleware verifica automaticamente:
1. Se o tenant existe no banco
2. Se o tenant está ativo
3. Injeta headers `x-tenant-id` e `x-tenant-slug` no request

## 🎨 Branding

Cada tenant pode ter:
- **Logo**: URL da imagem
- **Cores**: Primária, secundária, accent
- **Nome**: Nome exibido no topbar

O branding é aplicado via CSS custom properties.

## 📊 Features por Tenant

Os módulos podem ser ativados/desativados por tenant:
- ✅ Bookings (Reservas)
- ✅ Fleet (Frota)
- ✅ Crew (Tripulação)
- ✅ Payments (Pagamentos)
- ✅ Customers (Clientes)

## 🗄️ Banco de Dados

### Tabelas
- `tenants` — Tenant (marca)
- `users` — Usuários do tenant
- `boats` — Barcos
- `bookings` — Reservas
- `crew_members` — Tripulação
- `customers` — Clientes
- `payments` — Pagamentos

### Isolamento
Todos os queries são scoped por `tenant_id`:
```typescript
await db.select().from(bookings)
  .where(eq(bookings.tenantId, tenantId))
```

## 🚢 Deploy

### Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://your-domain.com"
```

### Produção

```bash
npm run build
npm start
```

## 📝 Licença

MIT
