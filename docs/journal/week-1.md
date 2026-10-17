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

## Task 3: Window manager

- **Đã làm:** store Zustand (vanilla) + hàm hình học thuần; cửa sổ kéo/đổi kích thước bằng Pointer Events tự viết (ghi thẳng vào style trong lúc kéo, thả mới commit store); thu nhỏ/phóng to/đóng, taskbar, error boundary theo cửa sổ, `AppBoundary`; ghi nhớ bố cục (Zod validate); Playwright (4 test e2e) + job e2e trong CI. Kéo 4 cửa sổ: p90 khung hình 16.7ms.
- **Vướng:**
  - Selector `useShallow` trả về mảng tuple mới mỗi lần → "Maximum update depth exceeded". Test jsdom bắt được; sửa bằng cách chỉ chọn mảng id (chuỗi).
  - Class `flex` ghi đè thuộc tính `hidden`, cửa sổ thu nhỏ vẫn hiện.
  - `turbo test:e2e` chạy luôn e2e có sẵn của Nest, sẽ fail trên CI vì không có `.env`; giới hạn script gốc vào web.
  - Cửa sổ đầu tiên đè lên cột icon; chỉ thấy khi chụp màn hình.
- **Review:** vòng 1 CHƯA ĐẠT với 3 lỗi thật mà mình bỏ sót: cascade đè cửa sổ sau khi đóng bớt, `localStorage` hỏng làm không mở được cửa sổ, mở lại app đang mở không chuyển focus. Đã sửa kèm test; vòng 2 ĐẠT.

## Task 4: Các app nội dung

- **Đã làm:** About (hồ sơ, nút mở Projects/Contact, kỹ năng đếm theo số nơi dùng), Projects (lưới, lọc chip, chi tiết case study trong cửa sổ), Experience (dòng thời gian, khoảng thời gian), Contact (link, copy email). MDX render ở server rồi truyền vào cửa sổ; `"use cache"` + `cacheLife("max")` để trang vẫn prerender tĩnh.
- **Vướng:**
  - Template Next bật sẵn `cacheComponents`; đọc file nội dung làm build fail ("uncached data during prerendering") cho tới khi thêm `"use cache"`.
  - Tên đọc được của thẻ project bị dính liền ("BETANổi bật…"); test bắt được, sửa bằng `aria-labelledby`.
  - Placeholder cover ở màn chi tiết chiếm gần hết màn hình khi phóng to; khung avatar bị vỡ. Chỉ thấy khi chụp màn hình.
  - Reviewer kết luận ĐẠT nhưng 2 test e2e đang fail (selector mơ hồ khi cửa sổ có nội dung thật). Reviewer không chạy e2e, nên bước tự chạy e2e trước khi gọi reviewer là bắt buộc.
  - Phiên làm việc bị tắt giữa lúc review vòng 2; code còn nguyên trong working tree, chạy lại review. Vòng 2 ĐẠT; sửa thêm 2 lỗi HTML/a11y reviewer chỉ ra (danh sách và `<div>` nằm trong `<button>` của thẻ project).

## Task 5: Routing, deep link và SEO

- **Đã làm:** route `[[...path]]` cho `/`, `/<app>`, `/projects/<slug>` (prerender hết); store cửa sổ chuyển sang Provider theo từng trang; `UrlSync` giữ URL và cửa sổ khớp nhau (Back/Forward); metadata + ảnh OG (`next/og`) cho từng route; sitemap, robots; trang 404 kiểu ThạchOS, `proxy.ts` trả 404 thật cho đường dẫn sai cấu trúc; `<noscript>` và thẻ project là link thật.
- **Vướng:**
  - `cacheComponents` không cho dùng `dynamicParams`, và bắt mọi lần đọc content phải `"use cache"`.
  - Trang stream nên `notFound()` chỉ trả 200 + `noindex`; dùng proxy cho các đường dẫn kiểm tra được mà không cần content.
  - **Lỗi đáng nhớ nhất:** server HTML không hề có cửa sổ, vì Zustand render phía server bằng `getInitialState()` (state lúc tạo store, trước khi mở cửa sổ ban đầu). Test e2e "nội dung có trong HTML" vẫn pass vì chữ nằm trong payload RSC. Chỉ phát hiện khi chụp màn hình bản tắt JS. Sửa store và đổi test sang trình duyệt tắt JS.
- **Review:** vòng 1 CHƯA ĐẠT: `NEXT_PUBLIC_SITE_URL` chưa có trong `.env.example` và chưa validate bằng Zod (quên đặt thì SEO trỏ về localhost mà không ai biết). Đã sửa kèm test; vòng 2 ĐẠT.

## Task 6: Giao diện điện thoại

- **Đã làm:** dưới 768px, cùng DOM và cùng store chỉ đổi lớp hiển thị bằng CSS (`max-md:`): cửa sổ toàn màn hình, chỉ app trên cùng hiện, nút quay lại 44px; desktop thành lưới icon; chạm một lần là mở. Back sau deep link về màn hình chính thay vì rời trang (chèn `/` vào lịch sử). Vùng chạm ≥ 44px. 9 test Playwright ở 390×844. Lighthouse mobile: `/` 96/100, `/about` 93/100 (Performance/Accessibility).
- **Vướng:**
  - Test "switches layout" bắt được lỗi thật: trên điện thoại `setViewport` thu kích thước lưu của mọi cửa sổ về 390px, nên mở rộng lại thì cửa sổ vẫn hẹp.
  - Nhiều lần chạy e2e "treo": `pnpm exec` của pnpm 11 kiểm tra dependency qua mạng trước khi chạy, mạng chậm nên web server của Playwright không kịp lên. Gọi thẳng `node_modules/.bin/next`. Thêm nữa, macOS không có lệnh `timeout` nên vài lệnh kiểm tra lỗi ngay mà không in gì; suýt đọc nhầm thành "không có lỗi".
- **Review:** ĐẠT ở vòng 1. Áp dụng thêm: `isTop` bỏ qua cửa sổ đã thu nhỏ (tránh màn hình trống khi thu hẹp trình duyệt), chặn double-tap mở app hai lần.
  - Lệnh sửa `playwright.config.ts` không áp dụng vì Prettier đã đổi định dạng file, nên test mobile chạy nhầm trong project desktop.
