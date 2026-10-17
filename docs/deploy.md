# Deploy web lên Vercel

Chỉ `apps/web` được deploy. api, realtime, worker chưa deploy (tuần 3).

## Kết nối lần đầu (chủ repo làm, cần đăng nhập Vercel)

1. vercel.com → **Add New… → Project** → import repo `buithachIT/ThachOS`.
2. **Root Directory:** `apps/web`. **Node.js Version:** 22 trở lên (pnpm 11 cần, khớp `engines` ở `package.json` gốc). Framework tự nhận là Next.js. Build và install command đã khai trong `apps/web/vercel.json` (build bằng Turborepo từ gốc repo).
3. **Environment Variables:**
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1`: để Vercel dùng đúng pnpm 11 theo trường `packageManager` ở `package.json` gốc. Thiếu biến này, Vercel có thể dùng pnpm cũ hơn và bỏ qua các cài đặt `allowBuilds`/`catalog`.
   - `NEXT_PUBLIC_SITE_URL`: chỉ cần khi gắn domain riêng (ví dụ `https://thachos.dev`). Không đặt thì dùng domain production của Vercel (`VERCEL_PROJECT_PRODUCTION_URL`).
4. Deploy. Sau đó:
   - mỗi PR có một preview deployment, link hiện trong PR (Vercel GitHub app);
   - merge vào `main` thì deploy production.

## Không có secret

Web chưa gọi api; chưa cần biến bí mật nào. Danh sách biến của web nằm trong `apps/web/.env.example`.

## Kiểm tra sau khi deploy

- Production URL mở được, có đủ 4 app.
- Deep link: `/about`, `/projects/aurore` mở đúng cửa sổ; `/nope` trả 404.
- `/sitemap.xml` liệt kê URL bằng domain thật (không phải localhost).
- Cập nhật link production vào `README.md`.

## Chưa làm (tuần sau)

Chạy Playwright trên URL preview sau khi Vercel deploy xong (job CI riêng, cần `VERCEL_TOKEN` hoặc đọc deployment status của GitHub).
