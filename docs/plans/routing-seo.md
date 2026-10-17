# Kế hoạch: Task 5 – Routing, deep link và SEO

Spec: `docs/specs/W1/05-routing-seo.md`

## Quyết định

- **Một route `app/[[...path]]/page.tsx`** cho `/`, `/<app>` và `/projects/<slug>`. Danh sách đường dẫn sinh từ content (`allPaths`) cho `generateStaticParams` và sitemap, nên mọi trang đều prerender.
- **Store theo từng trang (Provider) thay vì singleton:** server phải render sẵn cửa sổ mà URL yêu cầu, mà singleton cấp module thì dùng chung giữa các request. `WindowsProvider` tạo store với `initial`. Cửa sổ ban đầu nằm ngay trong _initial state_, vì Zustand render phía server bằng `getInitialState()`. Cửa sổ này dùng vị trí mặc định để khớp HTML server; layout đã lưu áp dụng sau khi mount.
- **URL ↔ cửa sổ:** `UrlSync` lắng nghe store. Cửa sổ trên cùng (không thu nhỏ) quyết định URL, cập nhật bằng `history.pushState` (Next 16 hỗ trợ, không reload). `popstate` mở lại cửa sổ theo URL; `/` đóng hết. Project đang xem lưu trong `subpath` của cửa sổ, nên `/projects/<slug>` theo được Back/Forward.
- **404:** `notFound()` hiện cửa sổ lỗi "app not found". Vì trang stream, lỗi phát sinh trong lúc render chỉ trả được 200 kèm `noindex`. Nên `proxy.ts` (middleware của Next 16) trả **404 thật** cho đường dẫn sai cấu trúc (`/nope`, `/about/x`); slug project không tồn tại vẫn là 200 + `noindex`, vì muốn kiểm tra slug thì phải đọc content.
- **Metadata** riêng cho từng route (title, description, canonical, Open Graph, Twitter). `metadataBase` lấy từ `NEXT_PUBLIC_SITE_URL`, hoặc `VERCEL_PROJECT_PRODUCTION_URL`, hoặc localhost.
- **Ảnh OG:** route handler `app/og/[[...path]]/route.tsx` dùng `next/og`, prerender cho mọi đường dẫn. Font mặc định đã hiển thị đúng tiếng Việt.
- **Không JS:** HTML server đã có cửa sổ và nội dung; thêm `<noscript>` với link tới từng trang.
- **`cacheComponents`:** các getter content dùng `"use cache"` + `cacheLife("max")`. Không dùng được `dynamicParams` ở chế độ này.
