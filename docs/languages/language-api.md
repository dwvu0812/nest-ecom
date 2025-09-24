# Language API Documentation

## Tổng quan

Language API cung cấp các chức năng quản lý ngôn ngữ hệ thống, bao gồm xem danh sách, tạo mới, cập nhật và xóa ngôn ngữ.

## Base URL

Tất cả các endpoints đều sử dụng prefix: `/languages`

## Endpoints

### 1. Lấy danh sách tất cả ngôn ngữ

**GET** `/languages`

Lấy danh sách tất cả ngôn ngữ hiện có (không cần phân trang).

#### Headers (Optional)

```
Authorization: Bearer <access-token>
```

#### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "English",
      "code": "en",
      "createdById": 1,
      "updatedById": null,
      "deletedAt": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Tiếng Việt",
      "code": "vi",
      "createdById": 1,
      "updatedById": 2,
      "deletedAt": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-02T10:00:00.000Z"
    }
  ],
  "message": "Languages retrieved successfully"
}
```

---

### 2. Lấy chi tiết ngôn ngữ

**GET** `/languages/:languageId`

Lấy thông tin chi tiết của một ngôn ngữ cụ thể.

#### Path Parameters

| Parameter    | Type   | Required | Description     |
| ------------ | ------ | -------- | --------------- |
| `languageId` | number | ✅       | ID của ngôn ngữ |

#### Headers (Optional)

```
Authorization: Bearer <access-token>
```

#### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "English",
    "code": "en",
    "createdById": 1,
    "updatedById": null,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "message": "Language retrieved successfully"
}
```

#### Error Responses

**404 Not Found** - Ngôn ngữ không tồn tại

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Language not found",
    "statusCode": 404,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages/999"
  }
}
```

**400 Bad Request** - ID không hợp lệ

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed (numeric string is expected)",
    "statusCode": 400,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages/invalid"
  }
}
```

---

### 3. Tạo ngôn ngữ mới

**POST** `/languages`

Tạo một ngôn ngữ mới trong hệ thống.

#### Headers (Optional)

```
Authorization: Bearer <access-token>
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "Français",
  "code": "fr"
}
```

#### Request Body Schema

| Field  | Type   | Required | Constraints       | Description                     |
| ------ | ------ | -------- | ----------------- | ------------------------------- |
| `name` | string | ✅       | Non-empty         | Tên ngôn ngữ                    |
| `code` | string | ✅       | Non-empty, Unique | Mã ngôn ngữ (ví dụ: en, vi, fr) |

#### Response (Success - 201 Created)

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Français",
    "code": "fr",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "message": "Language created successfully"
}
```

#### Error Responses

**409 Conflict** - Mã ngôn ngữ đã tồn tại

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_EXISTS",
    "message": "Language code already exists",
    "statusCode": 409,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages"
  }
}
```

**400 Bad Request** - Dữ liệu không hợp lệ

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name should not be empty",
    "statusCode": 400,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages"
  }
}
```

---

### 4. Cập nhật ngôn ngữ

**PUT** `/languages/:languageId`

Cập nhật thông tin của một ngôn ngữ hiện có.

#### Path Parameters

| Parameter    | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| `languageId` | number | ✅       | ID của ngôn ngữ cần cập nhật |

#### Headers (Optional)

```
Authorization: Bearer <access-token>
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "English (US)",
  "code": "en-us"
}
```

#### Request Body Schema

| Field  | Type   | Required | Constraints       | Description      |
| ------ | ------ | -------- | ----------------- | ---------------- |
| `name` | string | ❌       | Non-empty         | Tên ngôn ngữ mới |
| `code` | string | ❌       | Non-empty, Unique | Mã ngôn ngữ mới  |

**Lưu ý:** Tất cả các trường đều optional, chỉ cần gửi các trường muốn cập nhật.

#### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "English (US)",
    "code": "en-us",
    "createdById": 1,
    "updatedById": 2,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-02T10:00:00.000Z"
  },
  "message": "Language updated successfully"
}
```

#### Error Responses

**404 Not Found** - Ngôn ngữ không tồn tại

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Language not found",
    "statusCode": 404,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages/999"
  }
}
```

**409 Conflict** - Mã ngôn ngữ đã tồn tại cho ngôn ngữ khác

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_EXISTS",
    "message": "Language code already exists",
    "statusCode": 409,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages/1"
  }
}
```

---

### 5. Xóa ngôn ngữ

**DELETE** `/languages/:languageId`

Xóa mềm (soft delete) một ngôn ngữ khỏi hệ thống.

#### Path Parameters

| Parameter    | Type   | Required | Description             |
| ------------ | ------ | -------- | ----------------------- |
| `languageId` | number | ✅       | ID của ngôn ngữ cần xóa |

#### Headers (Optional)

```
Authorization: Bearer <access-token>
```

#### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "English",
    "code": "en",
    "createdById": 1,
    "updatedById": 2,
    "deletedAt": "2024-01-02T10:00:00.000Z",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-02T10:00:00.000Z"
  },
  "message": "Language deleted successfully"
}
```

#### Error Responses

**404 Not Found** - Ngôn ngữ không tồn tại

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Language not found",
    "statusCode": 404,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages/999"
  }
}
```

---

## Sử dụng trong Code

### 1. Import Language Service

```typescript
import { LanguagesService } from '../languages/languages.service';

@Injectable()
export class YourService {
  constructor(private readonly languagesService: LanguagesService) {}

  async getAvailableLanguages() {
    return this.languagesService.findAll();
  }
}
```

### 2. Protected Endpoints (Optional)

Language endpoints có thể hoạt động với hoặc không có authentication. Khi có user đăng nhập, hệ thống sẽ tự động lưu thông tin audit trail.

```typescript
import { UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('languages')
@UseGuards(OptionalJwtAuthGuard)
export class LanguagesController {
  // Endpoints will work with or without authentication
}
```

### 3. Validation với DTOs

```typescript
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

// DTO sẽ tự động validate input
@Post()
async create(@Body() createLanguageDto: CreateLanguageDto) {
  return this.languagesService.create(createLanguageDto);
}
```

---

## Database Schema

### Language Model

```prisma
model Language {
  id   Int    @id @default(autoincrement())
  name String
  code String @unique

  createdById Int?
  updatedById Int?

  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relations
  createdBy            User?                 @relation("LanguageCreatedBy", fields: [createdById], references: [id])
  updatedBy            User?                 @relation("LanguageUpdatedBy", fields: [updatedById], references: [id])
  userTranslations     UserTranslation[]
  productTranslations  ProductTranslation[]
  categoryTranslations CategoryTranslation[]
  brandTranslations    BrandTranslation[]
}
```

### Indexes

- **Primary Key**: `id`
- **Unique Index**: `code`
- **Soft Delete**: Các query tự động exclude records có `deletedAt IS NOT NULL`

---

## Business Logic

### 1. Unique Code Validation

- Mỗi language phải có `code` unique trong toàn bộ hệ thống
- Kiểm tra này được thực hiện ở cả DTO validation và business logic level

### 2. Soft Delete

- Khi xóa language, record không bị xóa vĩnh viễn
- Thay vào đó, field `deletedAt` được set với timestamp hiện tại
- Các queries tự động lọc ra records đã bị soft delete

### 3. Audit Trail

- Tự động lưu `createdById` khi tạo record
- Tự động lưu `updatedById` khi cập nhật record
- Timestamps `createdAt` và `updatedAt` được tự động quản lý

### 4. Relations

Language model có relation với:

- **User**: createdBy, updatedBy
- **UserTranslation**: Translation cho user profiles
- **ProductTranslation**: Translation cho products
- **CategoryTranslation**: Translation cho categories
- **BrandTranslation**: Translation cho brands

---

## Error Handling

Tất cả errors được xử lý bởi Global Exception Filter và trả về format consistent:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "statusCode": 400,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages/endpoint"
  }
}
```

### Common Error Codes

- `NOT_FOUND`: Resource không tồn tại
- `ALREADY_EXISTS`: Dữ liệu đã tồn tại (duplicate)
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_SERVER_ERROR`: Lỗi server

---

## Testing

### Unit Tests Example

```typescript
describe('LanguagesService', () => {
  let service: LanguagesService;

  it('should create a new language', async () => {
    const dto = { name: 'Spanish', code: 'es' };
    const result = await service.create(dto);

    expect(result.name).toBe('Spanish');
    expect(result.code).toBe('es');
  });

  it('should throw error for duplicate code', async () => {
    const dto = { name: 'English', code: 'en' };

    await expect(service.create(dto)).rejects.toThrow(
      'Language code already exists',
    );
  });
});
```

### API Tests Example

```typescript
describe('/languages (e2e)', () => {
  it('/languages (GET)', () => {
    return request(app.getHttpServer())
      .get('/languages')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

---

## Performance Considerations

### 1. Database Queries

- GET `/languages` sử dụng simple query với ordering
- Không có pagination vì số lượng languages thường không quá nhiều
- Soft delete filter được áp dụng tự động

### 2. Caching (Tương lai)

Language data ít thay đổi, có thể implement caching:

```typescript
@Cacheable('languages')
async findAll(): Promise<Language[]> {
  return this.languageRepository.findAllActive();
}
```

### 3. Indexing

- Primary key index trên `id`
- Unique index trên `code`
- Có thể thêm index trên `name` nếu cần search

---

## Security Notes

1. **Authentication**: Tất cả endpoints đều optional auth, nhưng audit trail yêu cầu user context
2. **Validation**: Input validation được xử lý bởi class-validator DTOs
3. **SQL Injection**: Sử dụng Prisma ORM để tránh SQL injection
4. **Rate Limiting**: Có thể implement rate limiting cho create/update/delete endpoints

---

## 🧪 Testing & Examples

Để test các API endpoints, xem:

- **[API Examples & Testing Guide](./api-examples.md)** - Postman collection, curl examples và testing scripts

---

## 📚 Related Documentation

- **[API Examples](./api-examples.md)** - Testing examples và Postman collection
- **[Main Documentation](../README.md)** - Quay về tài liệu tổng quan
- **[Exception Handling](../exception-handling/README.md)** - Error handling system
- **[Authentication](../authentication/login-api.md)** - JWT authentication system

---

**Documentation Version**: 1.0.0  
**Last Updated**: January 2024  
**API Version**: v1
