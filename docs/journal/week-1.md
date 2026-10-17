# Nhật ký tuần 1

## Task 1: Content model

- **Đã làm:** Zod schema trong `packages/shared`; loader trong `apps/web/src/lib/content/` (gom mọi lỗi theo dạng file: field rồi mới throw); `renderMdx` dùng `@mdx-js/mdx`; script `content:check` chạy trước `next build`; nội dung thật từ CV (profile, 3 experience, 3 project); Vitest cho web (11 test).
- **Vướng:**
  - CV trong `docs/private/` có thêm 1 byte xuống dòng ở đầu file nên công cụ đọc PDF không nhận ra; phải bỏ byte đó trên một bản sao tạm.
  - Package web là CommonJS, nên script validate có top-level await phải là `.mts`. Lần thử "build fail" đầu tiên fail vì lỗi này chứ không phải vì nội dung sai; suýt kết luận nhầm là đạt.
  - Agent `reviewer` không nạp được trong phiên đang chạy; dùng agent `general-purpose` với prompt lấy từ `.claude/agents/reviewer.md`.
- **Review:** ĐẠT ở vòng 1. Áp dụng 2 gợi ý: bỏ `GraphQL` khỏi stack Trustify vì CV không ghi; chuyển `zod` của web sang devDependencies.
