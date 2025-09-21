# Custom Business Exceptions

## 📋 Tổng quan

Custom Business Exception classes cung cấp type-safe, semantic way để throw business logic errors với consistent structure và user-friendly messages.

## 📁 File location

```
src/shared/exceptions/business.exception.ts
src/shared/exceptions/index.ts
```

## 🏗️ Exception Class Hierarchy

```
BusinessException (Base)
├── UserException          # User-related errors
├── AuthException          # Authentication/Authorization errors
├── ValidationException    # Input validation errors
└── ResourceException      # Resource CRUD errors
```

## 🎯 Base BusinessException

### Structure

```typescript
export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: string = 'BUSINESS_ERROR',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
```

### Features

- **Type Safety**: Extends NestJS HttpException
- **Semantic Codes**: Meaningful error codes cho API consumers
- **Automatic Timestamp**: ISO timestamp trong error payload
- **Flexible Status**: Custom HTTP status codes

## 👤 UserException

### Static Factory Methods

```typescript
// Email already exists
UserException.emailAlreadyExists(email: string)
// → 409 Conflict: "Email {email} đã được sử dụng"

// User not found
UserException.userNotFound(identifier: string)
// → 404 Not Found: "Không tìm thấy người dùng: {identifier}"

// Email not verified
UserException.emailNotVerified()
// → 403 Forbidden: "Email chưa được xác minh"

// Invalid credentials
UserException.invalidCredentials()
// → 401 Unauthorized: "Email hoặc mật khẩu không chính xác"
```

### Usage Examples

```typescript
// In AuthService
async register(dto: RegisterDto) {
  const existing = await this.usersService.findByEmail(dto.email);
  if (existing) {
    throw UserException.emailAlreadyExists(dto.email);
  }
  // ... rest of logic
}

// Response:
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email user@example.com đã được sử dụng",
    "statusCode": 409,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/api/auth/register"
  }
}
```

## 🔐 AuthException

### Static Factory Methods

```typescript
// Invalid token
AuthException.invalidToken();
// → 401 Unauthorized: "Token không hợp lệ"

// Token expired
AuthException.tokenExpired();
// → 401 Unauthorized: "Token đã hết hạn"

// Insufficient permissions
AuthException.insufficientPermissions();
// → 403 Forbidden: "Bạn không có quyền thực hiện thao tác này"
```

### Usage Examples

```typescript
// In JwtAuthGuard
async canActivate(context: ExecutionContext): Promise<boolean> {
  try {
    const token = this.extractTokenFromHeader(request);
    const payload = this.jwtService.verify(token);
    return true;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw AuthException.tokenExpired();
    }
    throw AuthException.invalidToken();
  }
}

// In RoleGuard
async canActivate(context: ExecutionContext): Promise<boolean> {
  const user = request.user;
  const hasPermission = await this.checkPermission(user, requiredRole);

  if (!hasPermission) {
    throw AuthException.insufficientPermissions();
  }
  return true;
}
```

## ✅ ValidationException

### Static Factory Methods

```typescript
// Invalid input
ValidationException.invalidInput(field: string, reason: string)
// → 400 Bad Request: "Trường {field} không hợp lệ: {reason}"

// Missing required field
ValidationException.missingRequiredField(field: string)
// → 400 Bad Request: "Trường {field} là bắt buộc"
```

### Usage Examples

```typescript
// In AuthService
async verifyEmail(dto: VerifyEmailDto) {
  const code = await this.findVerificationCode(dto.email, dto.code);

  if (!code) {
    throw ValidationException.invalidInput(
      'verification_code',
      'Mã xác minh không hợp lệ hoặc đã hết hạn'
    );
  }
  // ... verify logic
}

// In custom validation
validatePhoneNumber(phone: string) {
  if (!phone) {
    throw ValidationException.missingRequiredField('phoneNumber');
  }

  if (!isValidVietnamesePhone(phone)) {
    throw ValidationException.invalidInput(
      'phoneNumber',
      'Số điện thoại phải có định dạng Việt Nam'
    );
  }
}
```

## 📄 ResourceException

### Static Factory Methods

```typescript
// Resource not found
ResourceException.notFound(resource: string, identifier?: string)
// → 404 Not Found: "{resource} không tồn tại" or "{resource} với ID {identifier} không tồn tại"

// Resource already exists
ResourceException.alreadyExists(resource: string, identifier?: string)
// → 409 Conflict: "{resource} đã tồn tại" or "{resource} với ID {identifier} đã tồn tại"

// Cannot delete resource
ResourceException.cannotDelete(resource: string, reason: string)
// → 400 Bad Request: "Không thể xóa {resource}: {reason}"
```

### Usage Examples

```typescript
// In ProductsService
async getProduct(id: number) {
  const product = await this.prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw ResourceException.notFound('Product', id.toString());
  }
  return product;
}

async deleteProduct(id: number) {
  const product = await this.getProduct(id); // Throws if not found

  const hasOrders = await this.prisma.order.count({
    where: { productSKUSnapshots: { some: { productId: id } } }
  });

  if (hasOrders > 0) {
    throw ResourceException.cannotDelete(
      'Product',
      'Sản phẩm đã có đơn hàng liên quan'
    );
  }

  return this.prisma.product.delete({ where: { id } });
}

// In CategoriesService
async createCategory(dto: CreateCategoryDto) {
  const existing = await this.prisma.category.findFirst({
    where: { slug: dto.slug }
  });

  if (existing) {
    throw ResourceException.alreadyExists('Category', dto.slug);
  }

  return this.prisma.category.create({ data: dto });
}
```

## 📊 Error Code Reference

### UserException Codes

| Method                 | Error Code             | HTTP Status | Message Template                          |
| ---------------------- | ---------------------- | ----------- | ----------------------------------------- |
| `emailAlreadyExists()` | `EMAIL_ALREADY_EXISTS` | 409         | `Email {email} đã được sử dụng`           |
| `userNotFound()`       | `USER_NOT_FOUND`       | 404         | `Không tìm thấy người dùng: {identifier}` |
| `emailNotVerified()`   | `EMAIL_NOT_VERIFIED`   | 403         | `Email chưa được xác minh`                |
| `invalidCredentials()` | `INVALID_CREDENTIALS`  | 401         | `Email hoặc mật khẩu không chính xác`     |

### AuthException Codes

| Method                      | Error Code                 | HTTP Status | Message                                     |
| --------------------------- | -------------------------- | ----------- | ------------------------------------------- |
| `invalidToken()`            | `INVALID_TOKEN`            | 401         | `Token không hợp lệ`                        |
| `tokenExpired()`            | `TOKEN_EXPIRED`            | 401         | `Token đã hết hạn`                          |
| `insufficientPermissions()` | `INSUFFICIENT_PERMISSIONS` | 403         | `Bạn không có quyền thực hiện thao tác này` |

### ValidationException Codes

| Method                   | Error Code               | HTTP Status | Message Template                        |
| ------------------------ | ------------------------ | ----------- | --------------------------------------- |
| `invalidInput()`         | `INVALID_INPUT`          | 400         | `Trường {field} không hợp lệ: {reason}` |
| `missingRequiredField()` | `MISSING_REQUIRED_FIELD` | 400         | `Trường {field} là bắt buộc`            |

### ResourceException Codes

| Method            | Error Code                | HTTP Status | Message Template                     |
| ----------------- | ------------------------- | ----------- | ------------------------------------ |
| `notFound()`      | `RESOURCE_NOT_FOUND`      | 404         | `{resource} không tồn tại`           |
| `alreadyExists()` | `RESOURCE_ALREADY_EXISTS` | 409         | `{resource} đã tồn tại`              |
| `cannotDelete()`  | `CANNOT_DELETE_RESOURCE`  | 400         | `Không thể xóa {resource}: {reason}` |

## 🔄 Migration từ Standard Exceptions

### Before (Standard NestJS)

```typescript
// ❌ Old way
throw new BadRequestException('Email đã được sử dụng');
throw new NotFoundException('Không tìm thấy người dùng');
throw new UnauthorizedException('Token không hợp lệ');
```

### After (Custom Business Exceptions)

```typescript
// ✅ New way
throw UserException.emailAlreadyExists(email);
throw UserException.userNotFound(userId);
throw AuthException.invalidToken();
```

### Benefits of Migration

- **Type Safety**: Compile-time error checking
- **Semantic Codes**: Meaningful error codes cho API consumers
- **Consistency**: Standardized error messages
- **Maintainability**: Centralized error definitions
- **Searchability**: Easy to find all uses of specific error type

## 🛠️ Extending Custom Exceptions

### Adding New Exception Class

```typescript
// src/shared/exceptions/business.exception.ts

export class PaymentException extends BusinessException {
  static insufficientFunds(amount: number, balance: number) {
    return new PaymentException(
      `Số dư không đủ. Cần ${amount}đ, hiện có ${balance}đ`,
      'INSUFFICIENT_FUNDS',
      HttpStatus.BAD_REQUEST,
    );
  }

  static paymentMethodNotSupported(method: string) {
    return new PaymentException(
      `Phương thức thanh toán ${method} không được hỗ trợ`,
      'PAYMENT_METHOD_NOT_SUPPORTED',
      HttpStatus.BAD_REQUEST,
    );
  }

  static transactionFailed(reason: string) {
    return new PaymentException(
      `Giao dịch thất bại: ${reason}`,
      'TRANSACTION_FAILED',
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

### Adding New Method to Existing Class

```typescript
// Extend UserException
export class UserException extends BusinessException {
  // ... existing methods

  static accountBlocked(reason: string) {
    return new UserException(
      `Tài khoản đã bị khóa: ${reason}`,
      'ACCOUNT_BLOCKED',
      HttpStatus.FORBIDDEN,
    );
  }

  static profileIncomplete(missingFields: string[]) {
    return new UserException(
      `Hồ sơ chưa đầy đủ. Thiếu: ${missingFields.join(', ')}`,
      'PROFILE_INCOMPLETE',
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

## 🧪 Testing Custom Exceptions

### Unit Test

```typescript
describe('UserException', () => {
  describe('emailAlreadyExists', () => {
    it('should create exception with correct properties', () => {
      const email = 'test@example.com';
      const exception = UserException.emailAlreadyExists(email);

      expect(exception).toBeInstanceOf(BusinessException);
      expect(exception.getStatus()).toBe(409);

      const response = exception.getResponse() as any;
      expect(response.message).toBe(`Email ${email} đã được sử dụng`);
      expect(response.code).toBe('EMAIL_ALREADY_EXISTS');
      expect(response.timestamp).toBeDefined();
    });
  });
});
```

### Integration Test

```typescript
describe('Auth Controller', () => {
  it('should throw UserException for duplicate email', async () => {
    // Create first user
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(mockUserData)
      .expect(201);

    // Try duplicate
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(mockUserData)
      .expect(409);

    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(response.body.error.message).toContain('đã được sử dụng');
  });
});
```

## 🚨 Best Practices

### ✅ Do

- Use semantic error codes cho API consumers
- Provide meaningful Vietnamese messages cho end users
- Include relevant context trong error messages
- Create static factory methods cho common use cases
- Keep error messages consistent across similar operations

### ❌ Don't

- Throw generic BusinessException directly
- Include sensitive information trong error messages
- Create overly specific exception classes for single use
- Mix English và Vietnamese trong same message
- Forget to update error code documentation

## 💡 Advanced Usage

### Conditional Exception Throwing

```typescript
async updateUserProfile(userId: number, updates: UpdateProfileDto) {
  const user = await this.getUser(userId);

  // Multiple validation checks
  if (updates.email && updates.email !== user.email) {
    const emailExists = await this.findByEmail(updates.email);
    if (emailExists) {
      throw UserException.emailAlreadyExists(updates.email);
    }
  }

  if (updates.role && !await this.hasPermission(user, 'CHANGE_ROLE')) {
    throw AuthException.insufficientPermissions();
  }

  return this.prisma.user.update({
    where: { id: userId },
    data: updates
  });
}
```

### Exception Chaining

```typescript
async processOrder(orderId: number) {
  try {
    const order = await this.getOrder(orderId);
    await this.validateOrderItems(order);
    await this.processPayment(order);
    await this.updateInventory(order);

    return this.completeOrder(orderId);
  } catch (error) {
    if (error instanceof ResourceException) {
      // Order or items not found
      throw error;
    } else if (error instanceof PaymentException) {
      // Payment failed
      throw error;
    } else {
      // Unexpected error - wrap trong generic business exception
      throw new BusinessException(
        'Đã xảy ra lỗi khi xử lý đơn hàng',
        'ORDER_PROCESSING_FAILED',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```
