# Profile API Documentation

## Authentication

Tất cả Profile API endpoints require JWT authentication:

```
Authorization: Bearer <jwt_token>
```

## Endpoints Overview

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| GET    | `/profile`                  | Get current user profile   |
| PUT    | `/profile`                  | Update profile information |
| PUT    | `/profile/password`         | Change password            |
| POST   | `/profile/avatar`           | Upload avatar              |
| GET    | `/profile/translations`     | Get profile translations   |
| POST   | `/profile/translations`     | Create profile translation |
| PUT    | `/profile/translations/:id` | Update profile translation |
| DELETE | `/profile/translations/:id` | Delete profile translation |
| POST   | `/profile/2fa/enable`       | Enable 2FA                 |
| POST   | `/profile/2fa/disable`      | Disable 2FA                |

---

## Profile Management

### GET /profile

Lấy thông tin profile của user hiện tại.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+84123456789",
    "avatar": "/uploads/avatars/avatar-1-1704067200000.jpg",
    "is2FAEnabled": false,
    "emailVerifiedAt": "2024-01-01T10:00:00.000Z",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "role": {
      "id": 3,
      "name": "User",
      "description": "Regular user role"
    },
    "translations": [
      {
        "languageId": 1,
        "languageCode": "en",
        "address": "123 Main Street, City",
        "description": "Software Developer"
      },
      {
        "languageId": 2,
        "languageCode": "vi",
        "address": "123 Đường Chính, Thành phố",
        "description": "Lập trình viên phần mềm"
      }
    ]
  }
}
```

**Error Responses:**

- `404` - Profile not found
- `401` - Unauthorized

---

### PUT /profile

Cập nhật thông tin profile.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "+84987654321"
}
```

**Request Body Schema:**

```typescript
interface UpdateProfileDto {
  name?: string; // 2-100 characters
  email?: string; // Valid email format
  phoneNumber?: string; // Vietnamese phone format
  avatar?: string; // Max 500 characters
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    // Same as GET /profile response with updated information
  },
  "message": "Profile updated successfully"
}
```

**Error Responses:**

- `400` - Validation errors
- `409` - Email already exists
- `404` - Profile not found
- `401` - Unauthorized

---

### PUT /profile/password

Đổi mật khẩu user.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "oldPassword123!",
  "newPassword": "NewStrongPass123!",
  "confirmPassword": "NewStrongPass123!"
}
```

**Request Body Schema:**

```typescript
interface ChangePasswordDto {
  currentPassword: string; // Required
  newPassword: string; // Min 8 chars, uppercase, lowercase, number, special char
  confirmPassword: string; // Must match newPassword
}
```

**Password Requirements:**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%\*?&)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Error Responses:**

- `400` - Password validation errors
- `400` - Password mismatch
- `400` - No password set (social login users)
- `401` - Current password incorrect
- `404` - Profile not found

---

### POST /profile/avatar

Upload avatar cho user.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
avatar: <file>    // JPG, JPEG, PNG, WEBP file, max 2MB
```

**File Requirements:**

- **Allowed Types:** JPG, JPEG, PNG, WEBP
- **Max Size:** 2MB
- **MIME Type:** Must match file extension

**Response:**

```json
{
  "success": true,
  "data": {
    // Same as GET /profile response with updated avatar
  },
  "message": "Avatar uploaded successfully"
}
```

**Error Responses:**

- `400` - No file uploaded
- `400` - Invalid file type
- `400` - File size exceeded
- `404` - Profile not found
- `401` - Unauthorized

---

## Profile Translations

### GET /profile/translations

Lấy tất cả profile translations của user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "languageId": 1,
      "languageCode": "en",
      "languageName": "English",
      "address": "123 Main Street, New York",
      "description": "Software Developer with 5 years experience",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "userId": 1,
      "languageId": 2,
      "languageCode": "vi",
      "languageName": "Vietnamese",
      "address": "123 Đường Chính, TP.HCM",
      "description": "Lập trình viên với 5 năm kinh nghiệm",
      "createdAt": "2024-01-01T01:00:00.000Z",
      "updatedAt": "2024-01-01T11:00:00.000Z"
    }
  ]
}
```

---

### POST /profile/translations

Tạo translation mới cho profile.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "languageId": 3,
  "address": "456 Oak Avenue, Los Angeles",
  "description": "Experienced software engineer"
}
```

**Request Body Schema:**

```typescript
interface CreateProfileTranslationDto {
  languageId: number; // Required, must exist
  address?: string; // Max 500 characters
  description?: string; // Max 1000 characters
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "userId": 1,
    "languageId": 3,
    "languageCode": "es",
    "languageName": "Spanish",
    "address": "456 Oak Avenue, Los Angeles",
    "description": "Experienced software engineer",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Profile translation created successfully"
}
```

**Error Responses:**

- `400` - Language not found
- `409` - Translation already exists for this language
- `404` - Profile not found
- `401` - Unauthorized

---

### PUT /profile/translations/:id

Cập nhật translation hiện có.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**

- `id` - Translation ID (number)

**Request Body:**

```json
{
  "address": "Updated address",
  "description": "Updated description"
}
```

**Request Body Schema:**

```typescript
interface UpdateProfileTranslationDto {
  address?: string; // Max 500 characters
  description?: string; // Max 1000 characters
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    // Same as create response with updated information
  },
  "message": "Profile translation updated successfully"
}
```

**Error Responses:**

- `404` - Translation not found
- `401` - Unauthorized
- `403` - Not your translation

---

### DELETE /profile/translations/:id

Xóa translation (soft delete).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Parameters:**

- `id` - Translation ID (number)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Profile translation deleted successfully"
  }
}
```

**Error Responses:**

- `404` - Translation not found
- `401` - Unauthorized
- `403` - Not your translation

---

## 2FA Management

### POST /profile/2fa/enable

Bật 2FA cho user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "2FA enabled successfully",
    "qrCodeUrl": "data:image/png;base64,..." // Optional QR code
  }
}
```

### POST /profile/2fa/disable

Tắt 2FA cho user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "2FA disabled successfully"
  }
}
```

---

## Error Codes

| Code                              | HTTP Status | Description                          |
| --------------------------------- | ----------- | ------------------------------------ |
| `USER_PROFILE_NOT_FOUND`          | 404         | User profile not found               |
| `EMAIL_ALREADY_EXISTS`            | 409         | Email already taken                  |
| `INVALID_CURRENT_PASSWORD`        | 401         | Current password incorrect           |
| `PASSWORD_MISMATCH`               | 400         | Password confirmation doesn't match  |
| `NO_PASSWORD_SET`                 | 400         | User has no password (social login)  |
| `INVALID_FILE_TYPE`               | 400         | Invalid avatar file type             |
| `FILE_SIZE_EXCEEDED`              | 400         | File size too large                  |
| `NO_FILE_UPLOADED`                | 400         | No file provided                     |
| `TRANSLATION_ALREADY_EXISTS`      | 409         | Translation exists for language      |
| `TRANSLATION_NOT_FOUND`           | 404         | Translation not found                |
| `LANGUAGE_NOT_FOUND`              | 404         | Language not found                   |
| `UNAUTHORIZED_TRANSLATION_ACCESS` | 403         | Not authorized to access translation |

---

## Rate Limiting

Profile endpoints có rate limiting để bảo vệ khỏi abuse:

- **Profile Updates:** 10 requests/minute
- **Password Changes:** 3 requests/hour
- **Avatar Uploads:** 5 requests/hour
- **Translation Operations:** 20 requests/minute

## Caching

Để tối ưu performance:

- Profile data được cache 5 minutes
- Translation data được cache 10 minutes
- Avatar URLs được cache với CDN

## WebSocket Events

Profile changes sẽ emit WebSocket events (nếu có WebSocket module):

```typescript
// Profile updated
{
  type: 'profile_updated',
  userId: 1,
  changes: ['name', 'email']
}

// Avatar changed
{
  type: 'avatar_changed',
  userId: 1,
  avatarUrl: '/uploads/avatars/new-avatar.jpg'
}
```
