# Usage Guide

## 📋 Tổng quan

Hướng dẫn sử dụng exception handling system trong NestJS application, từ basic usage đến advanced scenarios.

## 🚀 Quick Start

### 1. Import Custom Exceptions

```typescript
// In your service files
import {
  UserException,
  AuthException,
  ValidationException,
  ResourceException,
} from '../shared/exceptions';
```

### 2. Replace Standard Exceptions

```typescript
// ❌ Old way
throw new BadRequestException('Email đã được sử dụng');
throw new NotFoundException('Không tìm thấy người dùng');

// ✅ New way
throw UserException.emailAlreadyExists(email);
throw UserException.userNotFound(userId);
```

### 3. Let Prisma Errors Bubble Up

```typescript
// ✅ Good - Let PrismaExceptionFilter handle
async createUser(userData: CreateUserDto) {
  return await this.prisma.user.create({
    data: userData
  });
  // If email duplicate → automatic P2002 handling
}

// ❌ Don't catch and re-throw Prisma errors unnecessarily
async createUser(userData: CreateUserDto) {
  try {
    return await this.prisma.user.create({ data: userData });
  } catch (error) {
    throw new BadRequestException('User creation failed'); // Loses specific error info
  }
}
```

## 🎯 Use Cases by Exception Type

### 👤 UserException - User Management

#### User Registration

```typescript
@Injectable()
export class AuthService {
  async register(dto: RegisterDto) {
    // Check if email exists
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw UserException.emailAlreadyExists(dto.email);
    }

    // Check if email is verified (for re-registration)
    if (existing && !existing.emailVerifiedAt) {
      throw UserException.emailNotVerified();
    }

    // Create user logic...
  }
}
```

#### User Authentication

```typescript
@Injectable()
export class AuthService {
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw UserException.invalidCredentials(); // Don't reveal if email exists
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw UserException.invalidCredentials();
    }

    if (!user.emailVerifiedAt) {
      throw UserException.emailNotVerified();
    }

    // Generate tokens...
  }
}
```

#### User Profile Management

```typescript
@Injectable()
export class UsersService {
  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw UserException.userNotFound(userId.toString());
    }

    return user;
  }

  async updateProfile(userId: number, updates: UpdateProfileDto) {
    // Check if user exists
    await this.getUserProfile(userId); // Throws if not found

    // Check email uniqueness if email is being updated
    if (updates.email) {
      const emailExists = await this.findByEmail(updates.email);
      if (emailExists && emailExists.id !== userId) {
        throw UserException.emailAlreadyExists(updates.email);
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updates,
    });
  }
}
```

### 🔐 AuthException - Authentication & Authorization

#### JWT Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw AuthException.invalidToken();
    }

    if (info?.name === 'TokenExpiredError') {
      throw AuthException.tokenExpired();
    }

    if (!user) {
      throw AuthException.invalidToken();
    }

    return user;
  }
}
```

#### Role-based Access Control

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw AuthException.invalidToken();
    }

    const hasRole = requiredRoles.some((role) => user.role?.name === role);

    if (!hasRole) {
      throw AuthException.insufficientPermissions();
    }

    return true;
  }
}
```

#### API Key Authentication

```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw AuthException.invalidToken();
    }

    const isValid = await this.validateApiKey(apiKey);
    if (!isValid) {
      throw AuthException.invalidToken();
    }

    return true;
  }
}
```

### ✅ ValidationException - Input Validation

#### Custom Validation Logic

```typescript
@Injectable()
export class ProductsService {
  async createProduct(dto: CreateProductDto) {
    // Validate price range
    if (dto.price <= 0) {
      throw ValidationException.invalidInput(
        'price',
        'Giá sản phẩm phải lớn hơn 0',
      );
    }

    if (dto.price > 10000000) {
      throw ValidationException.invalidInput(
        'price',
        'Giá sản phẩm không được vượt quá 10 triệu đồng',
      );
    }

    // Validate category exists
    if (dto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!categoryExists) {
        throw ValidationException.invalidInput(
          'categoryId',
          'Danh mục không tồn tại',
        );
      }
    }

    return this.prisma.product.create({ data: dto });
  }
}
```

#### File Upload Validation

```typescript
@Injectable()
export class FileUploadService {
  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw ValidationException.missingRequiredField('file');
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw ValidationException.invalidInput(
        'file',
        'Kích thước file không được vượt quá 5MB',
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw ValidationException.invalidInput(
        'file',
        'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)',
      );
    }

    return true;
  }
}
```

#### Business Logic Validation

```typescript
@Injectable()
export class OrdersService {
  async createOrder(userId: number, items: OrderItemDto[]) {
    if (!items || items.length === 0) {
      throw ValidationException.missingRequiredField('items');
    }

    // Validate each item
    for (const item of items) {
      if (item.quantity <= 0) {
        throw ValidationException.invalidInput(
          'quantity',
          'Số lượng phải lớn hơn 0',
        );
      }

      // Check stock availability
      const sku = await this.prisma.sku.findUnique({
        where: { id: item.skuId },
      });

      if (!sku) {
        throw ValidationException.invalidInput(
          'skuId',
          `SKU ${item.skuId} không tồn tại`,
        );
      }

      if (sku.stock < item.quantity) {
        throw ValidationException.invalidInput(
          'quantity',
          `Chỉ còn ${sku.stock} sản phẩm trong kho`,
        );
      }
    }

    // Create order logic...
  }
}
```

### 📄 ResourceException - Resource Management

#### CRUD Operations

```typescript
@Injectable()
export class ProductsService {
  async getProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { brand: true, categories: true },
    });

    if (!product) {
      throw ResourceException.notFound('Product', id.toString());
    }

    return product;
  }

  async updateProduct(id: number, updates: UpdateProductDto) {
    // Ensure product exists
    await this.getProduct(id); // Throws if not found

    return this.prisma.product.update({
      where: { id },
      data: updates,
    });
  }

  async deleteProduct(id: number) {
    const product = await this.getProduct(id);

    // Check if product has orders
    const orderCount = await this.prisma.productSKUSnapshot.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      throw ResourceException.cannotDelete(
        'Product',
        'Sản phẩm đã có đơn hàng liên quan',
      );
    }

    // Check if product has active SKUs
    const skuCount = await this.prisma.sku.count({
      where: { productId: id, stock: { gt: 0 } },
    });

    if (skuCount > 0) {
      throw ResourceException.cannotDelete('Product', 'Sản phẩm còn tồn kho');
    }

    return this.prisma.product.delete({ where: { id } });
  }
}
```

#### Bulk Operations

```typescript
@Injectable()
export class CategoriesService {
  async bulkDeleteCategories(ids: number[]) {
    const categories = await this.prisma.category.findMany({
      where: { id: { in: ids } },
      include: { products: true, childCategories: true },
    });

    if (categories.length !== ids.length) {
      const foundIds = categories.map((c) => c.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw ResourceException.notFound('Categories', missingIds.join(', '));
    }

    // Check for constraints
    for (const category of categories) {
      if (category.products.length > 0) {
        throw ResourceException.cannotDelete(
          `Category "${category.name}"`,
          'Danh mục có sản phẩm liên quan',
        );
      }

      if (category.childCategories.length > 0) {
        throw ResourceException.cannotDelete(
          `Category "${category.name}"`,
          'Danh mục có danh mục con',
        );
      }
    }

    return this.prisma.category.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
```

## 🔄 Advanced Patterns

### Exception Chaining

```typescript
@Injectable()
export class OrderProcessingService {
  async processPayment(orderId: number) {
    try {
      const order = await this.getOrder(orderId);
      await this.validatePaymentMethod(order.paymentMethodId);
      await this.chargePayment(order);

      return this.updateOrderStatus(orderId, 'PAID');
    } catch (error) {
      if (error instanceof ResourceException) {
        // Order or payment method not found - let it bubble up
        throw error;
      } else if (error instanceof ValidationException) {
        // Invalid payment data - let it bubble up
        throw error;
      } else {
        // Unexpected error - wrap in generic business exception
        this.logger.error('Payment processing failed', error);
        throw new BusinessException(
          'Đã xảy ra lỗi khi xử lý thanh toán',
          'PAYMENT_PROCESSING_FAILED',
        );
      }
    }
  }

  private async validatePaymentMethod(paymentMethodId: number) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!method) {
      throw ResourceException.notFound(
        'Payment Method',
        paymentMethodId.toString(),
      );
    }

    if (!method.isActive) {
      throw ValidationException.invalidInput(
        'paymentMethod',
        'Phương thức thanh toán không khả dụng',
      );
    }

    return method;
  }
}
```

### Conditional Exception Throwing

```typescript
@Injectable()
export class UserProfileService {
  async updateUserProfile(
    currentUserId: number,
    targetUserId: number,
    updates: UpdateProfileDto,
  ) {
    const currentUser = await this.getUser(currentUserId);
    const targetUser = await this.getUser(targetUserId);

    // Check permissions
    const isOwnProfile = currentUserId === targetUserId;
    const isAdmin = currentUser.role.name === 'admin';
    const isManager = currentUser.role.name === 'manager';

    if (!isOwnProfile && !isAdmin && !isManager) {
      throw AuthException.insufficientPermissions();
    }

    // Admins can update anything
    if (isAdmin) {
      return this.updateProfile(targetUserId, updates);
    }

    // Managers can update basic info but not roles
    if (isManager) {
      if (updates.roleId) {
        throw AuthException.insufficientPermissions();
      }
      return this.updateProfile(targetUserId, updates);
    }

    // Users can only update their own non-sensitive fields
    if (isOwnProfile) {
      const allowedFields = ['name', 'avatar', 'phoneNumber'];
      const providedFields = Object.keys(updates);
      const forbiddenFields = providedFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (forbiddenFields.length > 0) {
        throw ValidationException.invalidInput(
          forbiddenFields[0],
          'Bạn không được phép cập nhật trường này',
        );
      }

      return this.updateProfile(targetUserId, updates);
    }
  }
}
```

### Transaction Exception Handling

```typescript
@Injectable()
export class OrderService {
  async createOrderWithItems(
    userId: number,
    orderData: CreateOrderDto,
    items: OrderItemDto[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      try {
        // Create order
        const order = await tx.order.create({
          data: {
            userId,
            status: 'PENDING_CONFIRMATION',
            ...orderData,
          },
        });

        // Process each item
        for (const item of items) {
          const sku = await tx.sku.findUnique({
            where: { id: item.skuId },
          });

          if (!sku) {
            throw ValidationException.invalidInput(
              'skuId',
              `SKU ${item.skuId} không tồn tại`,
            );
          }

          if (sku.stock < item.quantity) {
            throw ValidationException.invalidInput(
              'quantity',
              `SKU ${item.skuId} chỉ còn ${sku.stock} sản phẩm`,
            );
          }

          // Create order item snapshot
          await tx.productSKUSnapshot.create({
            data: {
              orderId: order.id,
              skuId: sku.id,
              productId: sku.productId,
              productName: item.productName,
              skuValue: sku.value,
              price: sku.price,
              quantity: item.quantity,
              images: sku.images,
            },
          });

          // Update stock
          await tx.sku.update({
            where: { id: item.skuId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return order;
      } catch (error) {
        // Transaction will auto-rollback
        // Let our custom exceptions bubble up
        throw error;
      }
    });
  }
}
```

## 🧪 Testing Exception Handling

### Unit Testing Services

```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should throw UserException when email already exists', async () => {
      // Arrange
      const dto = { email: 'existing@example.com', ... };
      const existingUser = { id: 1, email: dto.email };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(dto))
        .rejects
        .toThrow(UserException);

      // More specific assertion
      try {
        await authService.register(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(UserException);
        expect(error.getStatus()).toBe(409);
        expect(error.getResponse()).toMatchObject({
          code: 'EMAIL_ALREADY_EXISTS',
          message: expect.stringContaining(dto.email)
        });
      }
    });
  });
});
```

### Integration Testing

```typescript
describe('Auth Controller (e2e)', () => {
  it('should return 409 for duplicate email registration', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      phoneNumber: '+84901234567',
    };

    // First registration - should succeed
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Second registration - should fail
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userData)
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: expect.stringContaining(userData.email),
        statusCode: 409,
        timestamp: expect.any(String),
        path: '/api/auth/register',
      },
    });
  });
});
```

## 🚨 Best Practices

### ✅ Do

- **Use specific exception types** cho từng business domain
- **Provide meaningful messages** trong tiếng Việt
- **Include relevant context** trong error messages
- **Let Prisma errors bubble up** để PrismaExceptionFilter handle
- **Use semantic error codes** cho API consumers
- **Test exception scenarios** thoroughly

### ❌ Don't

- **Mix exception types** (don't use UserException cho product errors)
- **Catch and re-throw** without adding value
- **Include sensitive information** trong error messages
- **Use generic exceptions** when specific ones exist
- **Forget to test error paths**
- **Log passwords or tokens** trong error context

### Exception Selection Guide

```typescript
// User-related errors
throw UserException.emailAlreadyExists(email); // ✅
throw new ConflictException('Email exists'); // ❌

// Resource not found
throw ResourceException.notFound('Product', id); // ✅
throw new NotFoundException('Product not found'); // ❌

// Validation errors
throw ValidationException.invalidInput(field, reason); // ✅
throw new BadRequestException('Invalid input'); // ❌

// Auth errors
throw AuthException.insufficientPermissions(); // ✅
throw new ForbiddenException('Access denied'); // ❌
```

## 🔧 Performance Considerations

### Exception Performance

- **Throwing exceptions** có performance cost - chỉ use cho exceptional cases
- **Avoid throwing exceptions** trong hot paths hoặc loops
- **Prefer validation** trước khi attempt operations
- **Cache expensive validations** when possible

### Example: Optimized User Validation

```typescript
// ❌ Expensive - throws exception in loop
async validateUsersExist(userIds: number[]) {
  for (const id of userIds) {
    await this.getUser(id); // Throws if not found
  }
}

// ✅ Optimized - batch check first
async validateUsersExist(userIds: number[]) {
  const users = await this.prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true }
  });

  const foundIds = users.map(u => u.id);
  const missingIds = userIds.filter(id => !foundIds.includes(id));

  if (missingIds.length > 0) {
    throw ResourceException.notFound('Users', missingIds.join(', '));
  }
}
```

## 📞 Troubleshooting

### Common Issues

1. **Exception not being caught by filter**
   - Check filter registration order trong main.ts
   - Verify exception extends from correct base class

2. **Inconsistent error format**
   - Ensure GlobalExceptionFilter is registered
   - Check if custom exception structure is correct

3. **Missing error context trong logs**
   - Verify LoggingInterceptor is registered
   - Check if request context is available

4. **Prisma errors not being handled**
   - Verify PrismaExceptionFilter import path
   - Check filter registration order (Prisma before Global)

### Debug Tips

```typescript
// Add debugging trong services
console.log('About to throw:', exception.constructor.name);

// Check exception filter execution
// In filter:
console.log('Filter handling:', exception.constructor.name);
```
