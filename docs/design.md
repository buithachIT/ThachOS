# Thiết kế ThạchOS

## Hướng thẩm mỹ: bản vẽ kỹ thuật

ThạchOS trông như một bản vẽ kỹ thuật đang được dùng: giấy kẻ lưới, nét mực mảnh, chú thích bằng chữ mono, bóng đổ cứng như giấy chồng lên nhau. Chế độ tối là blueprint: nền xanh đậm, nét sáng.

Lý do: cú chốt của project là X-ray mode, biến giao diện thành bản vẽ kỹ thuật. Khi giao diện thường đã mang ngôn ngữ đó, bật X-ray giống như "lật bản vẽ sang lớp chi tiết", không phải đổi sang một thế giới khác.

Tránh: gradient tím, glassmorphism, bo góc lớn, bóng mờ, thứ gì nhìn ra template.

## Màu

Định nghĩa bằng CSS variables trong `apps/web/src/app/globals.css`, Tailwind dùng qua `@theme`.

| Token          | Sáng (giấy) | Tối (blueprint) | Dùng cho                              |
| -------------- | ----------- | --------------- | ------------------------------------- |
| `--paper`      | `#f3efe6`   | `#0f1e33`       | Nền desktop                           |
| `--grid`       | `#d9d2c3`   | `#1d3352`       | Lưới nền                              |
| `--surface`    | `#fbf9f4`   | `#14273f`       | Thanh hệ thống, cửa sổ                |
| `--ink`        | `#1b1a17`   | `#e4ecf5`       | Chữ, viền                             |
| `--ink-muted`  | `#6b665c`   | `#8ea3bd`       | Chữ phụ                               |
| `--accent`     | `#c2410c`   | `#ff8a4c`       | Chọn, focus, điểm nhấn (cam tín hiệu) |
| `--accent-ink` | `#ffffff`   | `#0f1e33`       | Chữ trên nền accent                   |

Mặc định theo hệ thống (`prefers-color-scheme`). Người xem bấm nút trên thanh hệ thống để đổi; lựa chọn lưu ở `localStorage` (`thachos-theme`).

Tương phản chữ chính và chữ phụ trên nền đều đạt WCAG AA.

## Font

Tối đa 2 họ, tự host qua `next/font`:

- **IBM Plex Sans:** chữ đọc, tiêu đề.
- **IBM Plex Mono:** nhãn, đồng hồ, tên app, chú thích kiểu bản vẽ.

## Hình khối

- **Bo góc:** `--radius: 4px` cho mọi thứ (nút, icon được chọn, sau này là cửa sổ). Nhỏ, như góc giấy cắt.
- **Viền:** 1px `--ink`. Thanh hệ thống chỉ có viền dưới.
- **Bóng đổ:** cứng, không blur: `3px 3px 0 var(--ink)`. Cửa sổ đang focus dùng bóng lớn hơn (`5px 5px 0`).
- **Lưới nền:** ô 24px, vạch đậm mỗi 5 ô, vẽ bằng CSS gradient (không dùng ảnh).

## Icon

SVG nét (stroke 1.5, không fill), 32×32 trên desktop, dùng `currentColor`. Không dùng emoji.

## Chuyển động

Ngắn (≤ 150ms), chỉ cho trạng thái chọn và hover. Tắt hết khi `prefers-reduced-motion: reduce`.
