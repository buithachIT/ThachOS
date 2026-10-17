# Portfolio xuyên thấu: vision

Tài liệu này mô tả sản phẩm đang xây và lý do của nó. Đọc trước khi làm bất kỳ task tính năng nào.
Chi tiết từng task nằm ở `docs/specs/`; quy tắc làm việc nằm ở `CLAUDE.md`.

## Một câu

Một trang portfolio mà người xem không chỉ đọc về chủ nhân, mà **chơi được** và **nhìn xuyên được** vào hệ thống đang chạy bên dưới.

## Mục tiêu kép

1. **Khoe skill.** Bản thân trang web là project khó nhất trong portfolio: realtime, AI agent, observability, DevOps.
2. **Luyện làm việc với AI agent.** Cả project được build cùng agent theo lộ trình 8 tuần, từ một agent + reviewer lên nhiều agent làm song song. Lịch sử commit, PR và nhật ký là bằng chứng để kể khi phỏng vấn, nên giữ chúng sạch và có ý nghĩa.

## Lớp ngoài: một không gian sống

- **Giao diện: desktop giả lập** (kiểu PostHog, Maxpanra OS). Đây là hướng đang nghiêng về, chưa chốt cứng; xem "Chưa chốt".
- Mỗi project, mục giới thiệu, liên hệ là một **cửa sổ** kéo thả được.
- **Multiplayer:** ai đang xem cùng lúc đều thấy con trỏ của nhau, chat được, để lại lời nhắn ở guestbook. Mở web ra là thấy nó đang "sống".

## Cú chốt: X-ray mode

Nhấn phím **X**, cả giao diện biến thành bản vẽ kỹ thuật:

- Mỗi component hiện viền và tên.
- Mỗi request hiện thành tia sáng từ trình duyệt về server, kèm thời gian xử lý.
- Thấy được query vào database, cache trúng hay trượt, message WebSocket đang chạy.

**Đây là trace thật của chính phiên đang xem, không phải animation dựng sẵn.** Đó là điểm khác biệt của cả project; mọi thiết kế phải giữ được điều này.

## Các khu

| Khu              | Người xem thấy gì                                                                                                                                                       | App chịu trách nhiệm                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Desktop + cửa sổ | Cửa sổ kéo thả cho từng project, giới thiệu, liên hệ                                                                                                                    | web                                                                  |
| Multiplayer      | Con trỏ người khác, chat                                                                                                                                                | realtime                                                             |
| Guestbook        | Lời nhắn, tranh vẽ chung, cập nhật realtime                                                                                                                             | realtime (đẩy live), api (lưu Postgres)                              |
| X-ray            | Overlay component, request, query, cache, WebSocket                                                                                                                     | web (vẽ overlay), api/realtime/worker (phát trace qua OpenTelemetry) |
| AI Clone         | Chat với bản AI của chủ nhân, trả lời dựa trên CV và project; tự mở đúng cửa sổ hoặc bật X-ray để giải thích. Khi bật X-ray thấy agent suy nghĩ từng bước, gọi tool nào | api (agent), web (thực thi hành động trên giao diện)                 |
| Project Lab      | Demo và sơ đồ kiến trúc tương tác cho từng project                                                                                                                      | web, nội dung MDX trong `content/`                                   |
| Control Room     | Dashboard thật của chính web: số người online, tốc độ phản hồi, lần deploy gần nhất. Chaos mode giả lập sự cố để khoe khả năng tự hồi phục                              | api, worker, realtime                                                |

## Nguyên tắc không được phá

1. **X-ray là dữ liệu thật.** Không mock trace, không dựng animation giả để "trông giống". Nếu một tính năng chưa có trace thật thì X-ray không hiển thị nó, thay vì làm giả.
2. **Mọi thứ phải quan sát được.** Endpoint, socket event và job mới đều phải mang trace context và đặt tên rõ ràng, để X-ray và Control Room hiển thị được. Component cửa sổ phải có tên dễ đọc vì tên đó sẽ hiện lên trong X-ray.
3. **Chạy tốt trên điện thoại.** Desktop giả lập vẫn phải dùng được trên màn hình nhỏ.
4. **Nội dung tách khỏi code.** CV, project, giới thiệu nằm trong `content/` (MDX). AI Clone cũng lấy dữ liệu từ đây, nên chỉ có một nguồn sự thật.
5. **Chaos mode chỉ phá trong phạm vi an toàn.** Giả lập sự cố không được làm mất dữ liệu thật (guestbook) hay làm sập trang cho người xem khác.

## Thuật ngữ

- **Cửa sổ (window):** một khối nội dung trên desktop giả lập, kéo thả được.
- **X-ray:** chế độ overlay hiển thị cấu trúc và trace thật của phiên hiện tại.
- **Trace / span:** dữ liệu OpenTelemetry của một request, query, job hay message.
- **AI Clone:** agent đóng vai chủ nhân portfolio, có tool để điều khiển giao diện.
- **Chaos mode:** chế độ giả lập sự cố trong Control Room.

## Lộ trình

8 tuần. Những gì đã biết:

- **Đã xong:** khung monorepo (4 app, Postgres, Redis, CI).
- **Tuần 1:** giao diện + nội dung (desktop, cửa sổ, MDX trong `content/`).
- **Tuần 7:** OpenTelemetry (`packages/telemetry`).

Các tuần còn lại được cập nhật vào đây khi lên kế hoạch.

## Chưa chốt

Agent gặp các điểm này thì hỏi lại, không tự quyết:

- Concept giao diện: desktop giả lập là hướng đang nghiêng về; phòng 3D và thị trấn pixel đã cân nhắc nhưng chưa chọn.
- Cách đưa trace từ server về trình duyệt cho X-ray (ví dụ qua realtime).
- Cơ chế gắn tên component cho overlay X-ray.
- Model và nhà cung cấp LLM cho AI Clone.
- Nơi deploy và nguồn dữ liệu "lần deploy gần nhất" cho Control Room.
