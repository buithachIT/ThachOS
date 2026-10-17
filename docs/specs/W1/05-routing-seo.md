# Task 5: Routing, deep link và SEO

Desktop là trải nghiệm phía client, nhưng nhà tuyển dụng và Google vẫn phải đọc được nội dung, và link chia sẻ phải mở đúng thứ cần xem.

## Deep link

- URL phản ánh cửa sổ đang focus:
  - `/` → desktop trống
  - `/about`, `/projects`, `/experience`, `/contact` → desktop với cửa sổ tương ứng đã mở
  - `/projects/<slug>` → cửa sổ Projects mở sẵn trang chi tiết project đó
- Mở/focus cửa sổ thì cập nhật URL (không reload trang). Bấm Back/Forward của trình duyệt thì cửa sổ thay đổi theo.
- Slug không tồn tại → 404 tùy biến theo phong cách ThạchOS (ví dụ một cửa sổ lỗi "app not found").

## SEO và chia sẻ

- Mỗi route trên **render sẵn nội dung phía server** (HTML có chữ thật), không phải trang trắng chờ JS.
- Metadata riêng cho từng route: title, description, Open Graph, Twitter card.
- Ảnh OG tạo động bằng `next/og` (tên + chức danh, hoặc tên project + summary).
- `sitemap.xml` và `robots.txt` sinh từ content.
- Có `lang="vi"` trên `<html>`.

## Khi tắt JavaScript

Không cần có desktop, nhưng phải đọc được nội dung: render một layout đơn giản (danh sách section) trong `<noscript>` hoặc dùng chính HTML server-render có sẵn.

## Xong khi

- [ ] Test Playwright: vào thẳng `/projects/<slug>` thấy đúng cửa sổ và đúng project; bấm Back quay về trạng thái trước.
- [ ] `curl` một route bất kỳ thấy nội dung chính trong HTML.
- [ ] Sitemap liệt kê đủ route project.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass.
