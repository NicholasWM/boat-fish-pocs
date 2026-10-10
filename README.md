# Ornith — Whitelabel Boat Rental SaaS

SaaS whitelabel para locação de barcos de pesca e passeios. Cada cliente (tenant) opera com branding próprio, features configuráveis, dentro de uma única instância Next.js.

PoC escrita inteiramente por modelos de IA rodando localmente; veja [Como foi feito](#como-foi-feito).

## 🚀 Funcionalidades

- **Multi-tenancy**: Isolamento completo de dados por tenant
- **Branding personalizado**: Logo, cores e nome por tenant
- **Feature flags**: Ative/desative módulos por tenant
- **CRUD completo**: Barcos, Reservas, Tripulação, Clientes, Pagamentos
- **Autenticação**: NextAuth com credentials provider
- **Middleware de tenant**: Resolução automática do tenant via URL

## 🛠️ Stack

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS 4
- **ORM**: Drizzle ORM
- **Banco**: SQLite em arquivo local (`ornith.db`) via `@libsql/client`
- **Auth**: NextAuth (credentials provider)

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

Não há configuração de deploy (Vercel, Docker ou Postgres) no repositório: o banco é sempre o arquivo SQLite local.

### Variáveis de Ambiente

```env
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Produção

```bash
npm run build
npm start
```

## Como foi feito

Nenhuma linha foi escrita à mão. O build rodou numa única sessão do [opencode](https://opencode.ai), com modelos locais servidos por llama-swap em duas GPUs.

| Papel | Modelo | O que fez |
|---|---|---|
| Agente principal | **Ornith 1.0 35B-A3B** (MoE, Q4_K_M), também na variante com visão | Planejou as 7 fases, escreveu praticamente todo o código e corrigiu os bugs |
| Exploração | modelo de código local | Varreduras do repositório |
| Subagents | **Qwen3.8 27B Q4_K_M** (5 lanes, nas duas GPUs) | Disparados para as fases 2 a 7; **todos voltaram com resultado vazio**, e o agente principal refez o trabalho sozinho |

O que funcionou: o painel multi-tenant com as 7 tabelas escopadas por `tenant_id`, branding por CSS custom properties, feature flags por tenant, CRUD de barcos, reservas, tripulação, clientes e pagamentos, e seed com 2 tenants. O build passa.

O que o build não pegou: três bugs de rota, achados pelo dono clicando no app e depois corrigidos pelo agente principal:

1. 404 depois do login: as páginas estavam em `app/[tenantSlug]` em vez de `app/tenant/[tenantSlug]`.
2. Todo item do menu levava de volta para o login: os links da sidebar não tinham o prefixo `/tenant/:slug`.
3. O segundo tenant de exemplo não existia no seed.

Ficaram de fora: validação de sobreposição de reservas, ações em modal e upload real de foto. Depois disso foi adicionada uma página pública por tenant em `/public/[tenantSlug]`.

Uma observação sobre a autoria: versões anteriores deste README atribuíram o projeto a modelos que não rodaram nesta sessão. Isso foi texto gerado pelo próprio modelo, que não sabia quais modelos estavam em uso. Esta seção foi reescrita a partir dos registros da sessão. O Gemma não participou, e os subagents rodaram em Q4_K_M, não em Q2.

## 📝 Licença

MIT
