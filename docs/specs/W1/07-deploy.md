# Task 7: Deploy

Đưa `apps/web` lên Vercel. Các service api, realtime, worker **chưa deploy** tuần này (tuần 3 mới cần).

## Việc cần làm

- Kết nối repo GitHub với Vercel, Root Directory là `apps/web`, build bằng Turborepo (`turbo build --filter=@portfolio/web`).
- Mỗi PR có một preview deployment, link hiện trong PR.
- Merge vào `main` → deploy production.
- Biến môi trường cần cho web khai báo trong Vercel và cập nhật `apps/web/.env.example` cho khớp. Không có secret nào trong repo.
- Web hiện chưa gọi api; nếu có code gọi api thì phải chạy được khi api không có mặt (ẩn tính năng, không crash).

## Thêm vào CI

Sau khi preview deploy xong, chạy test Playwright trên URL preview (job riêng, có thể làm ở tuần sau nếu tốn thời gian).

## Tên miền (tùy chọn)

Nếu chủ repo đã mua domain thì gắn vào production và cập nhật `metadataBase`, sitemap, ảnh OG theo domain thật.

## Xong khi

- [ ] Production URL hoạt động, đủ 4 app, deep link đúng.
- [ ] Một PR thử nghiệm có link preview.
- [ ] README ở gốc repo có link production và hướng dẫn chạy local ngắn gọn.
