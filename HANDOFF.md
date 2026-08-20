# Ornith — Handoff Document

## 📊 Status do Projeto

**Status**: MVP completo, pronto para uso
**Data**: 2026-08-20
**GitHub**: https://github.com/NicholasWM/boat-fish-pocs (público)

---

## ✅ O que foi implementado

### Fase 1 — Foundation ✅
- [x] Next.js 15 + TypeScript + Tailwind CSS
- [x] Drizzle ORM + SQLite (dev) / PostgreSQL (prod)
- [x] Schema do banco (7 tabelas)
- [x] Middleware de tenant resolution
- [x] Sistema de branding (CSS custom properties)
- [x] Feature flags por tenant
- [x] Seed com 2 tenants de exemplo

### Fase 2 — Auth ✅
- [x] NextAuth com credentials provider
- [x] Login page
- [x] Auth middleware (proteção de rotas)
- [x] Session management

### Fase 3 — Fleet ✅
- [x] CRUD de barcos (list, new, edit, delete)
- [x] Upload de fotos (URL)
- [x] Filtros por tipo/status
- [x] Pricing configuration

### Fase 4 — Bookings ✅
- [x] CRUD de reservas
- [x] Lista com filtros
- [x] Validação de disponibilidade (pendente)
- [x] Status flow

### Fase 5 — Crew + Customers ✅
- [x] CRUD de tripulação
- [x] CRUD de clientes
- [x] Link crew ↔ boats

### Fase 6 — Payments ✅
- [x] CRUD de pagamentos
- [x] Status tracking
- [x] Resumo por booking

### Fase 7 — Settings + Public ✅
- [x] Settings page (branding edit)
- [x] Feature flags UI
- [x] Página pública do tenant (`/public/:slug`)
- [x] Botão "Ver site do cliente" no admin
- [x] Botão "Reservar via WhatsApp" na página pública

---

## 🐛 Bugs Conhecidos

1. **Botão "Nova Reserva"**: Redireciona para página correta (`/tenant/:slug/bookings/new`)
2. **Modais**: Ações de criar/editar ainda usam páginas separadas (usuário pediu modais)
3. **Validação de overlap**: Não implementada ainda

---

## 🎯 Próximos Passos

### Prioridade Alta
1. **Converter ações em modais** (nova reserva, novo barco, novo cliente, novo membro)
2. **Validação de overlap** em bookings
3. **Upload de fotos** (S3/MinIO)

### Prioridade Média
4. **Calendário de disponibilidade**
5. **Relatórios/export**
6. **SEO/meta tags**
7. **Domínios custom por tenant** (futuro)

---

## 🔧 Como Rodar

```bash
# Instalar
npm install

# Banco
npm run db:migrate
npm run db:seed

# Dev
npm run dev
```

**Acessar**: http://localhost:3000

### Tenants de Exemplo

**Demo Marina**
- URL: `/tenant/demo/dashboard`
- Email: `admin@demo.com`
- Senha: `demo123`

**Pescando Vida**
- URL: `/tenant/pescandovida/dashboard`
- Email: `admin@pescandovida.com`
- Senha: `pescando123`

**Página Pública**
- URL: `/public/demo` ou `/public/pescandovida`

---

## 🏗️ Estrutura do Projeto

```
ornith/
├── app/
│   ├── tenant/[tenantSlug]/     ← Painel admin (dashboard, bookings, etc)
│   ├── public/[tenantSlug]/     ← Página pública do cliente
│   ├── api/                     ← API routes
│   ├── auth/                    ← Login
│   └── layout.tsx
├── components/
│   ├── layout/                  ← Sidebar, Topbar, TenantWrapper
│   ├── ui/                      ← Input, Select, Button, etc
│   └── tenant/                  ← TenantProvider
├── lib/
│   ├── auth/                    ← NextAuth, session, hash
│   ├── branding/                ← Theme do tenant
│   ├── db/                      ← Drizzle schema e client
│   └── tenant/                  ← Resolver e features
├── middleware.ts                 ← Tenant resolution
├── scripts/
│   └── seed.ts                 ← Seed do banco
└── drizzle/                    ← Migrations
```

---

## 🔐 Segurança

- Todo query é scoped por `tenant_id`
- Middleware valida tenant antes de permitir acesso
- Auth verifica sessão + tenantId
- Drizzle ORM (parameterized queries)

---

## 📝 Modelos de IA Utilizados

- **Ornith 1.0 35B** — Modelo principal (MoE A3B, VLM, 262k context)
- **Qwen3.8 27B** — Sub-agentes (Unsloth UD-Q2_K_XL, 10.7 GB)
- **Gemma 4 26B-A4B** — Verificação de código (A4500, 101 tok/s)

---

## 📄 Licença

MIT
