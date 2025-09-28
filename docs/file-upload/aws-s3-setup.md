# AWS S3 File Upload Setup Guide

This guide explains how to configure AWS S3 for file uploads in your NestJS application.

## Features

- **Hybrid Support**: Switch between local storage and AWS S3 without code changes
- **Category-based Organization**: Files are organized in S3 with category prefixes (`uploads/images/`, `uploads/documents/`, etc.)
- **Automatic Cleanup**: Failed uploads are automatically cleaned up from S3
- **Public Access**: Files are uploaded with public-read ACL for direct access
- **Signed URLs**: Support for generating presigned URLs for secure file access

## Prerequisites

1. AWS Account with S3 access
2. IAM User with appropriate S3 permissions
3. S3 Bucket created and configured

## AWS Setup

### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://your-bucket-name --region us-east-1

# Or create via AWS Console
```

### 2. Configure Bucket Permissions

Set up bucket policy for public read access (optional, adjust according to your security needs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 3. Create IAM User

Create an IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:DeleteObjects",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## Environment Configuration

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
USE_S3=true
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Optional: Keep these for local development fallback
USE_S3=false  # Set to false to use local storage
UPLOAD_PATH=./uploads
```

## Configuration Options

| Variable                | Description               | Default     | Required            |
| ----------------------- | ------------------------- | ----------- | ------------------- |
| `USE_S3`                | Enable/disable S3 storage | `false`     | No                  |
| `AWS_ACCESS_KEY_ID`     | AWS access key ID         | -           | Yes (if S3 enabled) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key     | -           | Yes (if S3 enabled) |
| `AWS_REGION`            | AWS region                | `us-east-1` | No                  |
| `AWS_S3_BUCKET`         | S3 bucket name            | -           | Yes (if S3 enabled) |

## File Organization in S3

Files are organized in S3 using the following structure:

```
your-bucket-name/
├── uploads/
│   ├── images/
│   │   └── file-userid-timestamp.jpg
│   ├── documents/
│   │   └── file-userid-timestamp.pdf
│   ├── videos/
│   │   └── file-userid-timestamp.mp4
│   ├── audio/
│   │   └── file-userid-timestamp.mp3
│   └── general/
│       └── file-userid-timestamp.zip
```

## API Usage

The API remains exactly the same whether using local storage or S3:

```typescript
// Single file upload
POST /uploads/single
Content-Type: multipart/form-data

file: [file]
category: "images"  // optional
description: "Profile picture"  // optional
```

```typescript
// Multiple files upload
POST /uploads/multiple
Content-Type: multipart/form-data

files: [file1, file2, ...]
category: "documents"  // optional
description: "Project files"  // optional
```

## Response Format

The response format is consistent regardless of storage backend:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": "uuid",
    "originalName": "example.jpg",
    "filename": "file-123-1640995200000.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "category": "images",
    "url": "https://your-bucket.s3.us-east-1.amazonaws.com/uploads/images/file-123-1640995200000.jpg",
    "uploadedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

## URL Generation

### Public Files (Default)

Files are uploaded with public-read ACL and can be accessed directly:

```
https://your-bucket.s3.region.amazonaws.com/uploads/category/filename
```

### Private Files (Using Signed URLs)

For private files, use the signed URL endpoint:

```typescript
GET /uploads/:id/signed-url?expires=3600
```

## Development vs Production

### Development Setup

```env
USE_S3=false
UPLOAD_PATH=./uploads
```

### Production Setup

```env
USE_S3=true
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-production-bucket
```

## Migration from Local Storage

To migrate existing files from local storage to S3:

1. Set up S3 configuration
2. Create a migration script to upload existing files
3. Update database records with new S3 URLs
4. Enable S3 in environment variables

## Troubleshooting

### Common Issues

1. **Access Denied**: Check IAM permissions and bucket policy
2. **Invalid Bucket Name**: Ensure bucket name follows AWS naming conventions
3. **Region Mismatch**: Verify AWS_REGION matches your bucket region
4. **File Not Found**: Check if file was uploaded successfully and exists in S3

### Debugging

Enable detailed logging by setting log level to debug:

```typescript
// The service automatically logs upload/delete operations
// Check application logs for S3-specific messages
```

## Security Considerations

1. **IAM Permissions**: Use least-privilege principle for IAM user
2. **Bucket Policy**: Restrict public access if files contain sensitive data
3. **CORS Configuration**: Configure CORS if accessing from web applications
4. **Signed URLs**: Use signed URLs for temporary access to private files
5. **File Validation**: All file types and sizes are validated before upload

## Cost Optimization

1. **Lifecycle Policies**: Set up S3 lifecycle policies for long-term storage
2. **Storage Classes**: Use appropriate storage classes (IA, Glacier) for archival
3. **Request Optimization**: Batch delete operations when possible
4. **Monitoring**: Monitor S3 costs and usage patterns

## Advanced Features

### Presigned Upload URLs

For direct client-to-S3 uploads:

```typescript
POST /uploads/presigned-url
{
  "filename": "example.jpg",
  "contentType": "image/jpeg",
  "category": "images"
}
```

### Thumbnail Generation

The service supports thumbnail generation for images when using S3 (future enhancement).

### Batch Operations

Use batch operations for multiple file uploads/deletions for better performance.
