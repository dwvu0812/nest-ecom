# Profile Management System

## Tổng quan

Profile Management System cung cấp chức năng quản lý hồ sơ người dùng cho ứng dụng NestJS e-commerce, bao gồm:

- 👤 **Profile Management** - Xem và cập nhật thông tin cá nhân
- 🔐 **Password Management** - Đổi mật khẩu an toàn
- 🖼️ **Avatar Upload** - Upload và quản lý ảnh đại diện
- 🌐 **Multi-language Support** - Hỗ trợ profile đa ngôn ngữ
- 🔒 **2FA Integration** - Quản lý xác thực hai yếu tố

## Kiến trúc

```
Profile Management Architecture
├── ProfileController      # RESTful API endpoints
├── ProfileService         # Business logic layer
├── UserTranslationRepo    # Multi-language data access
├── ProfileExceptions      # Custom business exceptions
├── Upload Configuration   # Avatar upload settings
└── Custom Validators      # Password confirmation validation
```

## Tính năng chính

### 🎯 Profile Core Features

- **Get Profile** - Lấy thông tin profile với role và translations
- **Update Profile** - Cập nhật name, email, phone number
- **Change Password** - Đổi password với validation nghiêm ngặt
- **Avatar Upload** - Upload ảnh với file validation và security

### 🌐 Multi-language Support

- **Profile Translations** - Thông tin profile theo ngôn ngữ (address, description)
- **CRUD Operations** - Tạo, đọc, cập nhật, xóa translations
- **Language Validation** - Kiểm tra language tồn tại
- **Translation Uniqueness** - Mỗi user chỉ có 1 translation per language

### 🔒 Security Features

- **JWT Authentication** - Bảo vệ tất cả endpoints
- **Current Password Validation** - Bắt buộc khi đổi password
- **Email Uniqueness Check** - Đảm bảo email không trùng lặp
- **File Upload Security** - Validation file type, size, MIME type
- **Audit Trail** - Track createdBy/updatedBy cho mọi thay đổi

### ✅ Validation & Error Handling

- **Custom Validators** - Password confirmation validation
- **Business Exceptions** - Semantic error codes và messages
- **Input Validation** - class-validator cho tất cả DTOs
- **Type Safety** - Full TypeScript support
- **Consistent Errors** - Standardized error response format

## Tech Stack

- **NestJS** - Framework với built-in features
- **Prisma** - ORM cho database operations
- **Multer** - File upload middleware
- **bcrypt** - Password hashing
- **class-validator** - Input validation
- **TypeScript** - Type safety

## Quick Start

### 1. Import Module

```typescript
// app.module.ts
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    // ... other modules
    ProfileModule,
  ],
})
export class AppModule {}
```

### 2. Environment Setup

Tạo folder cho avatar uploads:

```bash
mkdir -p uploads/avatars
```

### 3. Dependencies

```bash
pnpm install bcrypt @types/bcrypt @types/multer
```

## API Endpoints

### Profile Management

- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile information
- `PUT /profile/password` - Change password
- `POST /profile/avatar` - Upload avatar

### Profile Translations

- `GET /profile/translations` - Get all translations
- `POST /profile/translations` - Create new translation
- `PUT /profile/translations/:id` - Update translation
- `DELETE /profile/translations/:id` - Delete translation

### 2FA Management

- `POST /profile/2fa/enable` - Enable 2FA
- `POST /profile/2fa/disable` - Disable 2FA

## Response Format

Tất cả responses tuân theo chuẩn của project:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/profile"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "USER_PROFILE_NOT_FOUND",
    "message": "User profile not found",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/profile",
    "statusCode": 404
  }
}
```

## Security Considerations

### Authentication

- Tất cả endpoints require JWT token
- Token phải valid và không expired
- User role được check qua existing guard system

### File Upload Security

- File type validation (JPG, JPEG, PNG, WEBP only)
- File size limit (2MB max)
- MIME type verification
- Unique filename generation
- Safe storage location

### Password Security

- Complex password requirements
- Current password verification required
- bcrypt hashing với salt rounds 12
- Password confirmation validation

## Integration với Existing System

### Auth System

- Sử dụng `JwtAuthGuard` cho authentication
- `@CurrentUser()` decorator để lấy user info
- Tích hợp với existing JWT strategy

### Database Schema

- Extend existing User model
- Sử dụng UserTranslation cho multi-language
- Audit trail với existing pattern
- Soft delete support

### Exception Handling

- Tuân thủ existing exception system
- Custom ProfileExceptions với semantic codes
- Integration với GlobalExceptionFilter

## File Structure

```
src/profile/
├── dto/                    # Data Transfer Objects
│   ├── profile-response.dto.ts
│   ├── update-profile.dto.ts
│   ├── change-password.dto.ts
│   └── profile-translation.dto.ts
├── repositories/           # Data Access Layer
│   └── user-translation.repository.ts
├── config/                # Configuration
│   └── upload.config.ts
├── validators/            # Custom Validators
│   └── password-confirmation.validator.ts
├── exceptions/            # Business Exceptions
│   └── profile.exceptions.ts
├── constants/             # Constants & Config
│   └── profile.constants.ts
├── profile.controller.ts  # REST API Controller
├── profile.service.ts     # Business Logic Service
└── profile.module.ts      # Module Definition
```

## Monitoring & Logging

Profile operations được log thông qua existing logging system:

- **Request Logging** - Tất cả API calls
- **Error Logging** - Business exceptions và system errors
- **Audit Logging** - Profile changes với user context
- **Performance Monitoring** - Response times và metrics

## Next Steps

1. **Testing** - Unit tests và integration tests
2. **Documentation** - API examples và usage guide
3. **Performance** - Optimize queries và caching
4. **Features** - Advanced profile features nếu cần

Xem thêm chi tiết trong [Profile API Documentation](./profile-api.md) và [Usage Examples](./api-examples.md).
