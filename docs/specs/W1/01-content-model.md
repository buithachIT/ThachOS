# Task 1: Content model

Nội dung (giới thiệu, project, kinh nghiệm, liên hệ) nằm trong file MDX ở `content/`, không nằm trong code hay database. Sau này AI Clone cũng đọc chính những file này để trả lời (RAG), nên cấu trúc phải rõ ràng ngay từ đầu.

## Cấu trúc thư mục

```
content/
├── profile.mdx            # tên, chức danh, giới thiệu, avatar, link mạng xã hội
├── experience/
│   └── <slug>.mdx         # mỗi công ty/vị trí một file
└── projects/
    └── <slug>.mdx         # mỗi project một file
```

## Frontmatter

`profile.mdx`:

```yaml
name: Bùi Thạch
title: Fullstack Developer
tagline: Một câu giới thiệu ngắn
location: Hồ Chí Minh
avatar: /images/avatar.jpg
links:
  github: https://github.com/...
  linkedin: https://linkedin.com/in/...
  email: ...
```

Thân file: đoạn giới thiệu dài (Markdown).

`experience/<slug>.mdx`:

```yaml
company: Tên công ty
role: Vị trí
start: 2023-04 # YYYY-MM
end: present # YYYY-MM hoặc present
stack: [Next.js, NestJS, PostgreSQL]
```

Thân file: việc đã làm, thành tựu (bullet).

`projects/<slug>.mdx`:

```yaml
title: Tên project
summary: Một câu mô tả
stack: [Next.js, Socket.IO]
role: Fullstack
year: 2025
links:
  demo: https://...
  repo: https://...
cover: /images/projects/<slug>.png
featured: true
order: 1
```

Thân file: case study theo khung Vấn đề → Giải pháp → Kết quả.

## Yêu cầu

- Zod schema cho từng loại frontmatter đặt trong `packages/shared` (`profileSchema`, `experienceSchema`, `projectSchema`) và export type tương ứng.
- Một module loader trong `apps/web` (ví dụ `src/lib/content.ts`): đọc file, parse frontmatter, validate bằng schema, trả về dữ liệu đã có type. Chỉ chạy phía server.
- Frontmatter sai thì **build fail** với thông báo rõ file nào, field nào. Không được im lặng bỏ qua.
- Render phần thân MDX. Agent đề xuất thư viện trong plan (ví dụ `next-mdx-remote` hoặc `@next/mdx` kèm `gray-matter`), chọn cái nhẹ, chạy được với Server Components.
- Tạo nội dung mẫu: `profile.mdx`, 2 file experience, 3 file project. Ghi rõ `[PLACEHOLDER]` ở những chỗ chủ repo cần điền thông tin thật.

## Xong khi

- [ ] Có test cho loader: file hợp lệ parse đúng; file thiếu field bắt buộc thì báo lỗi kèm tên file.
- [ ] Project sắp xếp theo `order`, experience sắp theo `start` mới nhất trước.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass.
