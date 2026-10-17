# ThạchOS – Portfolio xuyên thấu

Portfolio của Bùi Công Thạch dưới dạng một hệ điều hành trên web: desktop giả lập với các cửa sổ kéo thả, và (từ các tuần sau) multiplayer, AI Clone và X-ray mode cho người xem nhìn thấy trace thật của hệ thống bên dưới.

**Bản production:** _sẽ cập nhật sau khi kết nối Vercel_

Chi tiết ý tưởng: [`docs/vision.md`](docs/vision.md) · Thiết kế: [`docs/design.md`](docs/design.md) · Nhật ký: [`docs/journal/`](docs/journal/)

## Cấu trúc

Monorepo pnpm + Turborepo.

| Thư mục           | Nội dung                                       |
| ----------------- | ---------------------------------------------- |
| `apps/web`        | Next.js: desktop, cửa sổ, nội dung (cổng 3000) |
| `apps/api`        | NestJS (cổng 4000)                             |
| `apps/realtime`   | Socket.IO (cổng 4001)                          |
| `apps/worker`     | BullMQ                                         |
| `packages/shared` | Zod schema, registry app, env helper           |
| `packages/db`     | Drizzle schema                                 |
| `content/`        | Nội dung MDX: profile, kinh nghiệm, project    |

## Chạy local

Cần Node.js 22 trở lên, pnpm (`corepack enable`), Docker.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env   # tương tự cho apps/api, apps/realtime, apps/worker, packages/db
docker compose -f infra/docker-compose.yml up -d   # Postgres (5433), Redis (6379)
pnpm dev                                           # http://localhost:3000
```

Chỉ cần xem web thì không cần Docker: `pnpm turbo dev --filter=@portfolio/web` (turbo build `packages/shared` trước).

## Kiểm tra

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm test:e2e     # Playwright: build production rồi chạy ở cổng 3100
```

Sửa nội dung trong `content/`: frontmatter sai thì `pnpm build` báo lỗi kèm tên file và field.
