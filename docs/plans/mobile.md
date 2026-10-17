# Kế hoạch: Task 6 – Giao diện điện thoại

Spec: `docs/specs/W1/06-mobile.md`

## Quyết định

- **Chỉ đổi lớp hiển thị bằng CSS (`max-md:`)**, cùng một DOM, cùng store, cùng registry. Không render hai bộ app, nên không trùng id hay trùng nội dung. Media query đổi ngay khi xoay màn hình hay kéo cửa sổ trình duyệt, và không lệch hydration (server không cần biết kích thước màn hình).
- **Dưới 768px:**
  - Cửa sổ thành `fixed inset-0`, toàn màn hình, nằm trên thanh hệ thống. Chỉ cửa sổ trên cùng được hiện.
  - Thanh tiêu đề cao 48px: nút quay lại 44×44 + tên app. Ẩn các nút thu nhỏ, phóng to, đóng, ẩn tay nắm resize, tắt kéo thả.
  - Desktop thành lưới icon 4 cột (home screen). Ẩn taskbar và khung tên bản vẽ; thanh hệ thống giữ ThạchOS, đồng hồ và nút theme.
- **Back không thoát khỏi trang:** khi vào thẳng bằng deep link, `UrlSync` chèn `/` vào lịch sử phía trước (`replaceState('/')` rồi `pushState(path)`). Mỗi entry do ThạchOS tạo mang độ sâu trong `history.state`. Nút quay lại trong app gọi `history.back()` nếu entry trước là của mình, không thì đóng cửa sổ.
- **Vùng chạm ≥ 44px trên điện thoại** cho mọi nút và link đứng riêng (chip lọc, nút trong About/Contact/Projects, nút theme); link nằm trong đoạn văn MDX thì không bắt buộc. Không có thông tin nào chỉ hiện khi hover.
- **Playwright:** project `mobile` (390×844, touch), chạy riêng `e2e/mobile.spec.ts`.
