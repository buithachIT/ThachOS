# Kế hoạch: Task 4 – Các app nội dung

Spec: `docs/specs/W1/04-apps.md`

## Quyết định

- **Dữ liệu đi từ server:** `src/apps/build-apps.tsx` (async, chỉ chạy server) đọc content, render MDX thành React node bằng `renderMdx`, rồi trả về `AppContents` cho `page.tsx`. Các app là component đồng bộ nhận dữ liệu đã chuẩn bị sẵn, nên test render được bằng Testing Library mà không cần Server Component.
- **App:** `src/apps/<appId>/`. About, Projects, Contact là client component (có nút, state); Experience là component thường, không cần JS.
- **Khoảng thời gian:** tính theo tháng, đếm cả tháng đầu và tháng cuối (giống LinkedIn: 10/2025–02/2026 là 5 tháng). `present` tính đến tháng hiện tại; nếu bắt đầu ngay trong tháng này thì hiện "Dưới 1 tháng". Hàm thuần `formatDuration(start, end, now)`.
- **Kỹ năng:** đếm số nơi (experience + project) có công nghệ đó trong `stack`, nhóm theo số lần, nhóm nhiều nhất lên trước. Không gán phần trăm.
- **Projects:** lưới thẻ (featured lên đầu, giữ thứ tự `order`), chip lọc theo stack (chọn nhiều, khớp mọi chip đã chọn), click thẻ sang màn chi tiết trong cửa sổ có nút quay lại. Project được chọn là state cục bộ với prop `initialSlug`; task 5 nối với URL.
- **Ảnh:** dùng `next/image` với kích thước cố định khi có `avatar`/`cover`. Hiện chưa có ảnh thật, nên hiện khung "bản vẽ" (monogram cho avatar, khung gạch chéo cho cover) cùng kích thước, không giật layout.
- **Kiểu chữ MDX:** bộ component riêng (`mdx-components.tsx`) theo `docs/design.md`, không thêm `@tailwindcss/typography`.
- **Contact:** email (mailto), GitHub, LinkedIn nếu có, website; nút copy email có thông báo `aria-live`. Chưa có form.
- **Bỏ app Terminal** (tùy chọn) để ưu tiên các task còn lại.

## Xong khi

- Test render cho 4 app với dữ liệu mẫu; test `formatDuration` (có `present`, dưới 1 tháng); test About mở được Projects qua store thật.
