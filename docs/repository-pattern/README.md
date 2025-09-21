# Repository Pattern Implementation

## Tổng quan

Repository Pattern đã được áp dụng cho ứng dụng NestJS e-commerce để tạo ra một abstraction layer giữa business logic và data access layer. Pattern này giúp:

- Tách biệt business logic khỏi database logic
- Dễ dàng testing thông qua mocking repositories
- Tăng khả năng maintain và extend code
- Chuẩn hóa cách truy cập dữ liệu

## Cấu trúc

### 1. Base Repository

#### Interface

```typescript
// src/shared/repositories/interfaces/base-repository.interface.ts
export interface BaseRepositoryInterface<T, TWhereUnique = { id: number }>
```

Định nghĩa các operations cơ bản:

- `findMany()`, `findUnique()`, `findFirst()`
- `create()`, `update()`, `delete()`
- `softDelete()`, `restore()`
- `count()`, `exists()`
- `findManyWithPagination()`

#### Implementation

```typescript
// src/shared/repositories/base-repository.ts
export abstract class BaseRepository<T extends AuditableEntity, TWhereUnique = { id: number }>
```

Cung cấp implementation cơ bản cho tất cả operations, với hỗ trợ:

- Soft delete (tự động exclude deleted records)
- Audit trail (tự động set createdAt, updatedAt)
- Pagination helpers
- Generic type safety

### 2. Entity Repositories

#### User Repository

```typescript
// src/users/repositories/user.repository.ts
export class UserRepository extends BaseRepository<User>
```

Chức năng chuyên biệt:

- `findByEmail()`, `findByEmailWithRole()`
- `createUser()`, `markEmailVerified()`
- `updateUserStatus()`, `searchUsers()`
- `getUsersWithPagination()`

#### Role Repository

```typescript
// src/users/repositories/role.repository.ts
export class RoleRepository extends BaseRepository<Role>
```

Chức năng chuyên biệt:

- `findByName()`, `findDefaultUserRole()`
- `findByIdWithPermissions()`, `findAllActiveRoles()`
- `createRoleWithPermissions()`, `updateRolePermissions()`
- `toggleRoleStatus()`, `getRoleUsageStats()`

#### Verification Code Repository

```typescript
// src/auth/repositories/verification-code.repository.ts
export class VerificationCodeRepository
```

Chức năng chuyên biệt:

- `findValidCode()`, `findLatestByEmailAndType()`
- `deleteByEmailAndType()`, `deleteExpiredCodes()`
- `isCodeRecentlyCreated()`, `getCodeStatistics()`

### 3. Repository Module

```typescript
// src/shared/repositories/repository.module.ts
@Module({
  imports: [PrismaModule],
  providers: [UserRepository, RoleRepository, VerificationCodeRepository],
  exports: [UserRepository, RoleRepository, VerificationCodeRepository],
})
export class RepositoryModule {}
```

Quản lý dependencies và exports tất cả repositories.

## Services được Refactor

### UsersService

**Trước:**

```typescript
constructor(private readonly prisma: PrismaService) {}
```

**Sau:**

```typescript
constructor(
  private readonly userRepository: UserRepository,
  private readonly roleRepository: RoleRepository,
) {}
```

**Lợi ích:**

- Không còn phụ thuộc trực tiếp vào Prisma
- Business logic rõ ràng hơn
- Dễ test với mock repositories

### AuthService

**Trước:**

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly usersService: UsersService,
  private readonly mailer: MailerService,
) {}
```

**Sau:**

```typescript
constructor(
  private readonly usersService: UsersService,
  private readonly mailer: MailerService,
  private readonly verificationCodeRepository: VerificationCodeRepository,
) {}
```

**Cải thiện:**

- Tách logic verification code thành repository riêng
- Xử lý throttling và cleanup tốt hơn
- Code readable và maintainable hơn

## Modules được Update

### UsersModule

```typescript
@Module({
  imports: [RepositoryModule], // Thay vì PrismaModule
  providers: [UsersService],
  exports: [UsersService],
})
```

### AuthModule

```typescript
@Module({
  imports: [RepositoryModule, UsersModule, MailerModule],
  controllers: [AuthController],
  providers: [AuthService],
})
```

## Lợi ích đạt được

### 1. Separation of Concerns

- Business logic tách biệt hoàn toàn khỏi database access
- Mỗi repository chỉ quan tâm đến entity của nó

### 2. Testability

- Services có thể test dễ dàng với mock repositories
- Repository có thể test riêng biệt

### 3. Consistency

- Tất cả database operations theo cùng một pattern
- Soft delete và audit trail được handle tự động

### 4. Extensibility

- Dễ dàng thêm repository mới cho entities khác
- Base repository cung cấp foundation mạnh mẽ

### 5. Type Safety

- Full TypeScript support với generic types
- Compile-time checking cho database operations

## Hướng dẫn mở rộng

### Thêm Repository mới

1. Tạo interface nếu cần:

```typescript
// src/modules/products/repositories/interfaces/product-repository.interface.ts
export interface ProductRepositoryInterface
  extends BaseRepositoryInterface<Product> {
  findByCategory(categoryId: number): Promise<Product[]>;
}
```

2. Implement repository:

```typescript
// src/modules/products/repositories/product.repository.ts
@Injectable()
export class ProductRepository
  extends BaseRepository<Product>
  implements ProductRepositoryInterface
{
  protected modelName = 'product';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.findMany({
      where: {
        categories: {
          some: { id: categoryId },
        },
      },
      include: { brand: true, translations: true },
    });
  }
}
```

3. Thêm vào RepositoryModule:

```typescript
@Module({
  imports: [PrismaModule],
  providers: [
    // existing repositories...
    ProductRepository,
  ],
  exports: [
    // existing repositories...
    ProductRepository,
  ],
})
export class RepositoryModule {}
```

4. Inject vào service:

```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}
}
```

### Best Practices

1. **Đặt tên rõ ràng**: Repository methods nên có tên mô tả chức năng
2. **Sử dụng includes**: Chỉ include relations khi thực sự cần
3. **Pagination**: Luôn có pagination cho list operations
4. **Error handling**: Let repositories throw, handle ở service layer
5. **Transaction**: Sử dụng Prisma transactions cho complex operations

## Testing

Ví dụ test cho service với mock repository:

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      markEmailVerified: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RoleRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
  });

  it('should find user by email', async () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    userRepository.findByEmail.mockResolvedValue(mockUser as any);

    const result = await service.findByEmail('test@test.com');

    expect(result).toEqual(mockUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
  });
});
```

Repository Pattern giúp codebase trở nên có cấu trúc, dễ maintain và test hơn rất nhiều.
