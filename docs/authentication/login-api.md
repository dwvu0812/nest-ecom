# Login API Documentation

## Tổng quan

Chức năng login cho phép người dùng xác thực và nhận JWT tokens để truy cập các API được bảo vệ.

## Endpoints

### 1. Login

**POST** `/auth/login`

Xác thực người dùng và trả về JWT tokens.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

#### Response (Success)

```json
{
  "message": "Đăng nhập thành công.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": {
      "id": 1,
      "name": "USER",
      "permissions": [...]
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

**401 Unauthorized** - Sai email hoặc password

```json
{
  "message": "Trường password không hợp lệ: Email hoặc mật khẩu không đúng.",
  "code": "INVALID_INPUT",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**400 Bad Request** - Email chưa được xác minh

```json
{
  "message": "Trường email không hợp lệ: Vui lòng xác minh email trước khi đăng nhập.",
  "code": "INVALID_INPUT",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**403 Forbidden** - Tài khoản bị khóa

```json
{
  "message": "Tài khoản user@example.com đã bị khóa",
  "code": "ACCOUNT_BLOCKED",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Get Profile (Protected)

**GET** `/auth/profile`

Lấy thông tin profile của người dùng hiện tại (yêu cầu JWT token).

#### Headers

```
Authorization: Bearer <your-access-token>
```

#### Response

```json
{
  "message": "Thông tin profile của bạn",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": {
      "id": 1,
      "name": "USER",
      "permissions": [...]
    }
  }
}
```

## Sử dụng trong Code

### 1. Protect endpoint với JWT Guard

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
export class ProductController {
  @Get('my-products')
  @UseGuards(JwtAuthGuard)
  getMyProducts(@CurrentUser() user: any) {
    // user chứa thông tin của người dùng đã login
    return this.productService.getProductsByUser(user.id);
  }
}
```

### 2. Optional Authentication

```typescript
import { UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
export class ProductController {
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getProducts(@CurrentUser() user?: any) {
    // user có thể là null nếu không có token
    if (user) {
      // Show personalized products
      return this.productService.getPersonalizedProducts(user.id);
    } else {
      // Show public products
      return this.productService.getPublicProducts();
    }
  }
}
```

## JWT Token Structure

### Access Token Payload

```json
{
  "sub": 1,               // User ID
  "email": "user@example.com",
  "role": {               // User role with permissions
    "id": 1,
    "name": "USER",
    "permissions": [...]
  },
  "iat": 1640995200,      // Issued at
  "exp": 1640995800       // Expires at (15 minutes by default)
}
```

### Refresh Token Payload

```json
{
  "sub": 1,               // User ID
  "email": "user@example.com",
  "role": {               // User role with permissions
    "id": 1,
    "name": "USER",
    "permissions": [...]
  },
  "iat": 1640995200,      // Issued at
  "exp": 1641599200       // Expires at (7 days by default)
}
```

## Environment Variables

Đảm bảo các biến môi trường sau được cấu hình:

```env
JWT_SECRET=your-32-character-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-32-character-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

## Security Notes

1. **Access Token**: Có thời gian sống ngắn (15 phút) để giảm thiểu rủi ro nếu bị lộ
2. **Refresh Token**: Có thời gian sống dài hơn (7 ngày) để tự động gia hạn access token
3. **Password**: Được hash với bcrypt trước khi lưu trữ
4. **Email Verification**: Bắt buộc trước khi có thể login
5. **Account Status**: Kiểm tra trạng thái tài khoản (ACTIVE/BLOCKED)
