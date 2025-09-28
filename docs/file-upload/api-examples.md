# File Upload API Examples

## 📋 Request Examples

This document provides comprehensive examples for using the File Upload API endpoints.

## 🔐 Authentication

All upload endpoints require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

## 📤 Single File Upload

### Upload General File

```http
POST /uploads/single
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--boundary
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Type: application/pdf

[Binary file content]
--boundary
Content-Disposition: form-data; name="category"

documents
--boundary
Content-Disposition: form-data; name="description"

Important project document
--boundary--
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "originalName": "document.pdf",
    "filename": "file-123-1703932800000.pdf",
    "mimetype": "application/pdf",
    "size": 2048576,
    "category": "documents",
    "path": "./uploads/documents/file-123-1703932800000.pdf",
    "url": "/uploads/documents/file-123-1703932800000.pdf",
    "description": "Important project document",
    "uploadedBy": 123,
    "uploadedAt": "2024-01-01T10:00:00.000Z",
    "thumbnail": null
  },
  "message": null,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/uploads/single"
}
```

### Upload Image

```http
POST /uploads/single/images
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--boundary
Content-Disposition: form-data; name="file"; filename="avatar.jpg"
Content-Type: image/jpeg

[Binary image content]
--boundary
Content-Disposition: form-data; name="description"

User avatar image
--boundary--
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "a8b5f2c1-1234-4567-8901-123456789abc",
    "originalName": "avatar.jpg",
    "filename": "file-123-1703932800001.jpg",
    "mimetype": "image/jpeg",
    "size": 512000,
    "category": "images",
    "path": "./uploads/images/file-123-1703932800001.jpg",
    "url": "/uploads/images/file-123-1703932800001.jpg",
    "description": "User avatar image",
    "uploadedBy": 123,
    "uploadedAt": "2024-01-01T10:00:00.000Z",
    "thumbnail": null
  }
}
```

## 📤 Multiple Files Upload

### Upload Multiple Documents

```http
POST /uploads/multiple/documents
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--boundary
Content-Disposition: form-data; name="files"; filename="report1.pdf"
Content-Type: application/pdf

[Binary file content]
--boundary
Content-Disposition: form-data; name="files"; filename="report2.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

[Binary file content]
--boundary
Content-Disposition: form-data; name="files"; filename="data.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

[Binary file content]
--boundary
Content-Disposition: form-data; name="description"

Q4 2024 reports
--boundary
Content-Disposition: form-data; name="maxFiles"

10
--boundary--
```

#### Response

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Successfully uploaded 3 of 3 files",
    "files": [
      {
        "id": "report1-uuid",
        "originalName": "report1.pdf",
        "filename": "file-123-1703932800002.pdf",
        "mimetype": "application/pdf",
        "size": 1048576,
        "category": "documents",
        "url": "/uploads/documents/file-123-1703932800002.pdf",
        "uploadedBy": 123,
        "uploadedAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "id": "report2-uuid",
        "originalName": "report2.docx",
        "filename": "file-123-1703932800003.docx",
        "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "size": 2097152,
        "category": "documents",
        "url": "/uploads/documents/file-123-1703932800003.docx",
        "uploadedBy": 123,
        "uploadedAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "id": "data-uuid",
        "originalName": "data.xlsx",
        "filename": "file-123-1703932800004.xlsx",
        "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "size": 524288,
        "category": "documents",
        "url": "/uploads/documents/file-123-1703932800004.xlsx",
        "uploadedBy": 123,
        "uploadedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "totalFiles": 3,
    "totalSize": 3670016
  }
}
```

### Upload Multiple Images

```http
POST /uploads/multiple/images
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--boundary
Content-Disposition: form-data; name="files"; filename="photo1.jpg"
Content-Type: image/jpeg

[Binary image content]
--boundary
Content-Disposition: form-data; name="files"; filename="photo2.png"
Content-Type: image/png

[Binary image content]
--boundary
Content-Disposition: form-data; name="description"

Product photos
--boundary--
```

## 📋 File Management

### Get My Files

```http
GET /uploads/my-files?page=1&limit=10&category=images
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "image1-uuid",
        "originalName": "photo1.jpg",
        "filename": "file-123-1703932800005.jpg",
        "mimetype": "image/jpeg",
        "size": 1024000,
        "category": "images",
        "url": "/uploads/images/file-123-1703932800005.jpg",
        "description": "Product photo",
        "uploadedBy": 123,
        "uploadedAt": "2024-01-01T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Get File Details

```http
GET /uploads/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "originalName": "document.pdf",
    "filename": "file-123-1703932800000.pdf",
    "mimetype": "application/pdf",
    "size": 2048576,
    "category": "documents",
    "path": "./uploads/documents/file-123-1703932800000.pdf",
    "url": "/uploads/documents/file-123-1703932800000.pdf",
    "description": "Important project document",
    "uploadedBy": 123,
    "uploadedAt": "2024-01-01T10:00:00.000Z",
    "thumbnail": null
  }
}
```

### Get Upload Statistics

```http
GET /uploads/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

```json
{
  "success": true,
  "data": {
    "totalFiles": 45,
    "totalSize": 157286400,
    "filesByCategory": {
      "images": 20,
      "documents": 15,
      "videos": 5,
      "audio": 3,
      "general": 2
    },
    "sizeByCategory": {
      "images": 52428800,
      "documents": 41943040,
      "videos": 52428800,
      "audio": 10485760,
      "general": 0
    },
    "recentUploads": [
      {
        "id": "recent1-uuid",
        "originalName": "latest.jpg",
        "filename": "file-123-1703932800010.jpg",
        "category": "images",
        "uploadedAt": "2024-01-01T15:30:00.000Z"
      }
    ]
  }
}
```

## 🗑️ File Deletion

### Delete Single File

```http
DELETE /uploads/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "File deleted successfully"
  }
}
```

### Delete Multiple Files

```http
DELETE /uploads/bulk
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "fileIds": [
    "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "a8b5f2c1-1234-4567-8901-123456789abc",
    "12345678-1234-1234-1234-123456789abc"
  ]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Deleted 2 of 3 files",
    "deletedCount": 2,
    "failedFiles": ["12345678-1234-1234-1234-123456789abc"]
  }
}
```

## ❌ Error Examples

### File Too Large

```http
POST /uploads/single/images
[File larger than 5MB]
```

#### Response

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds limit. Maximum: 5.00MB, received: 7.50MB",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/uploads/single/images",
    "statusCode": 400
  }
}
```

### Invalid File Type

```http
POST /uploads/single/images
[Upload .exe file]
```

#### Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp, bmp, svg. Received: .exe",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/uploads/single/images",
    "statusCode": 400
  }
}
```

### No File Provided

```http
POST /uploads/single
[No file in request]
```

#### Response

```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_PROVIDED",
    "message": "No file provided for upload",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/uploads/single",
    "statusCode": 400
  }
}
```

### File Not Found

```http
GET /uploads/non-existent-uuid
```

#### Response

```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found. File ID: non-existent-uuid",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/uploads/non-existent-uuid",
    "statusCode": 404
  }
}
```

## 🌐 Frontend Integration Examples

### JavaScript/Fetch

```javascript
// Single file upload
async function uploadSingleFile(file, category = 'general', description = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (description) {
    formData.append('description', description);
  }

  try {
    const response = await fetch('/uploads/single', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log('File uploaded:', result.data);
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Multiple files upload
async function uploadMultipleFiles(
  files,
  category = 'general',
  description = '',
) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  formData.append('category', category);
  if (description) {
    formData.append('description', description);
  }

  try {
    const response = await fetch('/uploads/multiple', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Uploaded ${result.data.totalFiles} files`);
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Get user files with pagination
async function getUserFiles(page = 1, limit = 20, category = null) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  try {
    const response = await fetch(`/uploads/my-files?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching files:', error);
    return null;
  }
}

// Delete file
async function deleteFile(fileId) {
  try {
    const response = await fetch(`/uploads/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('File deleted successfully');
      return true;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
```

### React Component Example

```jsx
import React, { useState, useCallback } from 'react';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileSelect = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const result = await uploadMultipleFiles(
        files,
        'images',
        'Gallery photos',
      );
      setUploadedFiles((prev) => [...prev, ...result.files]);
      setFiles([]);
      alert(`Successfully uploaded ${result.totalFiles} files`);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [files]);

  return (
    <div className="file-upload">
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="image/*"
        disabled={uploading}
      />

      {files.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files ({files.length})</h3>
          {files.map((file, index) => (
            <div key={index}>
              {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          ))}
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3>Uploaded Files</h3>
          {uploadedFiles.map((file) => (
            <div key={file.id}>
              <img src={file.url} alt={file.originalName} width="100" />
              <span>{file.originalName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
```

## 📱 Mobile App Examples

### React Native

```javascript
import DocumentPicker from 'react-native-document-picker';

// Pick and upload file
const pickAndUploadFile = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.images],
    });

    const formData = new FormData();
    formData.append('file', {
      uri: result[0].uri,
      type: result[0].type,
      name: result[0].name,
    });
    formData.append('description', 'Mobile upload');

    const response = await fetch('https://your-api.com/uploads/single/images', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Upload success:', result);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

## 🧪 Testing with cURL

### Single Image Upload

```bash
curl -X POST \
  http://localhost:3000/uploads/single/images \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'file=@/path/to/image.jpg' \
  -F 'description=Test image upload'
```

### Multiple Documents Upload

```bash
curl -X POST \
  http://localhost:3000/uploads/multiple/documents \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'files=@/path/to/doc1.pdf' \
  -F 'files=@/path/to/doc2.docx' \
  -F 'description=Test documents'
```

### Get Files

```bash
curl -X GET \
  'http://localhost:3000/uploads/my-files?page=1&limit=10&category=images' \
  -H 'Authorization: Bearer your-jwt-token'
```

### Delete File

```bash
curl -X DELETE \
  http://localhost:3000/uploads/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H 'Authorization: Bearer your-jwt-token'
```
