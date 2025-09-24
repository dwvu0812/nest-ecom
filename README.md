# NestJS E-commerce API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A robust e-commerce API built with NestJS, featuring comprehensive authentication, language management, and enterprise-grade error handling.</p>

## 📋 Description

NestJS E-commerce API is a production-ready backend system for e-commerce applications, built with modern TypeScript technologies and best practices.

## 🚀 Features

- **🔐 Authentication System**: JWT-based authentication with 2FA support
- **🌐 Language Management**: Multi-language support with CRUD APIs
- **🛡️ Exception Handling**: Comprehensive error handling with Vietnamese messages
- **📊 Database Management**: Prisma ORM with PostgreSQL
- **📧 Email System**: Resend integration for email notifications
- **🔍 Logging & Monitoring**: Enhanced request/response logging
- **✅ Validation**: Robust input validation with class-validator

## 🏗️ Architecture

```
src/
├── auth/                 # Authentication module
├── languages/            # Language management module
├── users/                # User management module
├── shared/               # Shared utilities and services
│   ├── exceptions/       # Custom exception classes
│   ├── filters/          # Global exception filters
│   ├── interceptors/     # Logging and transformation
│   └── repositories/     # Base repository patterns
├── mailer/               # Email service integration
└── prisma/               # Database connection and service
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[📚 Complete Documentation](./docs/README.md)** - Main documentation hub
- **[🌐 Language API](./docs/languages/language-api.md)** - Language management endpoints
- **[🔐 Authentication API](./docs/authentication/login-api.md)** - Login and auth endpoints
- **[⚡ API Examples](./docs/languages/api-examples.md)** - Postman collection and testing guide

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with 2FA (TOTP)
- **Email**: Resend
- **Validation**: class-validator
- **Testing**: Jest

## ⚙️ Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- pnpm (recommended) or npm

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nest-ecom
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure the following environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/nest_ecom?schema=public"

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_at_least_32_characters_long

   # Email (Resend)
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   FROM_EMAIL=noreply@yourdomain.com

   # Server
   NODE_ENV=development
   PORT=3000
   ```

4. **Database setup**

   ```bash
   # Generate Prisma client
   pnpm prisma generate

   # Run migrations
   pnpm prisma migrate dev

   # Seed database (optional)
   pnpm prisma db seed
   ```

## 🏃‍♂️ Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The API will be available at `http://localhost:3000`

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 📡 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/2fa/setup` - Setup 2FA
- `GET /auth/profile` - Get user profile

### Language Management

- `GET /languages` - Get all languages
- `GET /languages/:id` - Get language by ID
- `POST /languages` - Create new language
- `PUT /languages/:id` - Update language
- `DELETE /languages/:id` - Delete language

## 🔒 Environment Variables

| Variable             | Description                          | Required |
| -------------------- | ------------------------------------ | -------- |
| `DATABASE_URL`       | PostgreSQL connection string         | ✅       |
| `JWT_SECRET`         | JWT secret key (32+ chars)           | ✅       |
| `JWT_REFRESH_SECRET` | JWT refresh secret key               | ✅       |
| `RESEND_API_KEY`     | Resend API key for emails            | ✅       |
| `FROM_EMAIL`         | Default sender email                 | ✅       |
| `NODE_ENV`           | Environment (development/production) | ✅       |
| `PORT`               | Server port (default: 3000)          | ❌       |

## 🐳 Docker Support

```bash
# Build and run with Docker Compose
docker-compose up -d

# Run migrations in container
docker-compose exec app pnpm prisma migrate dev
```

## 📊 Database Schema

The application uses Prisma ORM with the following main entities:

- **User**: User accounts with authentication
- **Language**: System languages for internationalization
- **UserTranslation**: User-specific translations
- **Role & Permission**: Role-based access control
- **RefreshToken & Device**: Session management
- **Message**: Internal messaging system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔧 Development Guidelines

- Follow TypeScript strict mode
- Use custom exception classes for error handling
- Implement proper validation with DTOs
- Write comprehensive tests
- Use meaningful commit messages
- Update documentation when needed

## 📈 Performance

- **Response Time**: < 100ms for most endpoints
- **Database**: Optimized queries with proper indexing
- **Caching**: Redis integration ready (configurable)
- **Logging**: Structured logs for monitoring

## 🛡️ Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection with Prisma
- Rate limiting ready (configurable)
- 2FA support with TOTP

## 📞 Support

- **Documentation**: [./docs/README.md](./docs/README.md)
- **API Reference**: [./docs/languages/language-api.md](./docs/languages/language-api.md)
- **Issues**: Create an issue in the repository
- **Email**: Contact the development team

## 📄 License

This project is [MIT licensed](LICENSE).

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Node.js**: >= 18.0.0  
**NestJS**: ^10.0.0
