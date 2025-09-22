# Hướng Dẫn Sử Dụng 2FA (Two-Factor Authentication)

## Tổng quan

Chức năng 2FA (Two-Factor Authentication) đã được implement sử dụng thư viện [OTPAuth](https://github.com/hectorm/otpauth) để tạo và xác minh mã TOTP (Time-based One-Time Password).

## API Endpoints

### 1. Setup 2FA

```
POST /auth/2fa/setup
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "message": "Vui lòng xác minh mã TOTP để kích hoạt 2FA.",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "uri": "otpauth://totp/NestJS%20E-Commerce:user@example.com?issuer=NestJS%20E-Commerce&secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30"
}
```

### 2. Verify 2FA Setup

```
POST /auth/2fa/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "123456"
}
```

**Response:**

```json
{
  "message": "2FA đã được kích hoạt thành công."
}
```

### 3. Check 2FA Status

```
GET /auth/2fa/status
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "is2FAEnabled": true,
  "hasSecret": true
}
```

### 4. Login với 2FA

#### Step 1: Login thông thường

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (nếu user có 2FA enabled):**

```json
{
  "message": "Cần xác minh 2FA để hoàn tất đăng nhập.",
  "requires2FA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Step 2: Complete 2FA Login

```
POST /auth/2fa/login
Content-Type: application/json

{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
}
```

**Response:**

```json
{
  "message": "Đăng nhập 2FA thành công.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": {...},
    "avatar": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Disable 2FA

```
DELETE /auth/2fa/disable
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "password123",
  "code": "123456"
}
```

**Response:**

```json
{
  "message": "2FA đã được tắt thành công."
}
```

## Cách Setup 2FA

### 1. Kích Hoạt 2FA

1. Gọi API `POST /auth/2fa/setup`
2. Sử dụng QR code để thêm vào ứng dụng Authenticator (Google Authenticator, Authy, etc.)
3. Nhập mã 6 chữ số từ app Authenticator
4. Gọi API `POST /auth/2fa/verify` với mã để kích hoạt

### 2. Login với 2FA

1. Login bình thường với email/password
2. Nếu response có `requires2FA: true`, sử dụng `tempToken`
3. Mở app Authenticator để lấy mã 6 chữ số
4. Gọi API `POST /auth/2fa/login` với `tempToken` và `code`

### 3. Tắt 2FA

1. Cần cả password và mã TOTP hiện tại
2. Gọi API `DELETE /auth/2fa/disable`

## Database Schema Changes

```sql
-- Đã thêm vào User table:
is2FAEnabled BOOLEAN DEFAULT false
totpSecret   STRING? -- base32 encoded secret

-- Đã thêm vào enum:
enum VerificationCodeType {
  REGISTER
  FORGOT_PASSWORD
  TWO_FA_SETUP
}
```

## Security Features

- **TOTP Standard**: Tuân thủ RFC 6238
- **Window Tolerance**: Accept codes từ previous/next time window để account cho clock drift
- **Temporary Token**: Login 2FA sử dụng temporary token expire trong 5 phút
- **Password Verification**: Disable 2FA yêu cầu both password và TOTP code
- **Device Tracking**: Integrate với hệ thống device tracking có sẵn

## Dependencies

```json
{
  "otpauth": "^9.4.1",
  "qrcode": "^1.5.4",
  "@types/qrcode": "^1.5.5"
}
```

## Configuration

```typescript
export const TOTP_CONFIG = {
  ISSUER: 'NestJS E-Commerce',
  ALGORITHM: 'SHA1',
  DIGITS: 6,
  PERIOD: 30,
  WINDOW: 1, // Accept codes from previous/next time window
  SECRET_SIZE: 20, // 160 bits
} as const;
```

## Testing

1. **Setup Flow**:
   - Tạo user mới
   - Login và call setup 2FA
   - Scan QR code với Google Authenticator
   - Verify với mã từ app

2. **Login Flow**:
   - Login với user đã enable 2FA
   - Verify 2-step login process

3. **Disable Flow**:
   - Test disable với wrong password/code
   - Test successful disable

## Các Lưu Ý Quan Trọng

1. **QR Code Security**: QR code chứa secret key, không share publicly
2. **Backup**: User nên backup secret key hoặc có recovery method
3. **Rate Limiting**: Nên implement rate limiting cho 2FA verification
4. **Audit Logging**: Log tất cả 2FA activities cho security audit
5. **Recovery**: Cần có process để recover khi user mất access to authenticator app
