# Language API - Examples & Testing

## Postman Collection

### Environment Variables

Tạo environment trong Postman với các variables sau:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "your-jwt-token-here"
}
```

---

## API Examples

### 1. Lấy tất cả ngôn ngữ

```bash
curl --location --request GET '{{base_url}}/languages' \
--header 'Content-Type: application/json'
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "English",
      "code": "en",
      "createdById": 1,
      "updatedById": null,
      "deletedAt": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "message": "Languages retrieved successfully"
}
```

---

### 2. Lấy chi tiết ngôn ngữ

```bash
curl --location --request GET '{{base_url}}/languages/1' \
--header 'Content-Type: application/json'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "English",
    "code": "en",
    "createdById": 1,
    "updatedById": null,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "message": "Language retrieved successfully"
}
```

---

### 3. Tạo ngôn ngữ mới

```bash
curl --location --request POST '{{base_url}}/languages' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{access_token}}' \
--data-raw '{
  "name": "Tiếng Việt",
  "code": "vi"
}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Tiếng Việt",
    "code": "vi",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:05:00.000Z",
    "updatedAt": "2024-01-01T10:05:00.000Z"
  },
  "message": "Language created successfully"
}
```

---

### 4. Cập nhật ngôn ngữ

```bash
curl --location --request PUT '{{base_url}}/languages/2' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{access_token}}' \
--data-raw '{
  "name": "Tiếng Việt (VN)",
  "code": "vi-VN"
}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Tiếng Việt (VN)",
    "code": "vi-VN",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": null,
    "createdAt": "2024-01-01T10:05:00.000Z",
    "updatedAt": "2024-01-01T10:10:00.000Z"
  },
  "message": "Language updated successfully"
}
```

---

### 5. Xóa ngôn ngữ

```bash
curl --location --request DELETE '{{base_url}}/languages/2' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{access_token}}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Tiếng Việt (VN)",
    "code": "vi-VN",
    "createdById": 1,
    "updatedById": 1,
    "deletedAt": "2024-01-01T10:15:00.000Z",
    "createdAt": "2024-01-01T10:05:00.000Z",
    "updatedAt": "2024-01-01T10:15:00.000Z"
  },
  "message": "Language deleted successfully"
}
```

---

## Error Examples

### 1. Ngôn ngữ không tồn tại

```bash
curl --location --request GET '{{base_url}}/languages/999'
```

**Response (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Language not found",
    "statusCode": 404,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages/999"
  }
}
```

---

### 2. Mã ngôn ngữ đã tồn tại

```bash
curl --location --request POST '{{base_url}}/languages' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "English",
  "code": "en"
}'
```

**Response (409):**

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_EXISTS",
    "message": "Language code already exists",
    "statusCode": 409,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages"
  }
}
```

---

### 3. Validation Error

```bash
curl --location --request POST '{{base_url}}/languages' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "",
  "code": ""
}'
```

**Response (400):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name should not be empty",
    "statusCode": 400,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "path": "/languages"
  }
}
```

---

## Postman Collection JSON

Tạo collection trong Postman với JSON sau:

```json
{
  "info": {
    "name": "Language API",
    "description": "Collection for Language Management API endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Languages",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/languages",
          "host": ["{{base_url}}"],
          "path": ["languages"]
        }
      }
    },
    {
      "name": "Get Language by ID",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/languages/:languageId",
          "host": ["{{base_url}}"],
          "path": ["languages", ":languageId"],
          "variable": [
            {
              "key": "languageId",
              "value": "1"
            }
          ]
        }
      }
    },
    {
      "name": "Create Language",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Français\",\n  \"code\": \"fr\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/languages",
          "host": ["{{base_url}}"],
          "path": ["languages"]
        }
      }
    },
    {
      "name": "Update Language",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"English (Updated)\",\n  \"code\": \"en-us\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/languages/:languageId",
          "host": ["{{base_url}}"],
          "path": ["languages", ":languageId"],
          "variable": [
            {
              "key": "languageId",
              "value": "1"
            }
          ]
        }
      }
    },
    {
      "name": "Delete Language",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/languages/:languageId",
          "host": ["{{base_url}}"],
          "path": ["languages", ":languageId"],
          "variable": [
            {
              "key": "languageId",
              "value": "1"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "access_token",
      "value": "your-jwt-token-here"
    }
  ]
}
```

---

## Testing Script

### Node.js/JavaScript Testing

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const ACCESS_TOKEN = 'your-jwt-token-here';

// Test suite
async function testLanguageAPI() {
  console.log('🚀 Testing Language API endpoints...\n');

  try {
    // 1. Get all languages
    console.log('📋 Testing GET /languages');
    const getAllResponse = await axios.get(`${BASE_URL}/languages`);
    console.log('✅ GET /languages:', getAllResponse.data.success);

    // 2. Create new language
    console.log('\n➕ Testing POST /languages');
    const createResponse = await axios.post(
      `${BASE_URL}/languages`,
      {
        name: 'Test Language',
        code: 'test',
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('✅ POST /languages:', createResponse.data.success);
    const languageId = createResponse.data.data.id;

    // 3. Get language by ID
    console.log('\n🔍 Testing GET /languages/:id');
    const getByIdResponse = await axios.get(
      `${BASE_URL}/languages/${languageId}`,
    );
    console.log('✅ GET /languages/:id:', getByIdResponse.data.success);

    // 4. Update language
    console.log('\n✏️ Testing PUT /languages/:id');
    const updateResponse = await axios.put(
      `${BASE_URL}/languages/${languageId}`,
      {
        name: 'Updated Test Language',
        code: 'test-updated',
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('✅ PUT /languages/:id:', updateResponse.data.success);

    // 5. Delete language
    console.log('\n🗑️ Testing DELETE /languages/:id');
    const deleteResponse = await axios.delete(
      `${BASE_URL}/languages/${languageId}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      },
    );
    console.log('✅ DELETE /languages/:id:', deleteResponse.data.success);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testLanguageAPI();
```

---

## Quick Test Commands

### Using HTTPie

```bash
# Get all languages
http GET localhost:3000/languages

# Get language by ID
http GET localhost:3000/languages/1

# Create language (requires auth)
http POST localhost:3000/languages \
  name="Español" \
  code="es" \
  Authorization:"Bearer your-token-here"

# Update language (requires auth)
http PUT localhost:3000/languages/1 \
  name="English (US)" \
  code="en-us" \
  Authorization:"Bearer your-token-here"

# Delete language (requires auth)
http DELETE localhost:3000/languages/1 \
  Authorization:"Bearer your-token-here"
```

### Using wget

```bash
# Get all languages
wget -qO- --header="Content-Type: application/json" \
  http://localhost:3000/languages

# Create language (requires auth)
wget -qO- --post-data='{"name":"Deutsch","code":"de"}' \
  --header="Content-Type: application/json" \
  --header="Authorization: Bearer your-token-here" \
  http://localhost:3000/languages
```

---

**Last Updated**: January 2024  
**API Version**: v1
