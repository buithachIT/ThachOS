# Task 3: Window manager

Phần lõi của ThạchOS: mở, đóng, kéo, đổi kích thước, thu nhỏ, phóng to cửa sổ. Đây là phần khó nhất của tuần, làm cẩn thận vì realtime (tuần 3) và X-ray (tuần 7) đều dựa vào nó.

## State (Zustand)

Đặt trong `apps/web/src/stores/windows.ts`. Logic thuần (không phụ thuộc React) để test dễ.

```ts
type WindowState = {
  id: string; // duy nhất, ví dụ `${appId}-${n}`
  appId: AppId;
  x: number;
  y: number; // vị trí, px
  w: number;
  h: number; // kích thước, px
  z: number; // thứ tự chồng lớp
  minimized: boolean;
  maximized: boolean;
};
```

Actions: `open(appId)`, `close(id)`, `focus(id)`, `move(id, x, y)`, `resize(id, w, h)`, `minimize(id)`, `toggleMaximize(id)`, `closeAll()`.

Quy tắc:

- Mỗi app chỉ mở **một** cửa sổ. `open` một app đang mở thì focus cửa sổ đó (bỏ minimized nếu có).
- Cửa sổ mới mở lệch dần (cascade) để không chồng khít lên nhau, và luôn nằm trong màn hình.
- `focus` đưa cửa sổ lên trên cùng. Z-index không được tăng vô hạn: chuẩn hóa lại khi vượt ngưỡng.
- Kích thước tối thiểu 320×240. Không kéo cửa sổ ra hẳn ngoài màn hình (phải còn ít nhất thanh tiêu đề trong vùng nhìn thấy).
- Khi cửa sổ trình duyệt đổi kích thước, cửa sổ nào lọt ra ngoài thì kéo vào lại.

## Component cửa sổ

- Thanh tiêu đề: icon, tên app, nút thu nhỏ / phóng to / đóng.
- Kéo bằng thanh tiêu đề, dùng Pointer Events (chạy cả chuột lẫn bút). Double-click thanh tiêu đề = phóng to/thu về.
- Đổi kích thước ở cạnh và góc.
- Trong lúc kéo, không re-render cả desktop: chỉ cửa sổ đang kéo cập nhật.
- Nội dung bọc trong `<AppBoundary name={appId}>` (wrapper đơn giản, sau này thành `XrayBoundary`).
- Lỗi trong một app không làm sập cả desktop (error boundary theo từng cửa sổ).

## Thanh hệ thống

Nối danh sách cửa sổ vào thanh hệ thống (task 2): click để focus, cửa sổ đang minimized thì khôi phục.

## Bàn phím và truy cập

- Cửa sổ có `role="dialog"` và `aria-labelledby` trỏ vào tiêu đề.
- Mở cửa sổ thì focus vào trong nó; đóng thì focus trả về icon đã mở nó.
- `Esc` đóng cửa sổ đang focus.

## Ghi nhớ bố cục

Lưu vị trí/kích thước cửa sổ vào localStorage (bọc try/catch), lần sau mở lại đúng chỗ. Không khôi phục danh sách cửa sổ đang mở, mỗi lần vào là desktop sạch.

## Không làm

- Không dùng thư viện kéo thả lớn. Nếu muốn dùng thư viện nhỏ thì nêu lý do trong plan.
- Không snap/chia đôi màn hình (để sau nếu còn thời gian).

## Xong khi

- [ ] Unit test cho store: open trùng app, cascade, chuẩn hóa z-index, kích thước tối thiểu, giữ cửa sổ trong màn hình.
- [ ] Test Playwright: mở About, kéo đi chỗ khác, đóng, mở lại thấy đúng vị trí cũ.
- [ ] Mở đủ 4 cửa sổ, kéo qua lại vẫn mượt (không giật thấy được trên máy bình thường).
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass.
