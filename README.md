# Turnover Log

Digital shift handoff board for maintenance teams — open discrepancies, equipment tags, severity, and sign-off.

## Stack

- **API:** ASP.NET Core 8, EF Core, SQL Server (LocalDB), Swagger
- **Client:** React 18, TypeScript, Vite, Tailwind CSS
- **Auth:** JWT login/register (demo user below)
- **Notifications:** Supervisor email on handoff open/close (SMTP or local outbox in dev)
- **Planned:** xUnit tests, Azure + Vercel deploy

### Demo login

| Field | Value |
| --- | --- |
| Email | `demo@turnover.local` |
| Password | `Demo1234!` |

Handoff routes require a Bearer token. `/api/health` stays public.

### Supervisor email notifications

Each user registers with a **supervisor email**. When a handoff is **opened** or **closed**, the API emails the supervisor with equipment tag, severity, description, who opened/closed it, UTC timestamps, and time open.

**Local dev (no SMTP):** Leave `Email:SmtpHost` empty in `appsettings.json`. Messages are written as `.eml` files under `server/TurnoverLog.Api/email-outbox/` (open in Outlook or any mail client).

**Production:** Set SMTP in `appsettings` or environment variables:

| Setting | Example |
| --- | --- |
| `Email__SmtpHost` | `smtp.sendgrid.net` |
| `Email__SmtpPort` | `587` |
| `Email__SmtpUser` / `Email__SmtpPassword` | API credentials |
| `Email__FromAddress` | `noreply@yourdomain.com` |

Demo user supervisor: `supervisor@turnover.local`.

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
