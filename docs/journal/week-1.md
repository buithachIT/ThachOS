# Nhật ký tuần 1

## Task 1: Content model

- **Đã làm:** Zod schema trong `packages/shared`; loader trong `apps/web/src/lib/content/` (gom mọi lỗi theo dạng file: field rồi mới throw); `renderMdx` dùng `@mdx-js/mdx`; script `content:check` chạy trước `next build`; nội dung thật từ CV (profile, 3 experience, 3 project); Vitest cho web (11 test).
- **Vướng:**
  - CV trong `docs/private/` có thêm 1 byte xuống dòng ở đầu file nên công cụ đọc PDF không nhận ra; phải bỏ byte đó trên một bản sao tạm.
  - Package web là CommonJS, nên script validate có top-level await phải là `.mts`. Lần thử "build fail" đầu tiên fail vì lỗi này chứ không phải vì nội dung sai; suýt kết luận nhầm là đạt.
  - Agent `reviewer` không nạp được trong phiên đang chạy; dùng agent `general-purpose` với prompt lấy từ `.claude/agents/reviewer.md`.
- **Review:** ĐẠT ở vòng 1. Áp dụng 2 gợi ý: bỏ `GraphQL` khỏi stack Trustify vì CV không ghi; chuyển `zod` của web sang devDependencies.

## Task 2: Desktop shell

- **Đã làm:** registry app trong `packages/shared` (kèm `appIdSchema`); desktop phong cách "bản vẽ kỹ thuật" (giấy kẻ lưới / blueprint), thanh hệ thống ở trên, đồng hồ, nút sáng/tối lưu `localStorage`, 4 icon render từ registry; `docs/design.md`; Vitest + Testing Library (10 test cho desktop). Bỏ boot screen (tùy chọn).
- **Vướng:**
  - Màu cam ban đầu `#e2531c` chỉ đạt tương phản 3.83 với chữ trắng; đổi sang `#c2410c` (5.18).
  - Icon xếp thành hàng ngang thay vì cột vì `<ul>` không có chiều cao; chỉ phát hiện nhờ chụp màn hình, test không bắt được.
  - Sau khi cài jsdom, `mdx.test.tsx` fail với lỗi khó hiểu (`reading 'config'`). Nguyên nhân: `node_modules` còn sót một virtual store cũ trong `apps/web` và 2 bản Vitest; cài lại sạch là hết. CI không bị vì luôn cài sạch.
  - Một lượt chụp màn hình vô tình lấy từ dev server của chủ repo ở cổng 3000 (thấy biểu tượng "N" của Next dev); chụp lại từ bản production ở cổng 3100.
- **Review:** ĐẠT ở vòng 1. Áp dụng 4 gợi ý: `appIdSchema`, `data-app-id` trên icon cho task 3, Esc/click chỗ trống để bỏ chọn, bỏ `suppressHydrationWarning` thừa. Để task 6: vùng chạm 44px cho nút theme.
