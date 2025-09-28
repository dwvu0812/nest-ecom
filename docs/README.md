# NestJS E-commerce Documentation

## 📚 Tài liệu hệ thống

Tài liệu kỹ thuật cho NestJS E-commerce application.

## 📖 Danh mục tài liệu

### 🌐 Language Management System

Complete documentation về hệ thống quản lý ngôn ngữ.

- **[Language API](./languages/language-api.md)** - API endpoints cho quản lý ngôn ngữ hệ thống
- **[Language API Examples](./languages/api-examples.md)** - Testing examples và Postman collection

### 🔐 Permission Management System

Complete documentation về hệ thống quản lý permissions và quyền truy cập.

- **[Permission API](./permissions/permission-api.md)** - API endpoints cho quản lý permissions
- **[Permission API Examples](./permissions/api-examples.md)** - Testing examples và Postman collection

### 🔐 Authentication System

Complete documentation về hệ thống xác thực người dùng.

- **[Login API](./authentication/login-api.md)** - API endpoints cho đăng nhập và xác thực

### 👤 Profile Management System

Complete documentation về hệ thống quản lý profile người dùng.

- **[Profile System Overview](./profile/README.md)** - Tổng quan về profile management system
- **[Profile API](./profile/profile-api.md)** - API endpoints cho quản lý profile
- **[Profile API Examples](./profile/api-examples.md)** - Usage examples và integration guide
- **[Profile Usage Guide](./profile/usage-guide.md)** - Hướng dẫn implementation và best practices

### 🚨 Exception Handling System

Comprehensive documentation về hệ thống xử lý exceptions.

- **[Overview](./exception-handling/README.md)** - Tổng quan về exception handling system
- **[Global Exception Filter](./exception-handling/global-exception-filter.md)** - Chi tiết về global exception handler
- **[Prisma Exception Filter](./exception-handling/prisma-exception-filter.md)** - Database error handling
- **[Custom Business Exceptions](./exception-handling/business-exceptions.md)** - Type-safe business logic exceptions
- **[Logging và Interceptors](./exception-handling/logging-interceptors.md)** - Request logging và response transformation
- **[Usage Guide](./exception-handling/usage-guide.md)** - Hướng dẫn sử dụng chi tiết
- **[Error Codes Reference](./exception-handling/error-codes.md)** - Tham chiếu đầy đủ về error codes

### 🎯 Quick Links

#### For API Developers

- **[Language API](./languages/language-api.md)** - Language management endpoints
- **[Permission API](./permissions/permission-api.md)** - Permission management endpoints
- **[Profile API](./profile/profile-api.md)** - Profile management endpoints
- **[Login API](./authentication/login-api.md)** - Authentication và JWT tokens

#### For Backend Developers

- [Usage Guide](./exception-handling/usage-guide.md) - Bắt đầu từ đây để sử dụng exception handling
- [Custom Business Exceptions](./exception-handling/business-exceptions.md) - Cách tạo và sử dụng custom exceptions
- [Error Codes Reference](./exception-handling/error-codes.md) - Tra cứu error codes

#### For System Administrators

- [Global Exception Filter](./exception-handling/global-exception-filter.md) - Cấu hình global error handling
- [Logging và Interceptors](./exception-handling/logging-interceptors.md) - Monitoring và logging

#### For API Consumers

- **[Language API](./languages/language-api.md)** - Language management API reference
- **[Permission API](./permissions/permission-api.md)** - Permission management API reference
- **[Profile API](./profile/profile-api.md)** - Profile management API reference
- **[Login API](./authentication/login-api.md)** - Authentication API reference
- [Error Codes Reference](./exception-handling/error-codes.md) - API error codes và response format

## 🚀 Getting Started

1. **Đọc [Overview](./exception-handling/README.md)** để hiểu tổng quan về system
2. **Xem [Usage Guide](./exception-handling/usage-guide.md)** để bắt đầu sử dụng
3. **Tham khảo [Error Codes Reference](./exception-handling/error-codes.md)** khi cần tra cứu

## 📋 System Features

### ✅ Core Features

- **Repository Pattern** với Base Repository cho data access
- **Exception Handling** với custom business exceptions
- **Multi-language Support** cho content đa ngôn ngữ
- **Permission System** cho role-based access control
- **JWT Authentication** với session management
- **Profile Management** - User profile với avatar upload và đa ngôn ngữ
- **Enhanced Logging** - Detailed request/error logging với context
- **Response Transformation** - Consistent API response format

### 🔄 Response Format

#### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/api/endpoint"
}
```

#### Error Response

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

## 🏗️ Architecture

```
Exception Handling Architecture
├── GlobalExceptionFilter      # Catch-all exception handler
├── PrismaExceptionFilter      # Database-specific error handling
├── Custom Business Exceptions # Type-safe business logic errors
├── Enhanced Logging          # Request/error logging với context
└── Response Transformation   # Consistent API response format
```

## 📊 Benefits

### 🎯 For Developers

- **Type Safety** - Compile-time error checking với custom exceptions
- **Consistent APIs** - Standardized error response format
- **Better Debugging** - Detailed logs với request context
- **Easy Maintenance** - Centralized error handling logic

### 🔒 For Security

- **No Information Leakage** - Production-safe error messages
- **Sanitized Responses** - Database internals không bị leak
- **Proper Status Codes** - Correct HTTP status codes

### 📈 For Monitoring

- **Structured Logging** - Easy to parse và analyze
- **Error Tracking** - Semantic error codes cho analytics
- **Performance Monitoring** - Response time tracking
- **Request Context** - Full request information trong logs

## 🛠️ Technical Stack

- **NestJS** - Framework với built-in exception handling
- **Prisma** - ORM với specific error types
- **TypeScript** - Type safety cho exception classes
- **RxJS** - Reactive programming cho interceptors
- **Express** - HTTP framework underlying NestJS

## 📞 Support

### Common Issues

1. **Exception not being caught** → Check filter registration order
2. **Inconsistent error format** → Verify GlobalExceptionFilter setup
3. **Missing error logs** → Check LoggingInterceptor registration
4. **Database errors not handled** → Verify PrismaExceptionFilter import

### Getting Help

- Check [Troubleshooting sections](./exception-handling/usage-guide.md#troubleshooting) trong documentation
- Review [Common Issues](./exception-handling/global-exception-filter.md#troubleshooting) trong các guides
- Examine logs để identify root cause

## 🔄 Updates

### Latest Changes

- ✅ Complete exception handling system implementation
- ✅ Comprehensive documentation suite
- ✅ Type-safe custom exception classes
- ✅ Vietnamese error messages
- ✅ Enhanced logging với request context
- ✅ Consistent API response format
- ✅ Permission Management System với full CRUD operations
- ✅ Permission API documentation và examples
- ✅ Profile Management System với complete functionality
- ✅ Profile API documentation và comprehensive examples
- ✅ Avatar upload system với security validation
- ✅ Multi-language profile support

### Future Enhancements

- Error analytics dashboard
- Custom error reporting
- Performance metrics
- Advanced monitoring integration

---

**Documentation Version**: 1.0.0  
**Last Updated**: January 2024  
**System Version**: NestJS E-commerce v1.0.0
