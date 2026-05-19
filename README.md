# Turnover Log

Digital shift handoff board for maintenance teams — open discrepancies, equipment tags, severity, and sign-off.

## Stack

- **API:** ASP.NET Core 8, EF Core, SQL Server (LocalDB), Swagger
- **Client:** React 18, TypeScript, Vite, Tailwind CSS
- **Auth:** JWT login/register (demo user below)
- **Planned:** xUnit tests, Azure + Vercel deploy

### Demo login

| Field | Value |
| --- | --- |
| Email | `demo@turnover.local` |
| Password | `Demo1234!` |

Handoff routes require a Bearer token. `/api/health` stays public.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- SQL Server LocalDB (included with Visual Studio) or SQL Server Express

## Local development

### 1. API

```powershell
cd server/TurnoverLog.Api
dotnet run
```

- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  

Migrations run automatically on startup in Development.

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
├── client/                 # React + Vite
├── server/TurnoverLog.Api/ # ASP.NET Core Web API
├── TurnoverLog.sln
└── .github/workflows/      # CI
```

## Git remote

Create `github.com/omniV1/turnover-log` and push:

```powershell
git remote add origin https://github.com/omniV1/turnover-log.git
git push -u origin master
```

## License

Private portfolio / learning project.
