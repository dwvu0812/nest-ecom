# Cấu hình Email với Resend

## Tổng quan

Dự án này sử dụng [Resend](https://resend.com) làm dịch vụ gửi email duy nhất. Resend cung cấp API đơn giản và hiệu quả để gửi email.

## Cài đặt

### 1. Tạo tài khoản Resend

1. Truy cập [resend.com](https://resend.com)
2. Đăng ký tài khoản miễn phí
3. Xác minh email của bạn

### 2. Lấy API Key

1. Đăng nhập vào dashboard Resend
2. Vào mục "API Keys"
3. Tạo một API key mới
4. Sao chép API key (bắt đầu với `re_`)

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc của dự án và thêm:

\`\`\`env

# Email (Resend) - Bắt buộc

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com

# Các biến môi trường khác...

DATABASE_URL="postgresql://username:password@localhost:5432/nest_ecom?schema=public"
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_at_least_32_characters_long
NODE_ENV=development
PORT=3000
\`\`\`

### 4. Cấu hình domain (Tùy chọn)

Để sử dụng email từ domain riêng thay vì `onboarding@resend.dev`:

1. Trong dashboard Resend, vào mục "Domains"
2. Thêm domain của bạn
3. Cấu hình DNS records theo hướng dẫn
4. Cập nhật `FROM_EMAIL` trong file `.env`

## Sử dụng

### Gửi email xác minh

\`\`\`typescript
await this.mailerService.sendVerificationCode('user@example.com', '123456');
\`\`\`

### Gửi email tùy chỉnh

\`\`\`typescript
await this.mailerService.sendEmail(
'user@example.com',
'Tiêu đề email',
'Nội dung text',
'<h1>Nội dung HTML</h1>' // Tùy chọn
);
\`\`\`

## Giới hạn miễn phí

Resend cung cấp:

- 3,000 emails/tháng miễn phí
- 100 emails/ngày
- Hỗ trợ domain tùy chỉnh

## Troubleshooting

### Lỗi: "RESEND_API_KEY is required"

Đảm bảo bạn đã:

1. Tạo file `.env`
2. Thêm `RESEND_API_KEY` với giá trị hợp lệ
3. Khởi động lại ứng dụng

### Email không được gửi

1. Kiểm tra API key có đúng không
2. Kiểm tra logs để xem chi tiết lỗi
3. Đảm bảo email "from" được cấu hình đúng

### Email vào spam

1. Cấu hình domain riêng với SPF, DKIM records
2. Sử dụng email "from" từ domain đã xác minh
3. Tránh nội dung spam trong email
