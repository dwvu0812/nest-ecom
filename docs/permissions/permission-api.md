# Permission Management API

## 📋 Tổng quan

API quản lý permissions trong hệ thống NestJS E-commerce. Permissions được sử dụng để kiểm soát quyền truy cập vào các endpoints và tài nguyên trong ứng dụng.

## 🏗️ Cấu trúc Permission

### Permission Model

```typescript
interface Permission {
  id: number;
  name: string; // Tên permission (VD: "View Users")
  description: string; // Mô tả chi tiết
  path: string; // API path (VD: "/users")
  method: HTTPMethod; // HTTP method (GET, POST, PUT, DELETE, PATCH)
  createdById?: number; // ID user tạo
  updatedById?: number; // ID user cập nhật
  deletedAt?: Date; // Soft delete timestamp
  createdAt: Date; // Thời gian tạo
  updatedAt: Date; // Thời gian cập nhật
}
```

### HTTPMethod Enum

```typescript
enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
```

## 🚀 API Endpoints

### Base URL

```
/permissions
```

### 1. Lấy danh sách tất cả Permissions

**GET** `/permissions`

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "View Users",
      "description": "Permission to view user list",
      "path": "/users",
      "method": "GET",
      "createdById": 1,
      "updatedById": 1,
      "deletedAt": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "createdBy": {
        "id": 1,
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User"
      },
      "updatedBy": {
        "id": 1,
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User"
      }
    }
  ],
  "message": "Permissions retrieved successfully"
}
```

### 2. Lấy Permission theo ID

**GET** `/permissions/:permissionId`

#### Parameters

- `permissionId` (number): ID của permission

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "View Users",
    "description": "Permission to view user list",
    "path": "/users",
    "method": "GET",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "createdBy": {
      "id": 1,
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User"
    },
    "updatedBy": {
      "id": 1,
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User"
    }
  },
  "message": "Permission retrieved successfully"
}
```

#### Error Response (404)

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Permission not found",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/permissions/999",
    "statusCode": 404
  }
}
```

### 3. Tạo Permission mới

**POST** `/permissions`

#### Request Body

```json
{
  "name": "Create Product",
  "description": "Permission to create new products",
  "path": "/products",
  "method": "POST"
}
```

#### Validation Rules

- `name`: Required, string, không được trống
- `description`: Required, string, không được trống
- `path`: Required, string, không được trống
- `method`: Required, phải là một trong các giá trị: GET, POST, PUT, DELETE, PATCH

#### Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Create Product",
    "description": "Permission to create new products",
    "path": "/products",
    "method": "POST",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "message": "Permission created successfully"
}
```

#### Error Response (409 - Conflict)

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "Permission with name 'Create Product' and method 'POST' already exists",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/permissions",
    "statusCode": 409
  }
}
```

### 4. Cập nhật Permission

**PUT** `/permissions/:permissionId`

#### Parameters

- `permissionId` (number): ID của permission cần cập nhật

#### Request Body

```json
{
  "description": "Updated permission description",
  "method": "PUT"
}
```

#### Validation Rules

- Tất cả fields đều optional
- Nếu cung cấp `name` và `method`, sẽ kiểm tra trùng lặp
- Nếu cung cấp `path` và `method`, sẽ kiểm tra trùng lặp

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "View Users",
    "description": "Updated permission description",
    "path": "/users",
    "method": "PUT",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  },
  "message": "Permission updated successfully"
}
```

### 5. Xóa Permission (Soft Delete)

**DELETE** `/permissions/:permissionId`

#### Parameters

- `permissionId` (number): ID của permission cần xóa

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "View Users",
    "description": "Permission to view user list",
    "path": "/users",
    "method": "GET",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": "2024-01-01T12:00:00.000Z",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Permission deleted successfully"
}
```

## 🔒 Business Rules

### 1. Unique Constraints

- **Name + Method**: Không được có 2 permissions với cùng `name` và `method`
- **Path + Method**: Không được có 2 permissions với cùng `path` và `method`

### 2. Soft Delete

- Permissions không bị xóa vĩnh viễn
- Sử dụng `deletedAt` field để đánh dấu đã xóa
- API chỉ trả về permissions chưa bị xóa (`deletedAt = null`)

### 3. Audit Trail

- Tự động tracking user tạo permission (`createdById`)
- Tự động tracking user cập nhật permission (`updatedById`)
- Timestamps tự động với `createdAt` và `updatedAt`

## 📊 Error Codes

| Code                      | HTTP Status | Mô tả                                                      |
| ------------------------- | ----------- | ---------------------------------------------------------- |
| `RESOURCE_NOT_FOUND`      | 404         | Permission không tồn tại                                   |
| `RESOURCE_ALREADY_EXISTS` | 409         | Permission đã tồn tại (trùng name+method hoặc path+method) |
| `VALIDATION_ERROR`        | 400         | Dữ liệu đầu vào không hợp lệ                               |

## 🧪 Testing Examples

### 1. Tạo Permission mới

```bash
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delete User",
    "description": "Permission to delete users",
    "path": "/users",
    "method": "DELETE"
  }'
```

### 2. Lấy danh sách Permissions

```bash
curl -X GET http://localhost:3000/permissions
```

### 3. Cập nhật Permission

```bash
curl -X PUT http://localhost:3000/permissions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```

### 4. Xóa Permission

```bash
curl -X DELETE http://localhost:3000/permissions/1
```

## 🔧 Integration với Role System

Permissions được liên kết với Roles thông qua many-to-many relationship:

```typescript
// Trong Role model
permissions Permission[] @relation("PermissionsRoles")

// Trong Permission model
roles Role[] @relation("PermissionsRoles")
```

Điều này cho phép:

- Gán nhiều permissions cho một role
- Một permission có thể được gán cho nhiều roles
- Quản lý quyền truy cập linh hoạt và có cấu trúc

## 📝 Best Practices

### 1. Naming Convention

- Sử dụng tên mô tả rõ ràng: "View Users", "Create Product", "Delete Order"
- Tránh tên chung chung như "Permission 1", "Test Permission"

### 2. Path Design

- Sử dụng RESTful paths: `/users`, `/products`, `/orders`
- Tránh paths phức tạp: `/api/v1/admin/users/management`

### 3. Method Mapping

- `GET`: Xem, đọc dữ liệu
- `POST`: Tạo mới
- `PUT`: Cập nhật toàn bộ
- `PATCH`: Cập nhật một phần
- `DELETE`: Xóa

### 4. Description

- Mô tả rõ ràng mục đích của permission
- Giải thích phạm vi quyền hạn
- Ví dụ: "Allows viewing user profiles and basic information"

---

**API Version**: 1.0.0  
**Last Updated**: January 2024  
**Module**: PermissionsModule
