# Task 2: Desktop shell

Khung "hệ điều hành" ThạchOS: hình nền, thanh hệ thống, icon trên desktop. Chưa có cửa sổ (đó là task 3). Mục tiêu là nhìn vào đã thấy cá tính, không giống template.

## Thành phần

1. **Desktop**: chiếm toàn màn hình, có hình nền (gradient hoặc ảnh nhẹ, < 200 KB).
2. **Thanh hệ thống** (cạnh trên hoặc dưới, agent đề xuất):
   - Bên trái: logo/tên "ThạchOS".
   - Giữa hoặc phải: danh sách cửa sổ đang mở (tạm để trống, task 3 nối vào).
   - Bên phải: đồng hồ (giờ máy người xem), nút đổi sáng/tối.
3. **Icon desktop**: About, Projects, Experience, Contact. Mỗi icon có hình + nhãn.
   - Click đơn để chọn (highlight), double-click hoặc Enter để mở.
   - Tuần này "mở" chỉ cần gọi một hàm `openApp(appId)` rỗng, task 3 sẽ hiện thực.
4. **Boot screen** (tùy chọn, tối đa 1 giây): hiện logo khi tải lần đầu trong phiên, lần sau bỏ qua.

## Thiết kế

- Đọc skill/hướng dẫn thiết kế frontend trước khi làm. Chọn một hướng thẩm mỹ rõ ràng và ghi vào `docs/design.md` (bảng màu, font, bo góc, bóng đổ).
- Màu định nghĩa bằng CSS variables / theme Tailwind, có cả chế độ sáng và tối, mặc định theo hệ thống.
- Font: tối đa 2 họ font, tự host qua `next/font`.
- Icon: SVG, không dùng emoji làm icon.

## Danh sách app

Định nghĩa một registry dùng chung trong `packages/shared`:

```ts
type AppId = "about" | "projects" | "experience" | "contact";
type AppMeta = { id: AppId; title: string; icon: string; defaultSize: { w: number; h: number } };
```

Desktop render icon từ registry này, không hard-code từng icon.

## Khả năng truy cập

- Điều hướng được bằng bàn phím: Tab qua các icon, Enter để mở.
- Icon là `<button>` có nhãn đọc được bởi screen reader.
- Tôn trọng `prefers-reduced-motion`.

## Xong khi

- [ ] Desktop hiển thị đúng ở 1280px và 1920px.
- [ ] Đổi sáng/tối hoạt động, lưu lựa chọn vào localStorage (bọc try/catch).
- [ ] Có test render: đủ 4 icon, Enter trên icon gọi `openApp` với đúng `appId`.
- [ ] `docs/design.md` đã có.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass.
