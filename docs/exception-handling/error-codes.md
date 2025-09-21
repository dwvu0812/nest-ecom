# Error Codes Reference

## 📋 Tổng quan

Comprehensive reference cho tất cả error codes trong exception handling system, bao gồm HTTP status codes, semantic error codes, và messages.

## 🎯 Error Code Structure

```
ERROR_CODE_FORMAT: DOMAIN_SPECIFIC_ERROR
Examples:
- EMAIL_ALREADY_EXISTS
- RECORD_NOT_FOUND
- INSUFFICIENT_PERMISSIONS
- UNIQUE_CONSTRAINT_VIOLATION
```

## 👤 User Domain Errors (UserException)

| Error Code             | HTTP Status | Method                      | Message Template                          | Usage                        |
| ---------------------- | ----------- | --------------------------- | ----------------------------------------- | ---------------------------- |
| `EMAIL_ALREADY_EXISTS` | 409         | `emailAlreadyExists(email)` | `Email {email} đã được sử dụng`           | Registration, profile update |
| `USER_NOT_FOUND`       | 404         | `userNotFound(identifier)`  | `Không tìm thấy người dùng: {identifier}` | Get user, profile operations |
| `EMAIL_NOT_VERIFIED`   | 403         | `emailNotVerified()`        | `Email chưa được xác minh`                | Login, restricted operations |
| `INVALID_CREDENTIALS`  | 401         | `invalidCredentials()`      | `Email hoặc mật khẩu không chính xác`     | Login, authentication        |

### Usage Examples

```typescript
// Registration
throw UserException.emailAlreadyExists('user@example.com');
// → 409: "Email user@example.com đã được sử dụng"

// Login
throw UserException.invalidCredentials();
// → 401: "Email hoặc mật khẩu không chính xác"

// Profile access
throw UserException.userNotFound('123');
// → 404: "Không tìm thấy người dùng: 123"
```

## 🔐 Authentication Domain Errors (AuthException)

| Error Code                 | HTTP Status | Method                      | Message                                     | Usage                              |
| -------------------------- | ----------- | --------------------------- | ------------------------------------------- | ---------------------------------- |
| `INVALID_TOKEN`            | 401         | `invalidToken()`            | `Token không hợp lệ`                        | JWT validation, API key validation |
| `TOKEN_EXPIRED`            | 401         | `tokenExpired()`            | `Token đã hết hạn`                          | JWT expiration                     |
| `INSUFFICIENT_PERMISSIONS` | 403         | `insufficientPermissions()` | `Bạn không có quyền thực hiện thao tác này` | Role-based access control          |

### Usage Examples

```typescript
// JWT Guard
throw AuthException.invalidToken();
// → 401: "Token không hợp lệ"

// Token expiry
throw AuthException.tokenExpired();
// → 401: "Token đã hết hạn"

// Role check
throw AuthException.insufficientPermissions();
// → 403: "Bạn không có quyền thực hiện thao tác này"
```

## ✅ Validation Domain Errors (ValidationException)

| Error Code               | HTTP Status | Method                        | Message Template                        | Usage                             |
| ------------------------ | ----------- | ----------------------------- | --------------------------------------- | --------------------------------- |
| `INVALID_INPUT`          | 400         | `invalidInput(field, reason)` | `Trường {field} không hợp lệ: {reason}` | Custom validation, business rules |
| `MISSING_REQUIRED_FIELD` | 400         | `missingRequiredField(field)` | `Trường {field} là bắt buộc`            | Required field validation         |

### Usage Examples

```typescript
// Invalid input
throw ValidationException.invalidInput(
  'phoneNumber',
  'Định dạng số điện thoại không đúng',
);
// → 400: "Trường phoneNumber không hợp lệ: Định dạng số điện thoại không đúng"

// Missing field
throw ValidationException.missingRequiredField('email');
// → 400: "Trường email là bắt buộc"

// Business validation
throw ValidationException.invalidInput('age', 'Tuổi phải từ 18 đến 65');
// → 400: "Trường age không hợp lệ: Tuổi phải từ 18 đến 65"
```

## 📄 Resource Domain Errors (ResourceException)

| Error Code                | HTTP Status | Method                           | Message Template                                                       | Usage                              |
| ------------------------- | ----------- | -------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| `RESOURCE_NOT_FOUND`      | 404         | `notFound(resource, id?)`        | `{resource} không tồn tại` hoặc `{resource} với ID {id} không tồn tại` | CRUD operations                    |
| `RESOURCE_ALREADY_EXISTS` | 409         | `alreadyExists(resource, id?)`   | `{resource} đã tồn tại` hoặc `{resource} với ID {id} đã tồn tại`       | Create operations                  |
| `CANNOT_DELETE_RESOURCE`  | 400         | `cannotDelete(resource, reason)` | `Không thể xóa {resource}: {reason}`                                   | Delete operations with constraints |

### Usage Examples

```typescript
// Resource not found
throw ResourceException.notFound('Product', '123');
// → 404: "Product với ID 123 không tồn tại"

// Resource exists
throw ResourceException.alreadyExists('Category', 'electronics');
// → 409: "Category với ID electronics đã tồn tại"

// Cannot delete
throw ResourceException.cannotDelete(
  'User',
  'Người dùng có đơn hàng liên quan',
);
// → 400: "Không thể xóa User: Người dùng có đơn hàng liên quan"
```

## 🗄️ Database Domain Errors (PrismaExceptionFilter)

### Common Database Errors

| Prisma Code | Error Code                         | HTTP Status | Vietnamese Message                             | English Description              |
| ----------- | ---------------------------------- | ----------- | ---------------------------------------------- | -------------------------------- |
| `P2002`     | `UNIQUE_CONSTRAINT_VIOLATION`      | 409         | `{Field} đã tồn tại`                           | Unique constraint violation      |
| `P2025`     | `RECORD_NOT_FOUND_FOR_OPERATION`   | 404         | `Không tìm thấy bản ghi để thực hiện thao tác` | Record not found for operation   |
| `P2003`     | `FOREIGN_KEY_CONSTRAINT_VIOLATION` | 400         | `Dữ liệu tham chiếu không hợp lệ`              | Foreign key constraint violation |
| `P2001`     | `RECORD_NOT_FOUND`                 | 404         | `Bản ghi không tồn tại`                        | Record does not exist            |
| `P2011`     | `NULL_CONSTRAINT_VIOLATION`        | 400         | `Ràng buộc null bị vi phạm`                    | Null constraint violation        |

### Complete Prisma Error Mapping

<details>
<summary>Xem tất cả Prisma error codes</summary>

| Prisma Code | HTTP Status | Error Code                             | Vietnamese Message                             |
| ----------- | ----------- | -------------------------------------- | ---------------------------------------------- |
| `P2000`     | 400         | `VALUE_TOO_LONG`                       | `Giá trị quá dài cho trường dữ liệu`           |
| `P2001`     | 404         | `RECORD_NOT_FOUND`                     | `Bản ghi không tồn tại`                        |
| `P2002`     | 409         | `UNIQUE_CONSTRAINT_VIOLATION`          | `{Field} đã tồn tại`                           |
| `P2003`     | 400         | `FOREIGN_KEY_CONSTRAINT_VIOLATION`     | `Dữ liệu tham chiếu không hợp lệ`              |
| `P2004`     | 400         | `CONSTRAINT_VIOLATION`                 | `Ràng buộc dữ liệu bị vi phạm`                 |
| `P2005`     | 400         | `INVALID_VALUE`                        | `Giá trị không hợp lệ cho trường dữ liệu`      |
| `P2006`     | 400         | `INVALID_VALUE`                        | `Giá trị không hợp lệ`                         |
| `P2007`     | 400         | `DATA_VALIDATION_ERROR`                | `Lỗi xác thực dữ liệu`                         |
| `P2008`     | 400         | `QUERY_PARSE_ERROR`                    | `Lỗi phân tích truy vấn`                       |
| `P2009`     | 400         | `QUERY_VALIDATION_ERROR`               | `Lỗi xác thực truy vấn`                        |
| `P2010`     | 500         | `QUERY_EXECUTION_ERROR`                | `Lỗi thực thi truy vấn`                        |
| `P2011`     | 400         | `NULL_CONSTRAINT_VIOLATION`            | `Ràng buộc null bị vi phạm`                    |
| `P2012`     | 400         | `MISSING_REQUIRED_VALUE`               | `Thiếu giá trị bắt buộc`                       |
| `P2013`     | 400         | `MISSING_REQUIRED_ARGUMENT`            | `Thiếu giá trị bắt buộc cho trường`            |
| `P2014`     | 400         | `REQUIRED_RELATION_VIOLATION`          | `Thay đổi dữ liệu vi phạm quan hệ bắt buộc`    |
| `P2015`     | 404         | `RELATED_RECORD_NOT_FOUND`             | `Bản ghi liên quan không tìm thấy`             |
| `P2016`     | 400         | `QUERY_INTERPRETATION_ERROR`           | `Lỗi giải thích truy vấn`                      |
| `P2017`     | 400         | `RECORDS_NOT_CONNECTED`                | `Quan hệ không được kết nối`                   |
| `P2018`     | 404         | `REQUIRED_CONNECTED_RECORDS_NOT_FOUND` | `Các bản ghi kết nối bắt buộc không tìm thấy`  |
| `P2019`     | 400         | `INPUT_ERROR`                          | `Lỗi đầu vào`                                  |
| `P2020`     | 400         | `VALUE_OUT_OF_RANGE`                   | `Giá trị nằm ngoài phạm vi`                    |
| `P2021`     | 404         | `TABLE_NOT_FOUND`                      | `Bảng không tồn tại trong cơ sở dữ liệu`       |
| `P2022`     | 404         | `COLUMN_NOT_FOUND`                     | `Cột không tồn tại trong cơ sở dữ liệu`        |
| `P2025`     | 404         | `RECORD_NOT_FOUND_FOR_OPERATION`       | `Không tìm thấy bản ghi để thực hiện thao tác` |

</details>

### Database Field Name Mapping

```typescript
// Vietnamese field names
{
  email: 'Email',
  username: 'Tên người dùng',
  phone: 'Số điện thoại',
  phoneNumber: 'Số điện thoại',
  name: 'Tên',
  title: 'Tiêu đề',
  code: 'Mã',
  slug: 'Đường dẫn'
}
```

## 🌐 Standard HTTP Errors (GlobalExceptionFilter)

### NestJS Built-in Exceptions

| HTTP Status | Exception Class                | Error Code            | Common Usage            |
| ----------- | ------------------------------ | --------------------- | ----------------------- |
| 400         | `BadRequestException`          | `BAD_REQUEST`         | Invalid request data    |
| 401         | `UnauthorizedException`        | `UNAUTHORIZED`        | Authentication required |
| 403         | `ForbiddenException`           | `FORBIDDEN`           | Access denied           |
| 404         | `NotFoundException`            | `NOT_FOUND`           | Resource not found      |
| 409         | `ConflictException`            | `CONFLICT`            | Resource conflict       |
| 422         | `UnprocessableEntityException` | `VALIDATION_ERROR`    | Validation failure      |
| 429         | `ThrottlerException`           | `RATE_LIMIT_EXCEEDED` | Rate limiting           |
| 500         | `InternalServerErrorException` | `INTERNAL_ERROR`      | Server error            |

### Validation Pipe Errors

#### Class Validator Errors

```typescript
// Auto-generated từ ValidationPipe
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": [
      "email must be a valid email",
      "password must be longer than 6 characters",
      "phoneNumber must be a valid phone number"
    ],
    "statusCode": 422,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/api/auth/register"
  }
}
```

## 📊 Error Response Format

### Success Response Structure

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string; // Optional success message
  timestamp: string; // ISO datetime
  path: string; // Request path
}
```

### Error Response Structure

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // Semantic error code
    message: string | string[]; // User-friendly message(s)
    timestamp: string; // ISO datetime
    path: string; // Request path
    statusCode: number; // HTTP status code
  };
}
```

## 🔍 Error Code Usage by HTTP Status

### 400 - Bad Request

- `INVALID_INPUT` - ValidationException
- `MISSING_REQUIRED_FIELD` - ValidationException
- `CANNOT_DELETE_RESOURCE` - ResourceException
- `FOREIGN_KEY_CONSTRAINT_VIOLATION` - Prisma P2003
- `NULL_CONSTRAINT_VIOLATION` - Prisma P2011
- `VALUE_TOO_LONG` - Prisma P2000
- `BAD_REQUEST` - Standard BadRequestException

### 401 - Unauthorized

- `INVALID_TOKEN` - AuthException
- `TOKEN_EXPIRED` - AuthException
- `INVALID_CREDENTIALS` - UserException
- `UNAUTHORIZED` - Standard UnauthorizedException

### 403 - Forbidden

- `INSUFFICIENT_PERMISSIONS` - AuthException
- `EMAIL_NOT_VERIFIED` - UserException
- `FORBIDDEN` - Standard ForbiddenException

### 404 - Not Found

- `USER_NOT_FOUND` - UserException
- `RESOURCE_NOT_FOUND` - ResourceException
- `RECORD_NOT_FOUND` - Prisma P2001
- `RECORD_NOT_FOUND_FOR_OPERATION` - Prisma P2025
- `TABLE_NOT_FOUND` - Prisma P2021
- `COLUMN_NOT_FOUND` - Prisma P2022
- `NOT_FOUND` - Standard NotFoundException

### 409 - Conflict

- `EMAIL_ALREADY_EXISTS` - UserException
- `RESOURCE_ALREADY_EXISTS` - ResourceException
- `UNIQUE_CONSTRAINT_VIOLATION` - Prisma P2002
- `CONFLICT` - Standard ConflictException

### 422 - Unprocessable Entity

- `VALIDATION_ERROR` - ValidationPipe errors

### 429 - Too Many Requests

- `RATE_LIMIT_EXCEEDED` - ThrottlerException

### 500 - Internal Server Error

- `INTERNAL_ERROR` - Unexpected errors
- `QUERY_EXECUTION_ERROR` - Prisma P2010
- `UNKNOWN_DATABASE_ERROR` - Unmapped Prisma errors

## 📱 Client-side Error Handling

### JavaScript/TypeScript Example

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string | string[];
    statusCode: number;
    timestamp: string;
    path: string;
  };
  message?: string;
  timestamp: string;
  path: string;
}

// Handle API responses
async function handleApiCall<T>(apiCall: Promise<ApiResponse<T>>): Promise<T> {
  try {
    const response = await apiCall;

    if (response.success) {
      return response.data!;
    } else {
      throw new ApiError(response.error!);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle known API errors
      switch (error.code) {
        case 'EMAIL_ALREADY_EXISTS':
          showError('Email này đã được sử dụng. Vui lòng thử email khác.');
          break;
        case 'INVALID_CREDENTIALS':
          showError('Email hoặc mật khẩu không chính xác.');
          break;
        case 'INSUFFICIENT_PERMISSIONS':
          redirectToLogin();
          break;
        default:
          showError(error.message);
      }
    } else {
      // Handle network or unexpected errors
      showError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
    throw error;
  }
}

class ApiError extends Error {
  constructor(
    public code: string,
    public message: string | string[],
    public statusCode: number,
    public timestamp: string,
    public path: string,
  ) {
    super(Array.isArray(message) ? message.join(', ') : message);
    this.name = 'ApiError';
  }
}
```

### React Hook Example

```typescript
import { useState } from 'react';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T>(options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = async (apiCall: Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);

    try {
      const data = await handleApiCall(apiCall);
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      options.onError?.(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

// Usage trong component
function RegisterForm() {
  const { execute, loading, error } = useApi({
    onSuccess: () => navigate('/verify-email'),
    onError: (error) => {
      if (error.code === 'EMAIL_ALREADY_EXISTS') {
        setFieldError('email', error.message);
      }
    },
  });

  const handleSubmit = async (formData: RegisterDto) => {
    await execute(authApi.register(formData));
  };
}
```

## 🔧 Error Code Conventions

### Naming Conventions

- **SCREAMING_SNAKE_CASE** cho error codes
- **Domain prefix** khi cần thiết (USER*, AUTH*, etc.)
- **Descriptive names** thay vì abbreviations
- **Consistent terminology** across related errors

### Message Conventions

- **Vietnamese messages** cho end users
- **Specific context** khi có thể
- **Actionable guidance** where appropriate
- **Consistent tone** - formal but friendly

### Examples

```typescript
// ✅ Good
'EMAIL_ALREADY_EXISTS'; // Clear, specific
'INSUFFICIENT_PERMISSIONS'; // Descriptive
'RECORD_NOT_FOUND'; // Standard terminology

// ❌ Avoid
'ERR_001'; // Non-descriptive
'emailExists'; // Wrong case
'NO_PERM'; // Abbreviation
'ValidationFailed'; // Inconsistent case
```

## 📈 Analytics và Monitoring

### Error Tracking

```typescript
// Track error frequency by code
const errorCounts = {
  EMAIL_ALREADY_EXISTS: 45,
  INVALID_CREDENTIALS: 123,
  INSUFFICIENT_PERMISSIONS: 12,
  // ...
};

// Track error trends
const errorTrends = {
  '2024-01-01': { EMAIL_ALREADY_EXISTS: 5 },
  '2024-01-02': { EMAIL_ALREADY_EXISTS: 8 },
  // ...
};
```

### Common Error Patterns

1. **Authentication Errors** (40% of errors)
   - `INVALID_CREDENTIALS`: 60%
   - `TOKEN_EXPIRED`: 25%
   - `INVALID_TOKEN`: 15%

2. **Validation Errors** (35% of errors)
   - `EMAIL_ALREADY_EXISTS`: 45%
   - `INVALID_INPUT`: 35%
   - `MISSING_REQUIRED_FIELD`: 20%

3. **Resource Errors** (20% of errors)
   - `RESOURCE_NOT_FOUND`: 70%
   - `CANNOT_DELETE_RESOURCE`: 20%
   - `RESOURCE_ALREADY_EXISTS`: 10%

4. **Database Errors** (5% of errors)
   - `UNIQUE_CONSTRAINT_VIOLATION`: 60%
   - `FOREIGN_KEY_CONSTRAINT_VIOLATION`: 25%
   - `RECORD_NOT_FOUND_FOR_OPERATION`: 15%
