# Permission API Examples

## 📋 Tổng quan

Tài liệu này cung cấp các ví dụ thực tế để test và sử dụng Permission API. Bao gồm Postman collection, curl commands, và test scenarios.

## 🚀 Quick Start Examples

### 1. Tạo Permission cơ bản

```bash
# Tạo permission để xem danh sách users
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "View Users",
    "description": "Permission to view user list and profiles",
    "path": "/users",
    "method": "GET"
  }'
```

### 2. Tạo permission cho CRUD operations

```bash
# Create User Permission
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Create User",
    "description": "Permission to create new users",
    "path": "/users",
    "method": "POST"
  }'

# Update User Permission
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Update User",
    "description": "Permission to update user information",
    "path": "/users",
    "method": "PUT"
  }'

# Delete User Permission
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delete User",
    "description": "Permission to delete users",
    "path": "/users",
    "method": "DELETE"
  }'
```

### 3. Tạo permissions cho Product management

```bash
# Product CRUD Permissions
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "View Products",
    "description": "Permission to view product catalog",
    "path": "/products",
    "method": "GET"
  }'

curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Create Product",
    "description": "Permission to add new products",
    "path": "/products",
    "method": "POST"
  }'

curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Update Product",
    "description": "Permission to modify product information",
    "path": "/products",
    "method": "PUT"
  }'

curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delete Product",
    "description": "Permission to remove products",
    "path": "/products",
    "method": "DELETE"
  }'
```

## 📊 Postman Collection

### Environment Variables

Tạo environment trong Postman với các variables:

```json
{
  "baseUrl": "http://localhost:3000",
  "permissionId": "1"
}
```

### Collection Structure

```json
{
  "info": {
    "name": "Permission Management API",
    "description": "Complete CRUD operations for Permission management"
  },
  "item": [
    {
      "name": "Get All Permissions",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/permissions",
          "host": ["{{baseUrl}}"],
          "path": ["permissions"]
        }
      }
    },
    {
      "name": "Get Permission by ID",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/permissions/{{permissionId}}",
          "host": ["{{baseUrl}}"],
          "path": ["permissions", "{{permissionId}}"]
        }
      }
    },
    {
      "name": "Create Permission",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"View Orders\",\n  \"description\": \"Permission to view order list\",\n  \"path\": \"/orders\",\n  \"method\": \"GET\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/permissions",
          "host": ["{{baseUrl}}"],
          "path": ["permissions"]
        }
      }
    },
    {
      "name": "Update Permission",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"description\": \"Updated permission description\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/permissions/{{permissionId}}",
          "host": ["{{baseUrl}}"],
          "path": ["permissions", "{{permissionId}}"]
        }
      }
    },
    {
      "name": "Delete Permission",
      "request": {
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/permissions/{{permissionId}}",
          "host": ["{{baseUrl}}"],
          "path": ["permissions", "{{permissionId}}"]
        }
      }
    }
  ]
}
```

## 🧪 Test Scenarios

### Scenario 1: Tạo Permission Set hoàn chỉnh cho User Management

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Creating User Management Permissions..."

# View Users
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "View Users",
    "description": "Permission to view user list and profiles",
    "path": "/users",
    "method": "GET"
  }'

# Create User
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Create User",
    "description": "Permission to create new users",
    "path": "/users",
    "method": "POST"
  }'

# Update User
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Update User",
    "description": "Permission to update user information",
    "path": "/users",
    "method": "PUT"
  }'

# Delete User
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delete User",
    "description": "Permission to delete users",
    "path": "/users",
    "method": "DELETE"
  }'

echo "User Management Permissions created successfully!"
```

### Scenario 2: Test Validation và Error Handling

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing validation and error handling..."

# Test 1: Duplicate name + method
echo "Test 1: Creating duplicate permission..."
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "View Users",
    "description": "Another view users permission",
    "path": "/users",
    "method": "GET"
  }'

# Test 2: Duplicate path + method
echo "Test 2: Creating permission with duplicate path + method..."
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "List Users",
    "description": "Another permission for same path",
    "path": "/users",
    "method": "GET"
  }'

# Test 3: Invalid HTTP method
echo "Test 3: Creating permission with invalid method..."
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Method",
    "description": "Permission with invalid method",
    "path": "/test",
    "method": "INVALID"
  }'

# Test 4: Missing required fields
echo "Test 4: Creating permission with missing fields..."
curl -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incomplete Permission"
  }'

# Test 5: Get non-existent permission
echo "Test 5: Getting non-existent permission..."
curl -X GET $BASE_URL/permissions/99999

echo "Validation tests completed!"
```

### Scenario 3: Update và Delete Operations

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing update and delete operations..."

# First, create a permission to work with
echo "Creating test permission..."
RESPONSE=$(curl -s -X POST $BASE_URL/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Permission",
    "description": "Permission for testing",
    "path": "/test",
    "method": "GET"
  }')

# Extract ID from response (requires jq)
PERMISSION_ID=$(echo $RESPONSE | jq -r '.data.id')
echo "Created permission with ID: $PERMISSION_ID"

# Test update
echo "Updating permission..."
curl -X PUT $BASE_URL/permissions/$PERMISSION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated test permission description",
    "method": "POST"
  }'

# Test partial update
echo "Partial update..."
curl -X PUT $BASE_URL/permissions/$PERMISSION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/updated-test"
  }'

# Test delete
echo "Deleting permission..."
curl -X DELETE $BASE_URL/permissions/$PERMISSION_ID

# Verify deletion (should return 404)
echo "Verifying deletion..."
curl -X GET $BASE_URL/permissions/$PERMISSION_ID

echo "Update and delete tests completed!"
```

## 🔍 Response Examples

### Success Response Examples

#### 1. Get All Permissions

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "View Users",
      "description": "Permission to view user list and profiles",
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

#### 2. Create Permission Success

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Create Product",
    "description": "Permission to add new products",
    "path": "/products",
    "method": "POST",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": null,
    "createdAt": "2024-01-01T11:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  },
  "message": "Permission created successfully"
}
```

### Error Response Examples

#### 1. Duplicate Permission (409)

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "Permission with name 'View Users' and method 'GET' already exists",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/permissions",
    "statusCode": 409
  }
}
```

#### 2. Permission Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Permission not found",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/permissions/999",
    "statusCode": 404
  }
}
```

#### 3. Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": [
      "name should not be empty",
      "description should not be empty",
      "path should not be empty",
      "method must be a valid enum value"
    ],
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/permissions",
    "statusCode": 400
  }
}
```

## 🎯 Common Use Cases

### 1. E-commerce Admin Permissions

```bash
# Admin có thể quản lý tất cả
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Dashboard",
    "description": "Full access to admin dashboard",
    "path": "/admin",
    "method": "GET"
  }'

# Product Management
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manage Products",
    "description": "Full product management access",
    "path": "/admin/products",
    "method": "GET"
  }'

# Order Management
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manage Orders",
    "description": "Full order management access",
    "path": "/admin/orders",
    "method": "GET"
  }'
```

### 2. Customer Permissions

```bash
# Customer có thể xem profile
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "View Profile",
    "description": "View own user profile",
    "path": "/profile",
    "method": "GET"
  }'

# Customer có thể cập nhật profile
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Update Profile",
    "description": "Update own user profile",
    "path": "/profile",
    "method": "PUT"
  }'

# Customer có thể xem orders
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "View Orders",
    "description": "View own orders",
    "path": "/orders",
    "method": "GET"
  }'
```

### 3. Staff Permissions

```bash
# Staff có thể xem orders
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "View All Orders",
    "description": "View all customer orders",
    "path": "/orders",
    "method": "GET"
  }'

# Staff có thể cập nhật order status
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Update Order Status",
    "description": "Update order status",
    "path": "/orders",
    "method": "PATCH"
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission already exists error**
   - Kiểm tra xem đã có permission với cùng name+method hoặc path+method chưa
   - Sử dụng GET /permissions để xem danh sách hiện tại

2. **Validation errors**
   - Đảm bảo tất cả required fields được cung cấp
   - Kiểm tra method phải là một trong: GET, POST, PUT, DELETE, PATCH

3. **Permission not found**
   - Kiểm tra ID có đúng không
   - Permission có thể đã bị soft delete

### Debug Commands

```bash
# Xem tất cả permissions
curl -X GET http://localhost:3000/permissions

# Xem permission cụ thể
curl -X GET http://localhost:3000/permissions/1

# Kiểm tra logs
tail -f logs/application.log
```

---

**Examples Version**: 1.0.0  
**Last Updated**: January 2024  
**Tested with**: NestJS E-commerce v1.0.0
