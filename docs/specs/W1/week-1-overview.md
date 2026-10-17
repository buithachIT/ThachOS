# Tuần 1–2: Desktop shell + nội dung

Mục tiêu: có một bản ThạchOS dùng được thật, deploy lên mạng. Người xem mở web thấy một desktop giả lập, mở được các cửa sổ About, Projects, Experience, Contact, đọc được toàn bộ nội dung kể cả trên điện thoại.

Chưa làm trong tuần này: multiplayer, AI Clone, X-ray, Control Room (các tuần sau). Nhưng code phải chừa chỗ để sau này gắn vào (xem "Định hướng cho các tuần sau").

## Các task, làm theo thứ tự

| #   | Spec                   | Phụ thuộc |
| --- | ---------------------- | --------- |
| 1   | `01-content-model.md`  | —         |
| 2   | `02-desktop-shell.md`  | —         |
| 3   | `03-window-manager.md` | 2         |
| 4   | `04-apps.md`           | 1, 3      |
| 5   | `05-routing-seo.md`    | 4         |
| 6   | `06-mobile.md`         | 4         |
| 7   | `07-deploy.md`         | 5, 6      |

Task 1 và 2 độc lập, có thể làm song song.

## Quy tắc chung cho mọi task

- Mỗi task một branch `feat/<tên-task>`, một PR, CI xanh mới merge.
- Trước khi code: đưa kế hoạch ngắn cho chủ repo duyệt.
- Code xong: gọi agent `reviewer`. CHƯA ĐẠT thì tự sửa và review lại.
- Mọi type dùng chung (schema nội dung, tên app/cửa sổ) đặt trong `packages/shared`.
- Không thêm thư viện lớn (3D, animation nặng, UI kit đầy đủ) nếu spec không nhắc. Cần thì hỏi trước.

## Định hướng cho các tuần sau (để không phải đập đi làm lại)

- Mỗi cửa sổ là một "app" có `id` cố định (`about`, `projects`, `experience`, `contact`). Sau này thêm `ai-clone`, `guestbook`, `control-room` theo cùng cơ chế.
- Mỗi app bọc trong một component boundary có tên (sau này thành `<XrayBoundary>` cho X-ray mode). Tuần này chỉ cần một wrapper đơn giản có prop `name`.
- State cửa sổ nằm trong một store riêng (Zustand), không rải trong component, để sau này đồng bộ được qua realtime.

## Xong tuần khi

- [ ] Cả 7 task đã merge vào `main`.
- [ ] Web chạy trên domain preview của Vercel.
- [ ] Lighthouse mobile: Performance và Accessibility đều ≥ 90 cho trang chủ.
- [ ] Ghi nhật ký tuần vào `docs/journal/week-1.md`: task nào agent làm tốt, task nào phải sửa nhiều, prompt nào hiệu quả.
