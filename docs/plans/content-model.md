# Kế hoạch: Task 1 – Content model

Spec: `docs/specs/W1/01-content-model.md`

## Quyết định

- **Frontmatter:** tách bằng regex `---` và parse bằng `yaml` (YAML 1.2, không tự đổi `2023-04` thành Date như `gray-matter`/js-yaml). Không dùng `gray-matter` vì đã lâu không cập nhật.
- **Render MDX:** `@mdx-js/mdx` (`evaluate`), là lõi mà mọi thư viện MDX khác đều bọc lại. Chạy được trong Server Component, không cần plugin cho `next.config`. Không dùng `next-mdx-remote` vì chỉ là lớp bọc thêm.
- **Ngôn ngữ nội dung:** tiếng Việt, vì task 5 yêu cầu `lang="vi"`. Thuật ngữ kỹ thuật giữ nguyên tiếng Anh.
- **Slug:** lấy từ tên file, không khai báo trong frontmatter, để tránh lệch nhau.
- **Field tùy chọn:** `avatar`, `cover`, `links.*` (trừ `email`, `github`) là optional, vì chưa có ảnh thật. Field nào chưa có dữ liệu thật thì ghi `[PLACEHOLDER]` trong comment YAML.
- **Không đưa lên web:** số điện thoại, ngày sinh (theo `CLAUDE.md`).

## Việc cần làm

1. `packages/shared/src/content.ts`: `profileSchema`, `experienceSchema`, `projectSchema` và type tương ứng. `start`/`end` dạng `YYYY-MM`, `end` có thể là `present`, và `end` phải không trước `start`.
2. `apps/web/src/lib/content/load.ts`: đọc thư mục, parse, validate, sắp xếp (project theo `order`, experience theo `start` mới nhất trước). Lỗi gom lại theo dạng `content/projects/x.mdx: title: ...`, rồi throw `ContentError`. Nhận `contentDir` làm tham số để test được.
3. `apps/web/src/lib/content/index.ts`: `import "server-only"`, gắn sẵn đường dẫn `content/` của repo.
4. `apps/web/src/lib/content/mdx.tsx`: `renderMdx(body)` trả về React element.
5. **Build fail khi frontmatter sai:** script `scripts/validate-content.ts` (chạy bằng `tsx`) chạy trước `next build`. Thêm test kiểm tra nội dung thật trong `content/`, để CI (không chạy build) cũng bắt được lỗi.
6. **Turbo:** thêm `$TURBO_ROOT$/content/**` vào inputs của `build` và `test` của web, để sửa nội dung không bị dùng cache cũ.
7. **Test (Vitest, mới cho web):** file hợp lệ; thiếu field → lỗi có tên file và tên field; sắp xếp đúng; `end` trước `start` bị bắt; nội dung thật hợp lệ.
8. **Nội dung từ CV:** `profile.mdx`; 3 experience (Conte Interior, HTX Vận Tải 9, Trustify Technology); 3 project (E-commerce Backend API, Aurore, ThạchOS). Spec nói 2 experience, nhưng CV có 3 vị trí thật nên dùng cả 3.

## Thư viện mới

- `apps/web`: `@mdx-js/mdx`, `yaml`, `server-only`, `@portfolio/shared`; dev: `vitest`, `tsx`.
