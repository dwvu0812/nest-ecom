# Products Module Documentation

## Tổng quan

Products Module là module quản lý toàn bộ sản phẩm, thương hiệu, và danh mục trong hệ thống e-commerce. Module này được xây dựng theo kiến trúc Repository Pattern, đảm bảo tính nhất quán với codebase hiện tại.

## Kiến trúc

### Cấu trúc thư mục

```
src/products/
├── controllers/
│   ├── admin-products.controller.ts    # Admin endpoints cho products
│   ├── admin-brands.controller.ts      # Admin endpoints cho brands
│   └── admin-categories.controller.ts  # Admin endpoints cho categories
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── product-query.dto.ts
│   ├── product-response.dto.ts
│   ├── create-brand.dto.ts
│   ├── update-brand.dto.ts
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   ├── create-sku.dto.ts
│   ├── update-sku.dto.ts
│   └── index.ts
├── repositories/
│   ├── product.repository.ts
│   ├── product-translation.repository.ts
│   ├── brand.repository.ts
│   ├── brand-translation.repository.ts
│   ├── category.repository.ts
│   ├── category-translation.repository.ts
│   ├── sku.repository.ts
│   └── variant.repository.ts
├── products.controller.ts              # Public endpoints
├── brands.controller.ts                # Public endpoints
├── categories.controller.ts            # Public endpoints
├── products.service.ts
├── brands.service.ts
├── categories.service.ts
└── products.module.ts
```

## Các tính năng chính

### 1. Products Management

#### Đặc điểm:
- ✅ Multi-language support (translations)
- ✅ Multiple images per product
- ✅ Brand association
- ✅ Multiple categories (many-to-many)
- ✅ Base price & virtual price
- ✅ SKU variants with options
- ✅ Stock management
- ✅ Soft delete
- ✅ Audit trail (createdBy, updatedBy)
- ✅ Search & filter
- ✅ Pagination
- ✅ Related products
- ✅ Top rated products

#### Endpoints:

**Public:**
- `GET /products` - Danh sách sản phẩm với pagination & filter
- `GET /products/:id` - Chi tiết sản phẩm
- `GET /products/search` - Tìm kiếm sản phẩm
- `GET /products/top-rated` - Sản phẩm được đánh giá cao
- `GET /products/:id/related` - Sản phẩm liên quan

**Admin:**
- `GET /admin/products` - Quản lý danh sách sản phẩm
- `GET /admin/products/statistics` - Thống kê sản phẩm
- `GET /admin/products/low-stock` - SKU sắp hết hàng
- `GET /admin/products/out-of-stock` - SKU hết hàng
- `GET /admin/products/:id` - Chi tiết sản phẩm admin
- `POST /admin/products` - Tạo sản phẩm mới
- `PUT /admin/products/:id` - Cập nhật sản phẩm
- `DELETE /admin/products/:id` - Xóa sản phẩm (soft delete)
- `PUT /admin/products/:id/restore` - Khôi phục sản phẩm
- `POST /admin/products/skus` - Tạo SKU mới
- `PUT /admin/products/skus/:id` - Cập nhật SKU
- `DELETE /admin/products/skus/:id` - Xóa SKU
- `PUT /admin/products/skus/:id/stock` - Cập nhật tồn kho

### 2. Brands Management

#### Đặc điểm:
- ✅ Multi-language support
- ✅ Logo management
- ✅ Product count tracking
- ✅ Search functionality
- ✅ Statistics

#### Endpoints:

**Public:**
- `GET /brands` - Danh sách thương hiệu
- `GET /brands/all` - Tất cả thương hiệu
- `GET /brands/search` - Tìm kiếm thương hiệu
- `GET /brands/:id` - Chi tiết thương hiệu

**Admin:**
- `GET /admin/brands` - Quản lý danh sách thương hiệu
- `GET /admin/brands/statistics` - Thống kê thương hiệu
- `GET /admin/brands/:id` - Chi tiết thương hiệu
- `POST /admin/brands` - Tạo thương hiệu
- `PUT /admin/brands/:id` - Cập nhật thương hiệu
- `DELETE /admin/brands/:id` - Xóa thương hiệu
- `PUT /admin/brands/:id/restore` - Khôi phục thương hiệu

### 3. Categories Management

#### Đặc điểm:
- ✅ Multi-language support
- ✅ Hierarchical structure (parent-child)
- ✅ Category tree
- ✅ Circular reference detection
- ✅ Product count tracking
- ✅ Statistics

#### Endpoints:

**Public:**
- `GET /categories` - Danh sách danh mục
- `GET /categories/tree` - Cây danh mục
- `GET /categories/search` - Tìm kiếm danh mục
- `GET /categories/:id` - Chi tiết danh mục
- `GET /categories/:id/children` - Danh mục với con

**Admin:**
- `GET /admin/categories` - Quản lý danh sách danh mục
- `GET /admin/categories/tree` - Cây danh mục
- `GET /admin/categories/statistics` - Thống kê danh mục
- `GET /admin/categories/:id` - Chi tiết danh mục
- `POST /admin/categories` - Tạo danh mục
- `PUT /admin/categories/:id` - Cập nhật danh mục
- `DELETE /admin/categories/:id` - Xóa danh mục
- `PUT /admin/categories/:id/restore` - Khôi phục danh mục

## Database Schema

### Product
```prisma
model Product {
  id            Int      @id @default(autoincrement())
  base_price    Float
  virtual_price Float
  brandId       Int
  images        String[]
  
  brand               Brand
  translations        ProductTranslation[]
  variants            Variant[]
  skus                SKU[]
  reviews             Review[]
  categories          Category[]
}
```

### ProductTranslation
```prisma
model ProductTranslation {
  id          Int    @id @default(autoincrement())
  productId   Int
  languageId  Int
  name        String
  description String
}
```

### SKU
```prisma
model SKU {
  id        Int      @id @default(autoincrement())
  value     String
  price     Float
  stock     Int
  images    String[]
  productId Int
  
  variantOptions VariantOption[]
}
```

### Variant & VariantOption
```prisma
model Variant {
  id        Int    @id @default(autoincrement())
  name      String
  productId Int
  
  options VariantOption[]
}

model VariantOption {
  id        Int    @id @default(autoincrement())
  value     String
  variantId Int
}
```

## Repository Pattern

### Base Repository
Tất cả repositories extend từ `BaseRepository` để có các operations cơ bản:
- `findMany()`, `findUnique()`, `findFirst()`
- `create()`, `update()`, `delete()`
- `softDelete()`, `restore()`
- `count()`, `exists()`
- `findManyWithPagination()`

### Product Repository

Các methods chuyên biệt:
```typescript
- findByBrand(brandId: number)
- findByCategory(categoryId: number)
- findWithTranslations(id: number, languageId?: number)
- searchProducts(query: string, filters?: ProductSearchFilters)
- getProductsWithPagination(params: ProductPaginationParams)
- updateStock(productId: number, skuId: number, quantity: number)
- getTopRatedProducts(limit?: number, languageId?: number)
- getRelatedProducts(productId: number, limit?: number, languageId?: number)
- getProductStatistics()
```

### Brand Repository

Các methods chuyên biệt:
```typescript
- findWithTranslations(id: number, languageId?: number)
- findAllActive(languageId?: number)
- searchBrands(query: string, languageId?: number)
- getBrandsWithPagination(params)
- getBrandStatistics()
```

### Category Repository

Các methods chuyên biệt:
```typescript
- findWithTranslations(id: number, languageId?: number)
- findWithChildren(id: number, languageId?: number)
- findByParent(parentId: number | null, languageId?: number)
- getCategoryTree(languageId?: number)
- searchCategories(query: string, languageId?: number)
- getCategoriesWithPagination(params)
- getCategoryStatistics()
```

## Services

### ProductsService
Xử lý business logic cho products và SKUs:
- CRUD operations
- Transaction handling
- Stock management
- Search & filter
- Statistics

### BrandsService
Xử lý business logic cho brands:
- CRUD operations
- Validation (không cho xóa brand có products)
- Translation management

### CategoriesService
Xử lý business logic cho categories:
- CRUD operations
- Hierarchical validation
- Circular reference detection
- Translation management

## Validation & DTOs

### Class Validators
Tất cả DTOs sử dụng class-validator cho validation:
- `@IsNotEmpty()` - Required fields
- `@IsString()`, `@IsNumber()`, `@IsInt()` - Type validation
- `@Min()` - Minimum value
- `@IsArray()`, `@ArrayMinSize()` - Array validation
- `@ValidateNested()` - Nested object validation

### Example: CreateProductDto
```typescript
{
  base_price: number;        // Required, >= 0
  virtual_price: number;     // Required, >= 0
  brandId: number;           // Required
  images?: string[];         // Optional
  categoryIds: number[];     // Required, min 1
  translations: [{           // Required, min 1
    languageId: number;
    name: string;
    description: string;
  }];
  variants?: [...];          // Optional
  skus?: [...];              // Optional
}
```

## Authentication & Authorization

### Guards
- `JwtAuthGuard` - Xác thực JWT token
- `PermissionGuard` - Kiểm tra quyền

### Permissions Required
```typescript
// Products
'Quản lý sản phẩm'  - View/List
'Tạo sản phẩm'      - Create
'Cập nhật sản phẩm' - Update
'Xóa sản phẩm'      - Delete

// Brands
'Quản lý thương hiệu'
'Tạo thương hiệu'
'Cập nhật thương hiệu'
'Xóa thương hiệu'

// Categories
'Quản lý danh mục'
'Tạo danh mục'
'Cập nhật danh mục'
'Xóa danh mục'
```

## Audit Logging

Tất cả các operations admin được log:
```typescript
await this.auditLogService.logAction(
  userId,
  action,        // 'CREATE_PRODUCT', 'UPDATE_PRODUCT', etc.
  resourceType,  // 'Product', 'Brand', 'Category'
  resourceId,
  oldData,
  newData,
  request
);
```

## Error Handling

Sử dụng `ResourceException` từ shared module:
```typescript
ResourceException.notFound('Product', id.toString())
ResourceException.validationError('message', 'details')
ResourceException.alreadyExists('resource')
```

## Testing

### Unit Tests
```typescript
describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<ProductRepository>;
  
  // Test cases...
});
```

### Integration Tests
```typescript
describe('ProductsController (e2e)', () => {
  // E2E test cases...
});
```

## Best Practices

1. **Luôn sử dụng transactions** cho operations phức tạp
2. **Validate input** ở DTO level
3. **Check relationships** trước khi delete
4. **Include translations** based on languageId
5. **Soft delete** cho tất cả entities
6. **Log all admin actions** cho audit trail
7. **Pagination** cho tất cả list endpoints
8. **Handle stock carefully** - validate before decrement

## Performance Considerations

1. **Indexes** đã được tạo cho:
   - Foreign keys
   - deletedAt columns
   - Frequently queried fields

2. **Eager loading** chỉ khi cần:
   - Sử dụng `include` có điều kiện
   - Filter deleted records ở query level

3. **Caching** (future enhancement):
   - Category tree
   - Top rated products
   - Brand list

## Migration & Deployment

Không cần migration mới - sử dụng schema hiện có.

## Troubleshooting

### Common Issues

1. **SKU validation error**: Kiểm tra variantOptionIds có valid không
2. **Circular reference**: Category hierarchy có vòng lặp
3. **Cannot delete**: Brand/Category có products liên kết
4. **Stock insufficient**: Validate stock trước khi order

## Links

- [API Examples](./api-examples.md)
- [Product API](./product-api.md)
- [Brand API](./brand-api.md)
- [Category API](./category-api.md)
- [Usage Guide](./usage-guide.md)
