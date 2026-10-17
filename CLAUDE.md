# Portfolio xuyên thấu

Portfolio dạng desktop giả lập, multiplayer, có X-ray mode (phím X) cho người xem nhìn thấy trace thật của hệ thống bên dưới.
Đọc docs/vision.md trước khi làm task tính năng: các khu, app nào phụ trách khu nào, nguyên tắc, những điểm chưa chốt.
X-ray phải là dữ liệu thật: không mock trace; endpoint, socket event và job mới đều phải quan sát được.

- Monorepo pnpm + Turborepo. Apps: web (Next.js), api (NestJS), realtime (Socket.IO), worker (BullMQ).
- Mọi schema/type dùng chung nằm ở packages/shared (Zod). Không import chéo giữa các app.
- Packages: tsconfig (base config), shared (Zod, env helper, socket events), db (Drizzle schema + migration).
- Chạy local: docker compose -f infra/docker-compose.yml up -d && pnpm dev
- Port: web 3000, api 4000, realtime 4001, Postgres 5433 (host), Redis 6379.
- TypeScript khóa ở bản 6 qua catalog (pnpm-workspace.yaml), chưa nâng lên 7 cho tới khi Nest, Next và ts-jest hỗ trợ. Thêm package mới thì dùng `"typescript": "catalog:"`.
- Env validate bằng Zod lúc khởi động; mỗi app có .env.example.
- Trước khi báo xong: pnpm lint && pnpm typecheck && pnpm test phải pass.
- Commit theo Conventional Commits. Mỗi PR một tính năng nhỏ.
- Không commit .env, không đổi port mặc định.
