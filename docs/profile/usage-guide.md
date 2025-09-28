# Profile System Usage Guide

## Hướng dẫn sử dụng

Hướng dẫn chi tiết cách tích hợp và sử dụng Profile System trong ứng dụng.

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)
6. [Performance Optimization](#performance-optimization)

---

## Setup & Installation

### 1. Cài đặt Dependencies

```bash
# Cài đặt required packages
pnpm install bcrypt @types/bcrypt @types/multer

# Tạo folder upload
mkdir -p uploads/avatars

# Set permissions (Linux/Mac)
chmod 755 uploads/avatars
```

### 2. Environment Configuration

```env
# .env
JWT_SECRET=your-jwt-secret-key
UPLOAD_PATH=./uploads/avatars
MAX_FILE_SIZE=2097152  # 2MB in bytes
```

### 3. Module Integration

```typescript
// app.module.ts
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    // ... existing modules
    ProfileModule,
  ],
})
export class AppModule {}
```

### 4. Static File Serving

```typescript
// main.ts
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
```

---

## Basic Usage

### 1. Profile Service Integration

```typescript
// your.service.ts
import { Injectable } from '@nestjs/common';
import { ProfileService } from './profile/profile.service';

@Injectable()
export class YourService {
  constructor(private readonly profileService: ProfileService) {}

  async getUserProfileData(userId: number) {
    return await this.profileService.getProfile(userId);
  }

  async updateUserInfo(userId: number, updateData: any) {
    return await this.profileService.updateProfile(userId, updateData);
  }
}
```

### 2. Controller Integration

```typescript
// your.controller.ts
import { ProfileService } from './profile/profile.service';

@Controller('users')
export class UsersController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id/profile')
  async getUserProfile(@Param('id') id: number) {
    return await this.profileService.getProfile(id);
  }
}
```

### 3. Frontend Integration

```javascript
// Frontend JavaScript
class UserProfile {
  constructor(apiUrl, token) {
    this.api = apiUrl;
    this.token = token;
  }

  async loadProfile() {
    const response = await fetch(`${this.api}/profile`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  async updateProfile(data) {
    const response = await fetch(`${this.api}/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

---

## Advanced Features

### 1. Multi-language Profile Management

```typescript
// profile-translations.service.ts
@Injectable()
export class ProfileTranslationsService {
  constructor(private readonly profileService: ProfileService) {}

  async setupMultiLanguageProfile(userId: number, languages: string[]) {
    const promises = languages.map(async (langCode) => {
      const language = await this.languageService.findByCode(langCode);
      if (language) {
        return this.profileService.createProfileTranslation(userId, {
          languageId: language.id,
          address: '',
          description: '',
        });
      }
    });

    return Promise.allSettled(promises);
  }

  async getProfileInLanguage(userId: number, langCode: string) {
    const profile = await this.profileService.getProfile(userId);
    const translation = profile.translations?.find(
      (t) => t.languageCode === langCode,
    );

    return {
      ...profile,
      localizedAddress: translation?.address || '',
      localizedDescription: translation?.description || '',
    };
  }
}
```

### 2. Avatar Processing Pipeline

```typescript
// avatar-processing.service.ts
import * as sharp from 'sharp';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarProcessingService {
  async processAvatar(file: Express.Multer.File): Promise<string> {
    const filename = `avatar-${Date.now()}.webp`;
    const outputPath = `uploads/avatars/${filename}`;

    // Resize and optimize image
    await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    return `/uploads/avatars/${filename}`;
  }

  async generateThumbnail(avatarPath: string): Promise<string> {
    const thumbnailPath = avatarPath.replace('.webp', '-thumb.webp');

    await sharp(avatarPath)
      .resize(50, 50)
      .webp({ quality: 60 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  }
}
```

### 3. Profile Activity Logging

```typescript
// profile-audit.service.ts
@Injectable()
export class ProfileAuditService {
  constructor(private readonly auditLogService: AuditLogService) {}

  async logProfileUpdate(userId: number, changes: any, updatedBy: number) {
    await this.auditLogService.log({
      entityType: 'USER_PROFILE',
      entityId: userId,
      action: 'UPDATE',
      changes,
      performedBy: updatedBy,
      timestamp: new Date(),
      metadata: {
        changedFields: Object.keys(changes),
        previousValues: changes.previous,
        newValues: changes.new,
      },
    });
  }

  async logPasswordChange(userId: number, performedBy: number) {
    await this.auditLogService.log({
      entityType: 'USER_PROFILE',
      entityId: userId,
      action: 'PASSWORD_CHANGE',
      performedBy,
      timestamp: new Date(),
      metadata: {
        securityEvent: true,
        requiresNotification: true,
      },
    });
  }
}
```

### 4. Profile Validation Rules

```typescript
// profile-validation.service.ts
@Injectable()
export class ProfileValidationService {
  validateProfileUpdate(
    currentProfile: any,
    updateData: any,
  ): ValidationResult {
    const errors: string[] = [];

    // Custom business rules
    if (updateData.email && updateData.email !== currentProfile.email) {
      if (!this.isEmailAllowedForUpdate(updateData.email)) {
        errors.push('Email domain not allowed for updates');
      }
    }

    if (
      updateData.phoneNumber &&
      !this.isValidPhoneFormat(updateData.phoneNumber)
    ) {
      errors.push('Phone number format is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isEmailAllowedForUpdate(email: string): boolean {
    const allowedDomains = ['company.com', 'partner.com'];
    const domain = email.split('@')[1];
    return (
      allowedDomains.includes(domain) || !email.includes('@restricted.com')
    );
  }

  private isValidPhoneFormat(phone: string): boolean {
    // Vietnamese phone number validation
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}
```

---

## Best Practices

### 1. Security Best Practices

```typescript
// Secure password handling
export class SecurePasswordService {
  // Use strong salt rounds
  private readonly SALT_ROUNDS = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Rate limiting for password changes
  @UseGuards(ThrottlerGuard)
  @Throttle(3, 3600) // 3 attempts per hour
  async changePassword(userId: number, passwordData: ChangePasswordDto) {
    // Implementation
  }

  // Password strength validation
  validatePasswordStrength(password: string): ValidationResult {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
      notCommon: !this.isCommonPassword(password),
    };

    const passed = Object.values(checks).filter(Boolean).length;

    return {
      isValid: passed >= 5,
      score: passed,
      checks,
    };
  }
}
```

### 2. Performance Optimization

```typescript
// Caching strategy
@Injectable()
export class CachedProfileService {
  constructor(
    private readonly profileService: ProfileService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getProfile(userId: number): Promise<ProfileResponseDto> {
    const cacheKey = `profile:${userId}`;

    // Try cache first
    let profile = await this.cacheManager.get<ProfileResponseDto>(cacheKey);

    if (!profile) {
      profile = await this.profileService.getProfile(userId);
      // Cache for 5 minutes
      await this.cacheManager.set(cacheKey, profile, 300);
    }

    return profile;
  }

  async updateProfile(
    userId: number,
    updateData: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const result = await this.profileService.updateProfile(userId, updateData);

    // Invalidate cache
    await this.cacheManager.del(`profile:${userId}`);

    return result;
  }
}
```

### 3. Error Handling Strategy

```typescript
// Global error handling for profile operations
@Catch(ProfileException)
export class ProfileExceptionFilter implements ExceptionFilter {
  catch(exception: ProfileException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log security events
    if (exception.code === 'INVALID_CURRENT_PASSWORD') {
      this.auditLogger.logSecurityEvent({
        type: 'INVALID_PASSWORD_ATTEMPT',
        userId: request.user?.id,
        ip: request.ip,
        timestamp: new Date(),
      });
    }

    response.status(exception.getStatus()).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode: exception.getStatus(),
      },
    });
  }
}
```

### 4. Testing Strategy

```typescript
// Unit tests example
describe('ProfileService', () => {
  let service: ProfileService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: UserRepository,
          useValue: {
            findByIdWithTranslations: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepository = module.get(UserRepository);
  });

  describe('getProfile', () => {
    it('should return profile data', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        // ... other properties
      };

      userRepository.findByIdWithTranslations.mockResolvedValue(mockUser);

      // Act
      const result = await service.getProfile(userId);

      // Assert
      expect(result).toBeInstanceOf(ProfileResponseDto);
      expect(result.email).toBe(mockUser.email);
      expect(userRepository.findByIdWithTranslations).toHaveBeenCalledWith(
        userId,
      );
    });

    it('should throw error when profile not found', async () => {
      // Arrange
      userRepository.findByIdWithTranslations.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile(999)).rejects.toThrow(
        ProfileExceptions.profileNotFound(),
      );
    });
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. File Upload Issues

```typescript
// Debug file upload problems
const debugFileUpload = (file: Express.Multer.File) => {
  console.log('File debug info:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size,
    destination: file.destination,
    filename: file.filename,
    path: file.path,
  });

  // Check common issues
  if (!file) {
    throw new BadRequestException('No file received');
  }

  if (file.size === 0) {
    throw new BadRequestException('Empty file received');
  }

  if (!file.mimetype.startsWith('image/')) {
    throw new BadRequestException('File is not an image');
  }
};
```

#### 2. Authentication Issues

```typescript
// Debug authentication problems
const debugAuth = (request: Request) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedException('No authorization header');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Invalid authorization header format');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new UnauthorizedException('Invalid token');
  }
};
```

#### 3. Database Connection Issues

```typescript
// Health check endpoint
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  @Get('profile')
  async checkProfileSystem() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      // Test profile service
      const testResult = await this.profileService.getProfile(1);

      return {
        status: 'healthy',
        timestamp: new Date(),
        database: 'connected',
        profileService: 'operational',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message,
      };
    }
  }
}
```

### Performance Issues

#### 1. Slow Profile Loading

```sql
-- Check database indexes
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.*, ut.*, l.*
FROM "User" u
LEFT JOIN "UserTranslation" ut ON u.id = ut."userId"
LEFT JOIN "Language" l ON ut."languageId" = l.id
WHERE u.id = 1 AND u."deletedAt" IS NULL;

-- Add missing indexes if needed
CREATE INDEX IF NOT EXISTS "User_id_deletedAt_idx" ON "User"(id, "deletedAt");
CREATE INDEX IF NOT EXISTS "UserTranslation_userId_deletedAt_idx" ON "UserTranslation"("userId", "deletedAt");
```

#### 2. Memory Usage

```typescript
// Monitor memory usage
const monitorMemory = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round((used.rss / 1024 / 1024) * 100) / 100 + ' MB',
    heapTotal: Math.round((used.heapTotal / 1024 / 1024) * 100) / 100 + ' MB',
    heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100 + ' MB',
    external: Math.round((used.external / 1024 / 1024) * 100) / 100 + ' MB',
  });
};

// Call periodically
setInterval(monitorMemory, 30000);
```

---

## Performance Optimization

### 1. Database Query Optimization

```typescript
// Optimized profile loading with selective includes
async getProfileOptimized(userId: number, includeTranslations = true) {
  const includeOptions: any = {
    role: {
      select: {
        id: true,
        name: true,
        description: true
      }
    }
  };

  if (includeTranslations) {
    includeOptions.userTranslations = {
      where: { deletedAt: null },
      include: {
        language: {
          select: { id: true, code: true, name: true }
        }
      }
    };
  }

  return this.userRepository.findFirst({
    where: { id: userId, deletedAt: null },
    include: includeOptions
  });
}
```

### 2. Caching Strategy

```typescript
// Redis caching implementation
@Injectable()
export class ProfileCacheService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly profileService: ProfileService,
  ) {}

  async getProfile(userId: number): Promise<ProfileResponseDto> {
    const cacheKey = `profile:${userId}`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Load from database
    const profile = await this.profileService.getProfile(userId);

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(profile));

    return profile;
  }

  async invalidateProfile(userId: number) {
    await this.redis.del(`profile:${userId}`);
  }
}
```

### 3. File Upload Optimization

```typescript
// Optimize file handling
@Injectable()
export class OptimizedAvatarService {
  async processAvatarUpload(file: Express.Multer.File): Promise<string> {
    // Process in background
    const processJob = await this.queue.add('process-avatar', {
      originalPath: file.path,
      userId: file.userId,
      filename: file.filename,
    });

    // Return temporary URL immediately
    return `/uploads/temp/${file.filename}`;
  }

  // Background job processor
  @Process('process-avatar')
  async processAvatarJob(job: Job) {
    const { originalPath, userId, filename } = job.data;

    // Optimize image
    const optimizedPath = await this.optimizeImage(originalPath);

    // Generate thumbnail
    const thumbnailPath = await this.generateThumbnail(optimizedPath);

    // Update user record
    await this.userRepository.updateAvatar(userId, optimizedPath);

    // Clean up temp files
    await fs.unlink(originalPath);

    return { optimizedPath, thumbnailPath };
  }
}
```

---

## Monitoring & Analytics

### 1. Profile Usage Analytics

```typescript
@Injectable()
export class ProfileAnalyticsService {
  async trackProfileUpdate(userId: number, fields: string[]) {
    await this.analyticsService.track('profile_updated', {
      userId,
      updatedFields: fields,
      timestamp: new Date(),
      source: 'web',
    });
  }

  async trackAvatarUpload(userId: number, fileSize: number) {
    await this.analyticsService.track('avatar_uploaded', {
      userId,
      fileSize,
      timestamp: new Date(),
    });
  }

  async getProfileStats(dateRange: DateRange) {
    return {
      totalUpdates: await this.getUpdateCount(dateRange),
      avatarUploads: await this.getAvatarUploadCount(dateRange),
      passwordChanges: await this.getPasswordChangeCount(dateRange),
      mostUpdatedFields: await this.getMostUpdatedFields(dateRange),
    };
  }
}
```

### 2. Performance Metrics

```typescript
// Performance monitoring
@Injectable()
export class ProfileMetricsService {
  @InjectMetric('profile_operation_duration')
  private operationDuration: Histogram;

  @InjectMetric('profile_operations_total')
  private operationCounter: Counter;

  async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const timer = this.operationDuration.startTimer({ operation });

    try {
      const result = await fn();
      this.operationCounter.inc({ operation, status: 'success' });
      return result;
    } catch (error) {
      this.operationCounter.inc({ operation, status: 'error' });
      throw error;
    } finally {
      timer();
    }
  }
}
```

---

Để biết thêm chi tiết, tham khao:

- [Profile API Documentation](./profile-api.md)
- [API Examples](./api-examples.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
