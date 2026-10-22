# Kế hoạch: Task 3 – Window manager

Spec: `docs/specs/W1/03-window-manager.md`

## Quyết định

- **Store:** Zustand bản vanilla (`createStore`) trong `apps/web/src/stores/windows.ts`. Các phép tính (cascade, clamp, chuẩn hóa z) là hàm thuần trong `stores/window-geometry.ts`, test không cần React. Hook `useWindows(selector)` cho component.
- **Viewport:** store giữ kích thước vùng desktop (dưới thanh hệ thống). `setViewport` được gọi từ `ResizeObserver` và kéo các cửa sổ lọt ra ngoài vào lại.
- **Kéo/đổi kích thước:** tự viết bằng Pointer Events, không thêm thư viện. Trong lúc kéo chỉ đổi `style` của chính cửa sổ đó qua ref (không đi qua store, không re-render component nào); thả chuột mới ghi vào store một lần. Như vậy desktop và các cửa sổ khác không re-render khi kéo.
- **Giữ cửa sổ trong màn hình:** luôn thấy ít nhất 80px thanh tiêu đề theo chiều ngang, và thanh tiêu đề không vượt lên trên hay xuống dưới vùng desktop.
- **Z-index:** tăng dần mỗi lần focus; vượt 1000 thì đánh số lại 1..n theo thứ tự hiện tại.
- **Cascade:** cửa sổ thứ n mở tại (136 + 32n, 24 + 32n), bên phải cột icon, vòng lại sau 8 cửa sổ, rồi clamp vào màn hình. Kích thước mặc định lấy từ registry, thu nhỏ nếu màn hình nhỏ hơn.
- **Ghi nhớ bố cục:** `localStorage` key `thachos-window-layout`, lưu `{x, y, w, h}` theo `appId` khi thả chuột sau khi kéo hoặc đổi kích thước; bọc try/catch. Không khôi phục danh sách cửa sổ đang mở.
- **Focus:** mở cửa sổ thì focus vào cửa sổ; đóng thì focus trả về icon có `data-app-id` tương ứng. `Esc` trong cửa sổ thì đóng nó.
- **Nội dung cửa sổ:** tạm là placeholder theo `appId`; task 4 thay bằng app thật trong `src/apps/<appId>/`.
- **Playwright:** `@playwright/test` (spec yêu cầu), chỉ Chromium, chạy trên bản production (`next start` cổng 3100 để không đụng dev server cổng 3000). Script `test:e2e` riêng; CI thêm bước cài Chromium và chạy e2e.

## Việc cần làm

1. `stores/window-geometry.ts`, `stores/windows.ts` + unit test.
2. `windows/Window.tsx` (thanh tiêu đề, kéo, 8 tay nắm đổi kích thước, nút), `windows/WindowLayer.tsx`, `windows/AppBoundary.tsx`, `windows/WindowErrorBoundary.tsx`.
3. Thay `openApp` placeholder bằng `store.open`; danh sách cửa sổ trên thanh hệ thống.
4. Playwright: mở About, kéo, đóng, mở lại đúng vị trí; mở 4 cửa sổ và kéo qua lại.

## Thư viện mới (web)

`zustand`; dev: `@playwright/test`.
