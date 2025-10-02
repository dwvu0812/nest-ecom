# Products API Examples

## Table of Contents
- [Products](#products)
- [Brands](#brands)
- [Categories](#categories)
- [SKU Management](#sku-management)

---

## Products

### 1. Get Products List (Public)

**Request:**
```http
GET /products?page=1&limit=12&search=laptop&minPrice=1000&maxPrice=5000&inStock=true&sortBy=price&sortOrder=asc&languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "base_price": 1500,
        "virtual_price": 1299,
        "brandId": 1,
        "images": ["https://...", "https://..."],
        "brand": {
          "id": 1,
          "logo": "https://...",
          "translations": [
            {
              "languageId": 1,
              "name": "Apple",
              "description": "..."
            }
          ]
        },
        "translations": [
          {
            "id": 1,
            "languageId": 1,
            "name": "MacBook Pro 14\"",
            "description": "Powerful laptop..."
          }
        ],
        "categories": [...],
        "skus": [
          {
            "id": 1,
            "value": "M3-16GB-512GB",
            "price": 1999,
            "stock": 50,
            "images": [...]
          }
        ],
        "avgRating": 4.8,
        "reviewCount": 125,
        "totalStock": 50,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 12,
    "totalPages": 4
  },
  "message": "Products retrieved successfully"
}
```

### 2. Get Product Detail (Public)

**Request:**
```http
GET /products/1?languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "base_price": 1500,
    "virtual_price": 1299,
    "brandId": 1,
    "images": ["..."],
    "brand": {...},
    "translations": [...],
    "categories": [...],
    "variants": [
      {
        "id": 1,
        "name": "RAM",
        "options": [
          {"id": 1, "value": "16GB"},
          {"id": 2, "value": "32GB"}
        ]
      },
      {
        "id": 2,
        "name": "Storage",
        "options": [
          {"id": 3, "value": "512GB"},
          {"id": 4, "value": "1TB"}
        ]
      }
    ],
    "skus": [
      {
        "id": 1,
        "value": "16GB-512GB",
        "price": 1999,
        "stock": 50,
        "images": [...],
        "variantOptions": [
          {"id": 1, "value": "16GB", "variant": {"name": "RAM"}},
          {"id": 3, "value": "512GB", "variant": {"name": "Storage"}}
        ]
      }
    ],
    "reviews": [...]
  },
  "message": "Product retrieved successfully"
}
```

### 3. Search Products (Public)

**Request:**
```http
GET /products/search?q=laptop&brandIds=1,2&categoryIds=5&minPrice=1000&maxPrice=5000&inStock=true
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Products found successfully"
}
```

### 4. Get Top Rated Products (Public)

**Request:**
```http
GET /products/top-rated?limit=10&languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Top rated products retrieved successfully"
}
```

### 5. Get Related Products (Public)

**Request:**
```http
GET /products/1/related?limit=6&languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Related products retrieved successfully"
}
```

### 6. Create Product (Admin)

**Request:**
```http
POST /admin/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "base_price": 1500,
  "virtual_price": 1299,
  "brandId": 1,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "categoryIds": [1, 2, 3],
  "translations": [
    {
      "languageId": 1,
      "name": "MacBook Pro 14\"",
      "description": "Powerful laptop with M3 chip"
    },
    {
      "languageId": 2,
      "name": "MacBook Pro 14 inch",
      "description": "Laptop mạnh mẽ với chip M3"
    }
  ],
  "variants": [
    {
      "name": "RAM",
      "options": [
        {"value": "16GB"},
        {"value": "32GB"}
      ]
    },
    {
      "name": "Storage",
      "options": [
        {"value": "512GB"},
        {"value": "1TB"}
      ]
    }
  ],
  "skus": [
    {
      "value": "16GB-512GB",
      "price": 1999,
      "stock": 50,
      "images": ["..."],
      "variantOptionIds": [1, 3]
    },
    {
      "value": "16GB-1TB",
      "price": 2299,
      "stock": 30,
      "images": ["..."],
      "variantOptionIds": [1, 4]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Product created successfully"
}
```

### 7. Update Product (Admin)

**Request:**
```http
PUT /admin/products/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "base_price": 1400,
  "virtual_price": 1199,
  "images": ["..."],
  "categoryIds": [1, 2],
  "translations": [
    {
      "languageId": 1,
      "name": "MacBook Pro 14\" - Updated",
      "description": "New description"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Product updated successfully"
}
```

### 8. Delete Product (Admin)

**Request:**
```http
DELETE /admin/products/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "deletedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Product deleted successfully"
}
```

### 9. Get Product Statistics (Admin)

**Request:**
```http
GET /admin/products/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "activeProducts": 145,
    "outOfStockProducts": 5,
    "totalValue": 3500000
  },
  "message": "Product statistics retrieved successfully"
}
```

### 10. Get Low Stock SKUs (Admin)

**Request:**
```http
GET /admin/products/low-stock?threshold=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "value": "32GB-1TB",
      "price": 2499,
      "stock": 3,
      "product": {...}
    }
  ],
  "message": "Low stock SKUs retrieved successfully"
}
```

---

## Brands

### 1. Get All Brands (Public)

**Request:**
```http
GET /brands/all?languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "logo": "https://...",
      "translations": [
        {
          "languageId": 1,
          "name": "Apple",
          "description": "American technology company"
        }
      ],
      "_count": {
        "products": 45
      }
    }
  ],
  "message": "All brands retrieved successfully"
}
```

### 2. Get Brands with Pagination (Public)

**Request:**
```http
GET /brands?page=1&limit=20&search=apple&languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "message": "Brands retrieved successfully"
}
```

### 3. Create Brand (Admin)

**Request:**
```http
POST /admin/brands
Authorization: Bearer {token}
Content-Type: application/json

{
  "logo": "https://example.com/logo.png",
  "translations": [
    {
      "languageId": 1,
      "name": "Samsung",
      "description": "South Korean multinational conglomerate"
    },
    {
      "languageId": 2,
      "name": "Samsung",
      "description": "Tập đoàn đa quốc gia Hàn Quốc"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Brand created successfully"
}
```

### 4. Update Brand (Admin)

**Request:**
```http
PUT /admin/brands/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "logo": "https://example.com/new-logo.png",
  "translations": [
    {
      "languageId": 1,
      "name": "Apple Inc.",
      "description": "Updated description"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Brand updated successfully"
}
```

### 5. Get Brand Statistics (Admin)

**Request:**
```http
GET /admin/brands/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBrands": 25,
    "brandsWithProducts": 20,
    "topBrands": [
      {
        "brandId": 1,
        "brandName": "Apple",
        "productCount": 45
      }
    ]
  },
  "message": "Brand statistics retrieved successfully"
}
```

---

## Categories

### 1. Get Category Tree (Public)

**Request:**
```http
GET /categories/tree?languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "parentCategoryId": null,
      "translations": [
        {
          "languageId": 1,
          "name": "Electronics",
          "description": "Electronic devices and accessories"
        }
      ],
      "childCategories": [
        {
          "id": 2,
          "parentCategoryId": 1,
          "translations": [
            {
              "languageId": 1,
              "name": "Computers",
              "description": "Desktop and laptop computers"
            }
          ],
          "childCategories": [
            {
              "id": 3,
              "parentCategoryId": 2,
              "translations": [
                {
                  "languageId": 1,
                  "name": "Laptops",
                  "description": "Portable computers"
                }
              ],
              "_count": {
                "products": 45
              }
            }
          ],
          "_count": {
            "products": 60,
            "childCategories": 2
          }
        }
      ],
      "_count": {
        "products": 150,
        "childCategories": 5
      }
    }
  ],
  "message": "Category tree retrieved successfully"
}
```

### 2. Get Categories by Parent (Public)

**Request:**
```http
GET /categories?parentId=1&languageId=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 2,
        "parentCategoryId": 1,
        "translations": [...],
        "_count": {...}
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "message": "Categories retrieved successfully"
}
```

### 3. Create Category (Admin)

**Request:**
```http
POST /admin/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "parentCategoryId": 1,
  "translations": [
    {
      "languageId": 1,
      "name": "Smart Watches",
      "description": "Wearable smart devices"
    },
    {
      "languageId": 2,
      "name": "Đồng hồ thông minh",
      "description": "Thiết bị đeo thông minh"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Category created successfully"
}
```

### 4. Update Category (Admin)

**Request:**
```http
PUT /admin/categories/3
Authorization: Bearer {token}
Content-Type: application/json

{
  "parentCategoryId": 2,
  "translations": [
    {
      "languageId": 1,
      "name": "Gaming Laptops",
      "description": "High-performance laptops for gaming"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Category updated successfully"
}
```

### 5. Get Category Statistics (Admin)

**Request:**
```http
GET /admin/categories/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCategories": 50,
    "rootCategories": 10,
    "categoriesWithProducts": 35,
    "topCategories": [
      {
        "categoryId": 3,
        "categoryName": "Laptops",
        "productCount": 45
      }
    ]
  },
  "message": "Category statistics retrieved successfully"
}
```

---

## SKU Management

### 1. Create SKU (Admin)

**Request:**
```http
POST /admin/products/skus
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "value": "64GB-2TB",
  "price": 2999,
  "stock": 20,
  "images": ["https://..."],
  "variantOptionIds": [2, 6]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "value": "64GB-2TB",
    "price": 2999,
    "stock": 20,
    "productId": 1
  },
  "message": "SKU created successfully"
}
```

### 2. Update SKU (Admin)

**Request:**
```http
PUT /admin/products/skus/10
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 2799,
  "stock": 25,
  "images": ["https://..."]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "SKU updated successfully"
}
```

### 3. Update Stock (Admin)

**Request:**
```http
PUT /admin/products/skus/10/stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 5,
  "operation": "increment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "stock": 30
  },
  "message": "Stock updated successfully"
}
```

### 4. Delete SKU (Admin)

**Request:**
```http
DELETE /admin/products/skus/10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "deletedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "SKU deleted successfully"
}
```

---

## Error Responses

### Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

### Validation Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "base_price",
      "message": "base_price must be a positive number"
    }
  ],
  "error": "Bad Request"
}
```

### Business Logic Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot delete brand",
  "details": "Brand has 45 products associated with it",
  "error": "Bad Request"
}
```

### Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You don't have permission to access this resource",
  "error": "Forbidden"
}
```
