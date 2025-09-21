# Exception Handling System

## 📋 Tổng quan

Hệ thống xử lý exception được thiết kế để đảm bảo:

- **Consistent error response format** cho tất cả APIs
- **Detailed logging** cho debugging và monitoring
- **User-friendly error messages** bằng tiếng Việt
- **Security** - không leak thông tin sensitive
- **Type safety** với custom exception classes

## 🏗️ Kiến trúc

```
Exception Handling System
├── Global Exception Filter     # Handle tất cả exceptions
├── Prisma Exception Filter     # Handle database errors
├── Custom Business Exceptions  # Type-safe business logic errors
├── Enhanced Logging           # Log requests và errors
└── Response Transformation    # Consistent response format
```

## 📁 Cấu trúc thư mục

```
src/shared/
├── filters/
│   ├── global-exception.filter.ts     # Global exception handler
│   ├── prisma-exception.filter.ts     # Database error handler
│   └── index.ts
├── exceptions/
│   ├── business.exception.ts          # Custom exception classes
│   └── index.ts
├── interceptor/
│   ├── logging.interceptor.ts         # Enhanced request/error logging
│   ├── transform.interceptor.ts       # Response formatting
│   └── index.ts
```

## 🎯 Response Format

### ✅ Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/api/endpoint"
}
```

### ❌ Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/api/endpoint",
    "statusCode": 400
  }
}
```

## 🚀 Tính năng chính

### 1. **Global Exception Filter**

- Xử lý tất cả unhandled exceptions
- Standardized error response format
- Production-safe error messages
- Detailed error logging với request context

### 2. **Prisma Exception Filter**

- Chuyển đổi Prisma errors thành user-friendly messages
- Map error codes P2xxx thành Vietnamese messages
- Proper HTTP status codes cho từng loại error

### 3. **Custom Business Exceptions**

- Type-safe exception classes
- Semantic error codes
- Easy-to-use static factory methods
- Consistent error structure

### 4. **Enhanced Logging**

- Log cả success và error requests
- Request context trong error logs
- Response time tracking
- Structured logging format

### 5. **Response Transformation**

- Consistent success response format
- Automatic timestamp và path injection
- Handle nested response data

## 📊 Exception Priority

Exception filters được xử lý theo thứ tự:

1. **Route Level Filters** (cao nhất)
2. **Controller Level Filters**
3. **Global Level Filters** (thấp nhất)
   - `PrismaExceptionFilter` (specific)
   - `GlobalExceptionFilter` (catch-all)

## 🛠️ Setup

```typescript
// main.ts
app.useGlobalFilters(
  new PrismaExceptionFilter(), // Specific database errors
  new GlobalExceptionFilter(), // Catch-all for other errors
);
```

## 📖 Documentation Links

- [Global Exception Filter](./global-exception-filter.md)
- [Prisma Exception Filter](./prisma-exception-filter.md)
- [Custom Business Exceptions](./business-exceptions.md)
- [Logging và Interceptors](./logging-interceptors.md)
- [Usage Guide](./usage-guide.md)
- [Error Codes Reference](./error-codes.md)

## 🧪 Testing

Xem [Testing Guide](./testing-guide.md) để biết cách test exception handling.

## 🚨 Migration từ code cũ

Xem [Migration Guide](./migration-guide.md) để update existing code.

---

## 📞 Support

Nếu có vấn đề với exception handling, kiểm tra:

1. Error logs trong console
2. Response format có đúng structure không
3. Exception filter order trong main.ts
4. Custom exception usage trong services
