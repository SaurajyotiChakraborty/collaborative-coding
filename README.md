# Optimize Coder - Setup Guide

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (recommended) or npm

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd optimize-code
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- OAuth credentials (GitHub/Google)
- AI API keys (optional for question generation)

### 3. Start Services

```bash
# Start PostgreSQL, Redis, and Judge Engine
docker-compose up -d

# Run database migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Architecture

```
optimize-code/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth.js
│   │   ├── execute-code/ # Code execution
│   │   └── ...
│   ├── actions/          # Server actions
│   └── ...
├── components/            # React components
├── packages/
│   └── judge-engine/     # Code execution service
├── prisma/               # Database schema
└── lib/                  # Utilities
```

## Key Features Implemented

### ✅ Phase 1 (In Progress)
- [x] Prisma + PostgreSQL setup
- [x] Docker-based code execution
- [x] Multi-language support (JS, Python, Java, C++)
- [x] OAuth authentication (NextAuth.js)
- [x] WebSocket infrastructure
- [x] Basic UI components
- [ ] Competition lifecycle
- [ ] Leaderboard system

### 🚧 Phase 2 (Planned)
- [ ] Advanced anti-cheat
- [ ] Complexity analysis (AST + benchmarking)
- [ ] Matchmaking & MMR

### 📋 Phase 3 (Planned)
- [ ] Collaborative workspace
- [ ] Git integration

## Development

### Database

```bash
# Create migration
pnpm prisma migrate dev --name migration_name

# Reset database
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio
```

### Docker

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all services
docker-compose down
```

## Testing Code Execution

```bash
curl -X POST http://localhost:3000/api/execute-code \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "console.log(\"Hello World\")",
    "testCases": [
      {"input": "", "expectedOutput": "Hello World"}
    ]
  }'
```

## OAuth Setup

### GitHub
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

### Google
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker-compose ps`
- Check `DATABASE_URL` in `.env`
- Run migrations: `pnpm prisma migrate dev`

### Code Execution Fails
- Check judge-engine logs: `docker-compose logs judge-engine`
- Ensure Docker socket is accessible
- Verify language runtimes are installed in container

### WebSocket Not Connecting
- Check Redis is running: `docker-compose ps redis`
- Verify `REDIS_URL` in `.env`
- Check browser console for connection errors

## Production Deployment

See `docs/deployment.md` for production setup instructions.

## Contributing

See `CONTRIBUTING.md` for development guidelines.
