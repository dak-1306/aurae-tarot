# Ý tưởng Monetization cho Web Tarot AI

> **Trạng thái:** Ý tưởng / Chưa triển khai\
> **Mục tiêu:** Kiếm doanh thu từ AI Tarot bằng trả phí theo lượt hỏi
> chuyên sâu, với trải nghiệm ít ma sát và hạ tầng tối giản.\
> **Nguyên tắc:** Chưa xây subscription, ví tiền, hoặc bắt buộc đăng
> nhập. Kiểm chứng nhu cầu và đơn hàng đầu tiên trước khi mở rộng.

------------------------------------------------------------------------

## 1. Mô hình sản phẩm

-   **Miễn phí:** Người dùng đặt câu hỏi và rút 3 lá Tarot; nhận phần
    luận giải cơ bản.
-   **Trả phí:** Người dùng mua thêm lượt hỏi chuyên sâu (follow-up) để
    đào sâu cùng chủ đề/trải bài.
-   **Thanh toán:** Chuyển khoản ngân hàng bằng QR VietQR, tạo mã giao
    dịch riêng cho order; hệ thống tự xác nhận giao dịch qua webhook.
-   **Không bắt buộc đăng nhập:** Sử dụng anonymous session. Google
    Login chỉ là lựa chọn để liên kết/khôi phục dữ liệu về sau.
-   **Monetization ban đầu:** Bán theo gói lượt, không subscription.

### Gói giá thử nghiệm (chưa chốt)

  Gói                 Quyền lợi                           Giá thử nghiệm
  ------------------- --------------------------------- ----------------
  Free                Rút 3 lá + luận giải cơ bản                     0đ
  Deep Reading × 3    3 câu hỏi follow-up chuyên sâu             15.000đ
  Deep Reading × 10   10 câu hỏi follow-up chuyên sâu            39.000đ

Giá chỉ là giả định để thử nghiệm. Cần kiểm tra chi phí model, phí giao
dịch (nếu có), và hành vi người dùng trước khi chốt.

------------------------------------------------------------------------

## 2. User flow (Mermaid)

### 2.1 Flow trải bài miễn phí → mua lượt → hỏi sâu

``` mermaid
flowchart TD
    A[Người dùng truy cập Tarot] --> B{Anonymous session đã có?}
    B -- Chưa có --> C[Backend tạo session ID]
    B -- Đã có --> D[Khôi phục session]
    C --> E[Người dùng nhập câu hỏi]
    D --> E
    E --> F[Người dùng rút 3 lá]
    F --> G[Backend gọi Gemini để luận giải]
    G --> H[Hiển thị kết quả miễn phí]
    H --> I{Muốn hỏi chuyên sâu?}
    I -- Không --> J[Kết thúc / tiếp tục khám phá]
    I -- Có --> K[Chọn gói credit]
    K --> L[Backend tạo Order pending + mã chuyển khoản]
    L --> M[Frontend hiển thị QR + số tiền + nội dung CK]
    M --> N[Người dùng chuyển khoản]
    N --> O[SePay nhận giao dịch]
    O --> P[SePay gửi webhook về Backend]
    P --> Q{Backend xác minh giao dịch}
    Q -- Không hợp lệ --> R[Không cấp credit; ghi log / xử lý]
    Q -- Hợp lệ --> S[Order chuyển paid; cộng credit]
    S --> T[Frontend cập nhật trạng thái thanh toán]
    T --> U[Người dùng gửi câu hỏi follow-up]
    U --> V[Backend kiểm tra credit và giới hạn]
    V --> W{Đủ credit?}
    W -- Không --> K
    W -- Có --> X[Trừ 1 credit an toàn + gọi Gemini]
    X --> Y[Trả luận giải chuyên sâu]
    Y --> Z[Hiển thị kết quả và số lượt còn lại]
```

### 2.2 Liên kết Google (tùy chọn, có thể triển khai sau)

``` mermaid
flowchart TD
    A[Anonymous user] --> B[Chọn Liên kết Google để lưu/khôi phục]
    B --> C[Google OAuth]
    C --> D{Xác thực thành công?}
    D -- Không --> E[Giữ nguyên anonymous session]
    D -- Có --> F[Liên kết Google account với anonymous data]
    F --> G[Khôi phục readings, orders, credit theo chính sách]
```

**Lưu ý:** Cần thiết kế rõ cách merge dữ liệu khi anonymous session liên
kết với tài khoản đã tồn tại (không tự cộng trùng credit hoặc order).

------------------------------------------------------------------------

## 3. Kiến trúc MVP

``` mermaid
flowchart LR
    A[Frontend Tarot] --> B[Backend API]
    B --> C[(Database)]
    B --> D[Gemini API]
    E[SePay Banking Webhook] --> B
    B --> F[Payment verification / Credit ledger]
```

### Thành phần

  -----------------------------------------------------------------------
  Thành phần              Vai trò                 Ghi chú
  ----------------------- ----------------------- -----------------------
  Frontend web hiện tại   Tarot UI, trải bài, mua Không tin dữ liệu
                          gói, follow-up          credit từ client

  Backend                 Session, reading,       Kiểm tra quyền và xử lý
                          order, payment webhook, logic cấp lượt ở server
                          credit                  

  Database                Sessions, readings,     Dữ liệu mua phải lưu
                          orders, payment events, server-side
                          credit ledger           

  Gemini API              Tạo luận giải ban đầu   Theo dõi quota, chi
                          và follow-up            phí, lỗi và model
                                                  availability

  SePay                   QR chuyển khoản và      Xác minh webhook và đối
                          webhook biến động       soát giao dịch
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 4. Database đề xuất (MVP)

Có thể dùng MongoDB. Đây là thiết kế gợi ý; không nhất thiết phải tạo
mọi collection ngay nếu MVP cần scope nhỏ.

### 4.1 `anonymous_sessions`

  -----------------------------------------------------------------------
  Field                   Type                    Mục đích
  ----------------------- ----------------------- -----------------------
  `_id`                   ObjectId                Session ID phía server

  `tokenHash`             string                  Hash token bí mật dùng
                                                  nhận diện session
                                                  (không lưu raw token
                                                  nếu có thể)

  `createdAt`             Date                    Thời điểm tạo

  `lastActiveAt`          Date                    Hoạt động gần nhất

  `expiresAt`             Date                    Hạn session/TTL (cân
                                                  nhắc)

  `linkedUserId`          ObjectId \| null        Tài khoản liên kết sau
                                                  này, nếu có
  -----------------------------------------------------------------------

### 4.2 `users` (chỉ cần khi bổ sung Google Login)

  Field           Type             Mục đích
  --------------- ---------------- ---------------------------------
  `_id`           ObjectId         User ID
  `googleId`      string           ID định danh từ Google (unique)
  `email`         string           Email (nếu cần)
  `displayName`   string           Tên hiển thị
  `avatarUrl`     string \| null   Ảnh đại diện
  `createdAt`     Date             Ngày tạo
  `updatedAt`     Date             Ngày cập nhật

### 4.3 `readings`

  -------------------------------------------------------------------------
  Field                     Type                    Mục đích
  ------------------------- ----------------------- -----------------------
  `_id`                     ObjectId                Reading ID

  `sessionId`               ObjectId                Session sở hữu reading

  `userId`                  ObjectId \| null        User nếu đã liên kết
                                                    tài khoản

  `question`                string                  Câu hỏi ban đầu

  `spreadType`              string                  Loại trải bài

  `cards`                   array                   Lá bài, vị trí, hướng
                                                    (upright/reversed)

  `initialInterpretation`   string                  Luận giải miễn phí

  `followUps`               array hoặc collection   Câu hỏi và luận giải
                            riêng                   chuyên sâu

  `createdAt`               Date                    Thời điểm trải

  `updatedAt`               Date                    Cập nhật gần nhất
  -------------------------------------------------------------------------

**Nếu follow-up phát triển nhiều:** tách thành `reading_followups`
riêng, mỗi document gồm `readingId`, `sessionId`, `question`, `answer`,
`creditSpent`, `createdAt`. Với MVP nhỏ, có thể embed array nhưng lưu ý
kích thước document và truy vấn.

### 4.4 `orders`

  -------------------------------------------------------------------------
  Field                     Type                    Mục đích
  ------------------------- ----------------------- -----------------------
  `_id`                     ObjectId                Order ID

  `orderCode`               string                  Mã ngắn, unique, dùng
                                                    trong nội dung chuyển
                                                    khoản

  `sessionId`               ObjectId                Session mua

  `userId`                  ObjectId \| null        User nếu có

  `packageId`               string                  Gói mua

  `credits`                 number                  Số lượt được mua

  `amount`                  number                  Số tiền VND

  `currency`                string                  `VND`

  `status`                  enum                    `pending`, `paid`,
                                                    `expired`, `cancelled`,
                                                    `refunded`

  `provider`                string                  `sepay`

  `providerTransactionId`   string \| null          ID giao dịch ngân hàng,
                                                    unique khi có

  `createdAt`               Date                    Thời điểm tạo

  `paidAt`                  Date \| null            Thời điểm xác nhận

  `expiresAt`               Date                    Hạn order (nếu áp dụng)
  -------------------------------------------------------------------------

### 4.5 `credit_ledger` (khuyến nghị để kiểm soát lượt)

Thay vì chỉ lưu một con số credit và cập nhật tùy ý, ledger ghi lại từng
lần cộng/trừ. `balance` có thể được cache ở session/account, nhưng
ledger là dấu vết để kiểm toán và xử lý lỗi.

  Field              Type               Mục đích
  ------------------ ------------------ ---------------------------------------------
  `_id`              ObjectId           Entry ID
  `sessionId`        ObjectId           Session
  `userId`           ObjectId \| null   User nếu có
  `type`             enum               `purchase`, `spend`, `refund`, `adjustment`
  `delta`            number             Số credit thay đổi (+/-)
  `orderId`          ObjectId \| null   Order nguồn nếu là mua
  `readingId`        ObjectId \| null   Reading liên quan nếu tiêu lượt
  `idempotencyKey`   string             Unique key tránh ghi lặp
  `createdAt`        Date               Thời điểm

### 4.6 `payment_events` (lưu webhook để chống xử lý lặp)

  -----------------------------------------------------------------------
  Field                   Type                    Mục đích
  ----------------------- ----------------------- -----------------------
  `_id`                   ObjectId                Event ID

  `provider`              string                  `sepay`

  `providerEventId` /     string                  ID sự kiện/giao dịch,
  `transactionId`                                 unique nếu provider
                                                  cung cấp

  `orderCode`             string                  Mã order lấy từ nội
                                                  dung chuyển khoản

  `payload`               object                  Payload webhook (hạn
                                                  chế dữ liệu nhạy cảm)

  `processingStatus`      enum                    `received`,
                                                  `processed`,
                                                  `rejected`, `failed`

  `receivedAt`            Date                    Thời điểm nhận

  `processedAt`           Date \| null            Thời điểm xử lý
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. Các bên thứ ba

### SePay --- QR chuyển khoản & xác nhận giao dịch

-   Trang: https://sepay.vn/
-   Tài liệu QR/webhook:
    https://developer.sepay.vn/vi/sepay-webhooks/tao-qr-va-form-thanh-toan
-   Mục tiêu: tạo QR có số tiền và nội dung chuyển khoản theo order; gửi
    webhook khi có giao dịch.
-   Gói Free đã được xem xét ban đầu: 0đ/tháng, giới hạn 50 giao dịch
    theo thông tin tham khảo tại thời điểm nghiên cứu. **Kiểm tra lại
    giá, quota, điều kiện và tính năng trước khi triển khai**, vì chính
    sách có thể thay đổi.
-   Webhook phải được xác minh theo hướng dẫn SePay; không tin payload
    chỉ vì request gửi đến endpoint.
-   Cần xử lý giao dịch trùng, sai số tiền, sai mã order, chuyển khoản
    thiếu nội dung, thanh toán sau khi order hết hạn và hoàn tiền.

### Google Gemini API --- AI Tarot

-   Trang AI Studio: https://aistudio.google.com/
-   Mục tiêu: luận giải 3 lá ban đầu và follow-up reading.
-   Có thể bắt đầu bằng model có free tier, nhưng **không phụ thuộc free
    quota khi đã có người trả tiền**.
-   Kiểm tra lại model ID, rate limit, quota theo project, chính sách dữ
    liệu, khả năng truy cập model và giá hiện hành.
-   API key phải nằm ở backend/server environment, không đưa vào client.
-   Theo dõi token, chi phí mỗi reading, lỗi/timeout, quota. Có rate
    limit để tránh lạm dụng.
-   Khi follow-up, truyền context cần thiết của reading (câu hỏi gốc,
    cards, vị trí, câu trả lời trước) nhưng giới hạn context để kiểm
    soát token.

### Google OAuth --- Login tùy chọn (để phase sau)

-   Dùng để liên kết anonymous session và đồng bộ/khôi phục reading,
    credits.
-   Không yêu cầu login để rút bài miễn phí hoặc thanh toán lần đầu.
-   Cần xử lý account linking, session ownership, merge dữ liệu và chống
    cộng credit trùng.

------------------------------------------------------------------------

## 6. Các lưu ý kỹ thuật quan trọng

### Payment & credit

-   **Webhook là nguồn xác nhận thanh toán**, không phải frontend và
    cũng không phải ảnh chụp màn hình người dùng.
-   Mỗi order có `orderCode` unique, không đoán được dễ dàng.
-   Xác minh webhook theo cơ chế SePay hướng dẫn
    (secret/token/signature/IP nếu có).
-   Cấp credit phải idempotent: một giao dịch chỉ cộng credit đúng một
    lần.
-   Cần transaction/atomic update hoặc cơ chế khóa phù hợp để tránh 2
    webhook đồng thời cộng trùng.
-   Chỉ cấp credit khi đúng tài khoản nhận, số tiền, mã order, trạng
    thái giao dịch và điều kiện đối soát.
-   Tạo order có expiry; quy định cách xử lý thanh toán đến muộn.
-   Không lưu thông tin tài khoản ngân hàng nhạy cảm không cần thiết.

### Anonymous session & quyền lợi mua

-   Không lưu credit có giá trị bảo vệ trong `localStorage` để frontend
    tự quyết.
-   Dùng session token ngẫu nhiên đủ mạnh; gửi qua cookie `HttpOnly`,
    `Secure`, `SameSite` phù hợp nếu kiến trúc cho phép.
-   Database lưu token hash nếu có thể; session ID không nên tự nó là bí
    mật/credential.
-   Nếu user xóa cookie, họ có thể mất quyền truy cập anonymous. Cần cân
    nhắc cách khôi phục: mã recovery, liên kết Google về sau hoặc hỗ trợ
    thủ công. Không hứa rằng credit anonymous tự khôi phục được khi mất
    session.
-   Rate limit AI theo session/IP và có giới hạn miễn phí rõ ràng.

### AI & UX

-   Không gọi AI cho request chưa được backend xác thực credit.
-   Nếu trừ credit rồi AI lỗi, có cơ chế refund credit tự động hoặc xử
    lý retry có kiểm soát.
-   Có thể dùng idempotency key cho yêu cầu follow-up để tránh trừ lượt
    2 lần khi người dùng retry.
-   Không yêu cầu đăng nhập ngay; chỉ gợi ý liên kết Google khi user
    muốn lưu/khôi phục dữ liệu.
-   Nêu rõ Tarot/AI chỉ nhằm mục đích giải trí và tự suy ngẫm, không
    phải lời khuyên chuyên môn cho quyết định y tế, pháp lý hoặc tài
    chính.

------------------------------------------------------------------------

## 7. Scope triển khai theo phase

  -----------------------------------------------------------------------
  Phase                   Phạm vi                 Chưa làm
  ----------------------- ----------------------- -----------------------
  Phase 0 --- Validate    Free 3-card reading;    Payment, login
                          test nội dung và nhu    
                          cầu                     

  Phase 1 --- MVP payment Anonymous session, DB,  Subscription, Google
                          gói credit, QR,         Login, dashboard
                          webhook, follow-up paid 

  Phase 2 --- Improve     Lịch sử reading,        Membership phức tạp
                          recovery, Google        
                          linking, theo dõi       
                          analytics               

  Phase 3 --- Scale       Tối ưu AI cost, paid    Chỉ thêm khi có dữ liệu
                          API, nhiều gói,         nhu cầu
                          monitoring, chống abuse 
                          tốt hơn                 
  -----------------------------------------------------------------------

**Ưu tiên:** hoàn thiện flow mua một lần và trả phí theo lượt trước.
Chưa xây subscription cho đến khi có bằng chứng người dùng quay lại đủ
thường xuyên.

------------------------------------------------------------------------

## 8. Checklist trước khi bắt đầu Phase 1

-   [ ] Chốt gói credit và giá test.
-   [ ] Kiểm tra quota/giá Gemini hiện hành và chọn model cụ thể.
-   [ ] Đăng ký, cấu hình SePay; xác nhận webhook và QR trong môi trường
    test.
-   [ ] Chốt anonymous session/recovery strategy.
-   [ ] Thiết kế database indexes (unique order code, transaction id,
    idempotency key).
-   [ ] Xác minh webhook và xử lý duplicate event.
-   [ ] Xử lý AI failure/refund credit.
-   [ ] Rate limit và giới hạn free usage.
-   [ ] Test các trường hợp: thanh toán đúng, sai tiền, sai mã,
    duplicate webhook, webhook đến muộn, AI timeout, user reload/đổi
    tab, mất session.
-   [ ] Kiểm tra chính sách, điều khoản, privacy và yêu cầu pháp lý/thuế
    áp dụng cho việc thu tiền thực tế.

------------------------------------------------------------------------

## 9. Quyết định đã thống nhất

-   Monetization theo **pay-per-use / credit bundle**, chưa dùng
    subscription.
-   Trải nghiệm ban đầu không cần tài khoản.
-   Free: 3 lá Tarot + luận giải cơ bản.
-   Paid: hỏi follow-up chuyên sâu.
-   Thanh toán: chuyển khoản QR qua SePay.
-   Credit và trạng thái order phải được server/database quản lý.
-   Google login là optional, cân nhắc ở phase sau để lưu/khôi phục dữ
    liệu.
-   Gemini free chỉ dùng giai đoạn validate; khi có paid usage phải tính
    quota và chi phí, sẵn sàng chuyển paid API.
-   Không triển khai toàn bộ ngay; tài liệu này là kế hoạch để quay lại
    khi sẵn sàng.

------------------------------------------------------------------------

## 10. Tài liệu cần kiểm tra lại khi triển khai

Các thông tin dịch vụ, giá và quota có thể thay đổi. Khi bắt đầu code,
kiểm tra tài liệu chính thức:

-   SePay: https://sepay.vn/ và https://developer.sepay.vn/
-   Gemini API: https://ai.google.dev/gemini-api/docs
-   Google OAuth: https://developers.google.com/identity
