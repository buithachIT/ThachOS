# Kế hoạch: Task 2 – Desktop shell

Spec: `docs/specs/W1/02-desktop-shell.md`

## Quyết định

- **Hướng thẩm mỹ: "bản vẽ kỹ thuật".** Nền giấy kẻ lưới (sáng) và blueprint xanh đậm (tối), viền mực mảnh, bóng đổ cứng không mờ, chữ mono cho nhãn. X-ray (tuần 7) cũng biến giao diện thành bản vẽ kỹ thuật, nên giao diện thường và X-ray nói cùng một ngôn ngữ. Chi tiết ở `docs/design.md`.
- **Thanh hệ thống ở cạnh trên:** task 6 đặt tên ThạchOS và đồng hồ ở trên màn hình điện thoại, nên hai chế độ dùng chung bố cục.
- **Hình nền:** lưới vẽ bằng CSS gradient, 0 KB ảnh.
- **Font:** IBM Plex Sans + IBM Plex Mono qua `next/font/google` (tự host lúc build). Thay Geist mặc định.
- **Sáng/tối:** CSS variables trên `:root`, mặc định theo `prefers-color-scheme`. Lựa chọn của người xem lưu vào `localStorage` (bọc try/catch) và gắn `data-theme` lên `<html>`. Có script inline nhỏ trong `<head>` để áp theme trước khi render, tránh nháy màu.
- **Đồng hồ:** chỉ render phía client (`useSyncExternalStore` với server snapshot `null`) để không lệch hydration; cập nhật theo phút.
- **Registry:** `packages/shared/src/apps.ts` gồm `AppId`, `AppMeta` và danh sách `APPS`. `icon` là khóa chuỗi, web ánh xạ sang component SVG.
- **Icon desktop:** `<button>`. Click đơn để chọn, double-click hoặc Enter để mở; click vào nền thì bỏ chọn. `openApp(appId)` tạm là hàm rỗng trong `src/desktop/open-app.ts`, task 3 sẽ thay.
- **Bỏ boot screen** (tùy chọn): không thêm gì cho người xem mà làm chậm lần tải đầu, ảnh hưởng mục tiêu Lighthouse ≥ 90.
- `lang="vi"` và metadata "ThạchOS": làm luôn vì chỉ là một dòng.

## Việc cần làm

1. Registry trong shared và export.
2. `globals.css`: token màu sáng/tối, theme Tailwind, nền lưới, `prefers-reduced-motion`.
3. `layout.tsx`: font, `lang="vi"`, script theme.
4. `src/desktop/`: `Desktop`, `SystemBar`, `Clock`, `ThemeToggle`, `DesktopIcons`, `icons.tsx`, `theme.ts`.
5. Test (Vitest + Testing Library + jsdom): đủ 4 icon; Enter gọi `openApp` đúng `appId`; double-click mở, click đơn chỉ chọn; đổi theme lưu `localStorage` và không lỗi khi `localStorage` ném lỗi.
6. Chụp màn hình bằng Chrome headless ở 1280px và 1920px, cả sáng lẫn tối.
7. Xoá các SVG mẫu của Next trong `public/`.

## Thư viện mới (web, dev)

`@testing-library/react`, `@testing-library/user-event`, `jsdom`.
