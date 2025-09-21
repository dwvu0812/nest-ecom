# NestJS E-commerce Documentation

## 📚 Tài liệu hệ thống

Tài liệu kỹ thuật cho NestJS E-commerce application.

## 📖 Danh mục tài liệu

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

#### For Developers

- [Usage Guide](./exception-handling/usage-guide.md) - Bắt đầu từ đây để sử dụng exception handling
- [Custom Business Exceptions](./exception-handling/business-exceptions.md) - Cách tạo và sử dụng custom exceptions
- [Error Codes Reference](./exception-handling/error-codes.md) - Tra cứu error codes

#### For System Administrators

- [Global Exception Filter](./exception-handling/global-exception-filter.md) - Cấu hình global error handling
- [Logging và Interceptors](./exception-handling/logging-interceptors.md) - Monitoring và logging

#### For API Consumers

- [Error Codes Reference](./exception-handling/error-codes.md) - API error codes và response format

## 🚀 Getting Started

1. **Đọc [Overview](./exception-handling/README.md)** để hiểu tổng quan về system
2. **Xem [Usage Guide](./exception-handling/usage-guide.md)** để bắt đầu sử dụng
3. **Tham khảo [Error Codes Reference](./exception-handling/error-codes.md)** khi cần tra cứu

## 📋 System Features

### ✅ Exception Handling

- **Global Exception Filter** - Xử lý tất cả exceptions với consistent format
- **Prisma Exception Filter** - Handle database errors với Vietnamese messages
- **Custom Business Exceptions** - Type-safe exception classes cho business logic
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

### Future Enhancements

- Error analytics dashboard
- Custom error reporting
- Performance metrics
- Advanced monitoring integration

---

**Documentation Version**: 1.0.0  
**Last Updated**: January 2024  
**System Version**: NestJS E-commerce v1.0.0
