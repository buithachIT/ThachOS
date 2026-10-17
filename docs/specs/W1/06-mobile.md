# Task 6: Giao diện điện thoại

Cửa sổ kéo thả không dùng được trên màn hình nhỏ. Dưới 768px, ThạchOS chuyển sang chế độ "điện thoại".

## Hành vi

- Màn hình chính: lưới icon app (giống home screen), tên ThạchOS và đồng hồ ở trên.
- Chạm icon → app mở **toàn màn hình**, có thanh trên với nút quay lại và tên app.
- Chỉ một app hiển thị tại một thời điểm. Quay lại về màn hình chính.
- Deep link (task 5) vẫn hoạt động: vào `/projects` trên điện thoại thì mở thẳng app Projects.
- Nút Back của trình duyệt/điện thoại đóng app, không thoát khỏi trang.

## Kỹ thuật

- Dùng **chung** store cửa sổ và registry app, chỉ khác lớp hiển thị. Không nhân đôi logic.
- Chọn chế độ theo kích thước viewport, đổi được khi xoay màn hình hoặc kéo cửa sổ trình duyệt.
- Vùng chạm tối thiểu 44×44px.
- Không có hiệu ứng hover-only: mọi thứ hover mới thấy thì trên điện thoại phải hiện sẵn.

## Xong khi

- [ ] Test Playwright ở viewport 390×844: mở Projects, vào chi tiết, Back về danh sách, Back về màn hình chính.
- [ ] Không có thanh cuộn ngang ở bất kỳ app nào.
- [ ] Lighthouse mobile trang chủ: Performance và Accessibility ≥ 90.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass.
