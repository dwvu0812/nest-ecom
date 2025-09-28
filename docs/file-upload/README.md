# File Upload System

## 📋 Tổng quan

Hệ thống upload file được thiết kế để hỗ trợ upload cả single và multiple files với các tính năng:

- **Multi-category support** - Hỗ trợ nhiều loại file: images, documents, videos, audio, general
- **Single & Multiple uploads** - Upload được cả 1 file hoặc nhiều files cùng lúc
- **File validation** - Validate file type, size, MIME type
- **Secure storage** - Lưu trữ an toàn với unique filename generation
- **User ownership** - File được gắn với user upload
- **Soft delete** - Hỗ trợ xóa mềm file
- **Statistics tracking** - Thống kê upload theo user/category

## 🏗️ Kiến trúc

```
File Upload System
├── Controllers              # REST API endpoints
├── Services                # Business logic
├── Repositories            # Data access layer
├── DTOs                    # Data transfer objects
├── Configurations          # Multer & upload configs
├── Constants               # File type definitions
└── Exceptions              # Custom error handling
```

## 📁 Cấu trúc thư mục

```
src/uploads/
├── constants/
│   └── upload.constants.ts         # File type configs & limits
├── config/
│   └── upload.config.ts            # Multer configurations
├── dto/
│   ├── upload-file.dto.ts          # Request DTOs
│   ├── upload-response.dto.ts      # Response DTOs
│   └── index.ts
├── repositories/
│   └── file-upload.repository.ts   # Database operations
├── exceptions/
│   └── upload.exceptions.ts        # Custom exceptions
├── uploads.controller.ts           # REST endpoints
├── uploads.service.ts              # Business logic
└── uploads.module.ts               # Module configuration
```

## 🎯 API Endpoints

### Single File Upload

#### General File Upload

```http
POST /uploads/single
Content-Type: multipart/form-data

file: [File]
category?: string (default: 'general')
description?: string
```

#### Category-specific Upload

```http
POST /uploads/single/images
POST /uploads/single/documents
POST /uploads/single/videos
POST /uploads/single/audio
```

### Multiple Files Upload

#### General Multiple Upload

```http
POST /uploads/multiple
Content-Type: multipart/form-data

files: [File[]]
category?: string (default: 'general')
description?: string
maxFiles?: number (default: 10)
```

#### Category-specific Multiple Upload

```http
POST /uploads/multiple/images      # Max 5 files
POST /uploads/multiple/documents   # Max 10 files
```

### File Management

#### Get My Files

```http
GET /uploads/my-files?page=1&limit=20&category=images
```

#### Get File Details

```http
GET /uploads/:fileId
```

#### Get Upload Statistics

```http
GET /uploads/stats
```

#### Delete Single File

```http
DELETE /uploads/:fileId
```

#### Delete Multiple Files

```http
DELETE /uploads/bulk
Content-Type: application/json

{
  "fileIds": ["file-id-1", "file-id-2"]
}
```

## 📋 File Categories

| Category      | Max Size | Allowed Types                                  | MIME Types            |
| ------------- | -------- | ---------------------------------------------- | --------------------- |
| **Images**    | 5MB      | JPG, JPEG, PNG, GIF, WEBP, BMP, SVG            | image/\*              |
| **Documents** | 10MB     | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF | application/_, text/_ |
| **Videos**    | 50MB     | MP4, AVI, MKV, MOV, WMV, FLV, WEBM             | video/\*              |
| **Audio**     | 20MB     | MP3, WAV, FLAC, AAC, OGG, WMA                  | audio/\*              |
| **General**   | 25MB     | ZIP, RAR, 7Z, TAR, GZ                          | application/\*        |

## 🔒 Security Features

### File Validation

- **File Extension Check** - Validate file extension against allowed types
- **MIME Type Verification** - Check actual file MIME type
- **File Size Limits** - Enforce size limits per category
- **Malicious File Detection** - Basic security checks

### Access Control

- **JWT Authentication** - All endpoints require authentication
- **User Ownership** - Users can only manage their own files
- **Admin Endpoints** - Special admin-only endpoints (future feature)

### Safe Storage

- **Unique Filenames** - Generate UUID-based filenames
- **Directory Organization** - Separate directories by category
- **Path Security** - Prevent directory traversal attacks

## 💾 Database Schema

```sql
model FileUpload {
  id           String    @id @default(uuid())
  originalName String
  filename     String    -- Generated unique filename
  mimetype     String
  size         Int
  category     String
  path         String    -- File system path
  url          String    -- Accessible URL
  description  String?
  uploadedBy   Int
  thumbnail    String?   -- For images (future feature)

  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  uploader     User      @relation("FileUploadedBy", fields: [uploadedBy], references: [id])
}
```

## 🚀 Usage Examples

### Frontend JavaScript

#### Single Image Upload

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('description', 'Profile avatar');

const response = await fetch('/uploads/single/images', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log('Uploaded file:', result.data);
```

#### Multiple Documents Upload

```javascript
const formData = new FormData();
files.forEach((file) => {
  formData.append('files', file);
});
formData.append('description', 'Project documents');

const response = await fetch('/uploads/multiple/documents', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log(`Uploaded ${result.data.totalFiles} files`);
```

### Backend Service Usage

```typescript
import { UploadsService } from './uploads/uploads.service';

@Injectable()
export class MyService {
  constructor(private readonly uploadsService: UploadsService) {}

  async handleFileUpload(file: Express.Multer.File, userId: number) {
    return await this.uploadsService.uploadSingle(
      file,
      userId,
      'documents',
      'Important document',
    );
  }

  async getUserFiles(userId: number) {
    return await this.uploadsService.getUserFiles(userId, {
      page: 1,
      limit: 10,
      category: 'images',
    });
  }
}
```

## 📊 Response Formats

### Single Upload Success

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "originalName": "document.pdf",
    "filename": "file-123-1640000000000.pdf",
    "mimetype": "application/pdf",
    "size": 1024576,
    "category": "documents",
    "url": "/uploads/documents/file-123-1640000000000.pdf",
    "description": "Important document",
    "uploadedBy": 123,
    "uploadedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Multiple Upload Success

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Successfully uploaded 3 of 3 files",
    "files": [...],
    "totalFiles": 3,
    "totalSize": 3145728
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds limit. Maximum: 5.00MB, received: 7.50MB",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/uploads/single/images"
  }
}
```

## ⚙️ Configuration

### Environment Variables

```env
# Upload configuration
MAX_FILE_SIZE=5242880          # 5MB default
UPLOAD_PATH=./uploads          # Base upload directory
```

### File Type Customization

```typescript
// Override file type limits in upload.constants.ts
export const FILE_TYPE_CONFIG = {
  images: {
    maxSize: 10 * 1024 * 1024, // 10MB instead of 5MB
    allowedTypes: /\/(jpg|jpeg|png|webp)$/, // Remove gif, bmp, svg
    // ... other configs
  },
};
```

## 🔧 Advanced Features

### Custom Upload Categories

```typescript
// Add new category in constants
export const UPLOAD_CATEGORIES = {
  // ... existing
  PRESENTATIONS: 'presentations',
} as const;

// Add configuration
export const FILE_TYPE_CONFIG = {
  [UPLOAD_CATEGORIES.PRESENTATIONS]: {
    allowedTypes: /\/(ppt|pptx|key)$/,
    allowedMimes: ['application/vnd.ms-powerpoint', ...],
    maxSize: 15 * 1024 * 1024, // 15MB
    path: './uploads/presentations',
  },
};
```

### Thumbnail Generation (Future)

```typescript
// Service method for generating thumbnails
private async generateThumbnail(filePath: string): Promise<string> {
  // Implementation with sharp or similar library
}
```

## 🚨 Error Codes

| Code                | Description               | HTTP Status |
| ------------------- | ------------------------- | ----------- |
| `FILE_NOT_PROVIDED` | No file uploaded          | 400         |
| `INVALID_FILE_TYPE` | File type not allowed     | 400         |
| `FILE_TOO_LARGE`    | File exceeds size limit   | 400         |
| `TOO_MANY_FILES`    | Too many files in request | 400         |
| `UPLOAD_FAILED`     | Upload process failed     | 400         |
| `FILE_NOT_FOUND`    | File not found            | 404         |
| `DELETION_FAILED`   | File deletion failed      | 400         |

## 📈 Monitoring & Analytics

### Upload Statistics

- Total files uploaded per user
- Storage usage by category
- Recent upload activity
- File type distribution
- Average file sizes

### Performance Metrics

- Upload success rate
- Average upload time
- Storage usage trends
- Error rate by category

## 🔜 Future Enhancements

1. **Image Processing**
   - Automatic thumbnail generation
   - Image compression and optimization
   - Multiple size variants

2. **Cloud Storage Integration**
   - AWS S3 support
   - Google Cloud Storage
   - Azure Blob Storage

3. **Advanced Security**
   - Virus scanning integration
   - Content analysis
   - Metadata extraction

4. **CDN Integration**
   - CloudFlare integration
   - File delivery optimization
   - Caching strategies

5. **Batch Operations**
   - Bulk upload processing
   - Background job queues
   - Progress tracking
