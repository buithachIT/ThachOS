# Task 4: Các app nội dung

Nội dung bên trong 4 cửa sổ, lấy dữ liệu từ content model (task 1).

## About

- Avatar, tên, chức danh, tagline, vị trí.
- Thân `profile.mdx`.
- Khối kỹ năng: gom từ `stack` của experience và project, đếm số lần xuất hiện, hiển thị nhóm theo tần suất. Không tự gán mức độ kiểu "React 90%".
- Nút mở nhanh cửa sổ Projects và Contact (gọi `open` của store).

## Projects

- Danh sách dạng lưới: ảnh cover, tên, summary, stack. Project `featured` lên đầu.
- Click một project: chuyển sang màn chi tiết **ngay trong cửa sổ** (có nút quay lại), hiển thị case study MDX, link demo/repo.
- Lọc theo stack (chip bấm chọn), không cần ô tìm kiếm.

## Experience

- Dòng thời gian dọc, mới nhất ở trên: công ty, vị trí, khoảng thời gian, stack, thân MDX.
- Hiển thị tổng thời gian ở mỗi nơi (ví dụ "1 năm 8 tháng"), tính từ `start`/`end`.

## Contact

- Các link từ `profile.mdx`: email (mailto), GitHub, LinkedIn.
- Nút copy email vào clipboard, có thông báo đã copy.
- Chưa có form gửi tin nhắn (tuần sau nối với API).

## Chung

- Ảnh dùng `next/image`, có kích thước rõ ràng để không giật layout.
- Nội dung cuộn được bên trong cửa sổ, thanh tiêu đề luôn đứng yên.
- Mỗi app là một component riêng trong `apps/web/src/apps/<appId>/`.

## Tùy chọn (chỉ làm nếu còn dư thời gian)

App **Terminal**: gõ lệnh `help`, `whoami`, `ls projects`, `open <app>`, `clear`. Đăng ký vào registry như các app khác.

## Xong khi

- [ ] Test render cho từng app với dữ liệu mẫu.
- [ ] Test tính khoảng thời gian (có case `present`, case dưới 1 tháng).
- [ ] Mở từ About sang Projects bằng nút hoạt động đúng.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass.
