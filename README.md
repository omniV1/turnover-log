# Turnover Log

Digital shift handoff board for maintenance teams — open discrepancies, equipment tags, severity, and sign-off.

## Stack

- **API:** ASP.NET Core 8, EF Core, SQL Server (LocalDB), Swagger
- **Client:** React 18, TypeScript, Vite, Tailwind CSS
- **Auth:** JWT login/register (optional demo accounts in README for local try-out)
- **Notifications:** Supervisor email on handoff open/close (SMTP or local outbox in dev)
- **Tests:** xUnit integration tests (`server/TurnoverLog.Api.Tests`)
- **Deploy:** Vercel (client) + Render (API + PostgreSQL) — see [docs/DEPLOY.md](docs/DEPLOY.md)

### Optional demo login (local / portfolio)

The API seeds **accounts only** — no sample handoffs. The board stays empty until you add entries.

| Role | Email | Password |
| --- | --- | --- |
| Technician | `demo@turnover.local` | `Demo1234!` |
| Supervisor | `supervisor@turnover.local` | `Demo1234!` |

Handoff routes require a Bearer token. `/api/health` stays public.

### Supervisor notifications (no SMTP required)

Each technician registers with a **supervisor email**. When a handoff is **opened** or **closed**, the API saves an alert to the **supervisor inbox** (database).

**Supervisors:** sign in with the same email your team lists (demo: `supervisor@turnover.local` / `Demo1234!`) and open **Supervisor inbox** at the top of the app.

**Optional email:** set `Email__SmtpHost` (and credentials) only if you have SMTP later — otherwise leave it empty on Render and Vercel.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- SQL Server LocalDB (included with Visual Studio) or SQL Server Express  
- Production API uses **PostgreSQL** on Render (configured automatically via `DATABASE_URL`)

## Local development

### 1. API

```powershell
cd server/TurnoverLog.Api
dotnet run
```

- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  

Migrations run automatically on startup in Development.

### Tests

```powershell
dotnet test TurnoverLog.sln
```

Uses an in-memory database and a fake email sender — no SQL Server or SMTP required. CI runs the same suite on every push.

### 2. Client

```powershell
cd client
npm install
npm run dev
```

- UI: http://localhost:5173  
- Vite proxies `/api` → `http://localhost:5000`

## Repository layout

```
turnover-log/
├── client/                      # React + Vite
├── server/TurnoverLog.Api/      # ASP.NET Core Web API
├── server/TurnoverLog.Api.Tests/ # xUnit integration tests
├── TurnoverLog.sln
└── .github/workflows/           # CI
```

## Deploy

| Service | Host |
| --- | --- |
| React SPA | [Vercel](https://vercel.com) (`client/`, set `VITE_API_URL`) |
| API + DB | [Render](https://render.com) (`render.yaml` blueprint) |

Step-by-step: **[docs/DEPLOY.md](docs/DEPLOY.md)**

## Portfolio

**One-liner:** Live maintenance shift handoff board — technicians log open work with equipment tags and priority; supervisors see open/close updates in-app without SMTP.

**Resume bullet:** Built and deployed Turnover Log, a full-stack shift handoff app (React, ASP.NET Core 8, PostgreSQL, JWT) with supervisor inbox notifications, xUnit integration tests, and CI — live at [turnover-log.vercel.app](https://turnover-log.vercel.app).

**Talking points:**
- Domain shaped by F-22 maintenance background — turnover at crew change, not generic task tracking
- Supervisor path works without email infrastructure (DB inbox first; SMTP optional)
- Same patterns as production work: REST API, auth, migrations, split deploy (Vercel + Render), automated tests

## License

Private portfolio / learning project.
