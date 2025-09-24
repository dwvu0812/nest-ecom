# Permission Management System

## 📋 Tổng quan

Permission Management System là một module hoàn chỉnh trong NestJS E-commerce application, cung cấp khả năng quản lý permissions và quyền truy cập một cách linh hoạt và có cấu trúc.

## 🏗️ Kiến trúc hệ thống

### Module Structure

```
src/permissions/
├── dto/
│   ├── create-permission.dto.ts    # Validation cho tạo permission
│   └── update-permission.dto.ts    # Validation cho cập nhật permission
├── repositories/
│   └── permission.repository.ts    # Database operations
├── permissions.controller.ts       # REST API endpoints
├── permissions.service.ts          # Business logic
└── permissions.module.ts           # Module configuration
```

### Database Schema

```prisma
model Permission {
  id          Int        @id @default(autoincrement())
  name        String     // Tên permission (VD: "View Users")
  description String     // Mô tả chi tiết
  path        String     // API path (VD: "/users")
  method      HTTPMethod // HTTP method (GET, POST, PUT, DELETE, PATCH)

  createdById Int?       // ID user tạo
  updatedById Int?       // ID user cập nhật

  deletedAt DateTime?    // Soft delete timestamp
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  // Relations
  createdBy User?  @relation("PermissionCreatedBy", fields: [createdById], references: [id])
  updatedBy User?  @relation("PermissionUpdatedBy", fields: [updatedById], references: [id])
  roles     Role[] @relation("PermissionsRoles")
}
```

## 🚀 Tính năng chính

### ✅ CRUD Operations

- **Create**: Tạo permission mới với validation
- **Read**: Lấy danh sách và chi tiết permissions
- **Update**: Cập nhật permission với kiểm tra trùng lặp
- **Delete**: Soft delete permission

### ✅ Business Rules

- **Unique Constraints**: Không cho phép trùng lặp name+method hoặc path+method
- **Soft Delete**: Permissions không bị xóa vĩnh viễn
- **Audit Trail**: Tracking user tạo/cập nhật và timestamps

### ✅ Validation & Error Handling

- **Input Validation**: Sử dụng class-validator decorators
- **Business Logic Validation**: Kiểm tra trùng lặp và business rules
- **Consistent Error Responses**: Sử dụng ResourceException

## 📚 Tài liệu chi tiết

### API Documentation

- **[Permission API](./permission-api.md)** - Complete API reference với examples
- **[API Examples](./api-examples.md)** - Testing examples, Postman collection, và use cases

### Quick Links

- **[API Endpoints](./permission-api.md#-api-endpoints)** - Danh sách tất cả endpoints
- **[Business Rules](./permission-api.md#-business-rules)** - Quy tắc business logic
- **[Error Codes](./permission-api.md#-error-codes)** - Mã lỗi và xử lý
- **[Testing Examples](./api-examples.md#-test-scenarios)** - Scenarios test thực tế

## 🔧 Cách sử dụng

### 1. Tạo Permission mới

```typescript
// POST /permissions
{
  "name": "View Users",
  "description": "Permission to view user list and profiles",
  "path": "/users",
  "method": "GET"
}
```

### 2. Lấy danh sách Permissions

```typescript
// GET /permissions
// Trả về tất cả permissions chưa bị xóa
```

### 3. Cập nhật Permission

```typescript
// PUT /permissions/:id
{
  "description": "Updated permission description"
}
```

### 4. Xóa Permission

```typescript
// DELETE /permissions/:id
// Soft delete - chỉ đánh dấu deletedAt
```

## 🔒 Integration với Role System

Permissions được liên kết với Roles thông qua many-to-many relationship:

```typescript
// Role có thể có nhiều permissions
interface Role {
  permissions: Permission[];
}

// Permission có thể được gán cho nhiều roles
interface Permission {
  roles: Role[];
}
```

Điều này cho phép:

- **Flexible Access Control**: Gán permissions linh hoạt cho roles
- **Granular Permissions**: Quản lý quyền chi tiết theo từng action
- **Scalable System**: Dễ dàng mở rộng khi có thêm features

## 🎯 Use Cases

### 1. E-commerce Admin

- Quản lý products, orders, users
- Full access to admin dashboard
- System configuration permissions

### 2. Customer

- View own profile và orders
- Update personal information
- Limited access to public features

### 3. Staff

- View và manage orders
- Update order status
- Limited admin access

## 🧪 Testing

### Unit Tests

```bash
npm run test permissions
```

### Integration Tests

```bash
npm run test:e2e permissions
```

### Manual Testing

Sử dụng [API Examples](./api-examples.md) để test thủ công.

## 📊 Monitoring & Logging

### Audit Trail

- Tất cả operations được log với user context
- Timestamps cho create/update/delete
- Soft delete tracking

### Error Tracking

- Structured error logging
- Business rule violation tracking
- Performance monitoring

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Logging
LOG_LEVEL="info"
```

### Module Registration

```typescript
// app.module.ts
@Module({
  imports: [
    PermissionsModule, // Đã được import
    // ... other modules
  ],
})
export class AppModule {}
```

## 🚀 Performance

### Database Optimization

- Indexes trên các fields thường query
- Soft delete filtering
- Efficient relationship loading

### Caching Strategy

- Permission list caching
- Role-permission mapping cache
- Invalidation on updates

## 🔄 Future Enhancements

### Planned Features

- **Permission Groups**: Nhóm permissions theo feature
- **Dynamic Permissions**: Runtime permission creation
- **Permission Templates**: Pre-defined permission sets
- **Advanced Filtering**: Search và filter permissions
- **Bulk Operations**: Mass create/update/delete

### Integration Plans

- **RBAC Middleware**: Automatic permission checking
- **Frontend Integration**: Permission-based UI rendering
- **API Gateway**: Centralized permission management

## 📞 Support

### Common Issues

1. **Duplicate Permission Error** → Kiểm tra name+method hoặc path+method
2. **Validation Errors** → Đảm bảo required fields và valid HTTP methods
3. **Permission Not Found** → Kiểm tra ID và soft delete status

### Getting Help

- Xem [API Examples](./api-examples.md#-troubleshooting)
- Check logs để identify issues
- Review [Business Rules](./permission-api.md#-business-rules)

---

**System Version**: 1.0.0  
**Last Updated**: January 2024  
**Module**: PermissionsModule
