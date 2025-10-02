# Products Module - Usage Guide

## Quick Start

### 1. Setup & Installation

Module đã được tích hợp vào `AppModule`. Không cần cài đặt thêm dependencies.

### 2. Database Migration

Sử dụng schema hiện có - không cần migration mới:

```bash
# Generate Prisma client
pnpm run db:generate

# Apply migrations
pnpm run db:migrate
```

### 3. Seed Data (Optional)

Tạo seed data cho products nếu cần:

```bash
pnpm run db:seed:products
```

---

## Common Use Cases

### Use Case 1: Display Product Catalog (Frontend)

#### Step 1: Fetch Products with Filters

```typescript
// API Call
GET /products?page=1&limit=12&categoryIds=3&inStock=true&sortBy=price&sortOrder=asc&languageId=1

// Response structure
{
  data: {
    data: Product[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

#### Step 2: Display Product Grid

```tsx
// React Example
const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    fetch(`/products?page=${page}&limit=12&languageId=1`)
      .then(res => res.json())
      .then(data => setProducts(data.data.data));
  }, [page]);
  
  return (
    <div className="grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

---

### Use Case 2: Product Detail Page

#### Step 1: Fetch Product with Full Details

```typescript
GET /products/{id}?languageId=1

// Response includes:
// - Product info
// - Brand with translations
// - Categories with translations
// - All SKUs with stock
// - Variants and options
// - Reviews
```

#### Step 2: Display Product Details

```tsx
const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  
  // Find matching SKU based on selected variant options
  const currentSKU = useMemo(() => {
    return product?.skus.find(sku => 
      sku.variantOptions.every(opt => 
        selectedOptions[opt.variant.name] === opt.value
      )
    );
  }, [product, selectedOptions]);
  
  return (
    <div>
      <h1>{product?.translations[0]?.name}</h1>
      <p>{product?.translations[0]?.description}</p>
      
      {/* Variant Selector */}
      {product?.variants.map(variant => (
        <VariantSelector
          key={variant.id}
          variant={variant}
          selected={selectedOptions[variant.name]}
          onChange={(value) => 
            setSelectedOptions({...selectedOptions, [variant.name]: value})
          }
        />
      ))}
      
      {/* Price & Stock */}
      <div>
        <p>Price: ${currentSKU?.price}</p>
        <p>Stock: {currentSKU?.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
      </div>
      
      {/* Add to Cart */}
      <button disabled={!currentSKU || currentSKU.stock === 0}>
        Add to Cart
      </button>
    </div>
  );
};
```

---

### Use Case 3: Create Product (Admin)

#### Step 1: Prepare Product Data

```typescript
const productData = {
  base_price: 1500,
  virtual_price: 1299,
  brandId: 1,
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  categoryIds: [1, 2, 3],
  
  // Multi-language translations
  translations: [
    {
      languageId: 1, // English
      name: 'MacBook Pro 14"',
      description: 'Powerful laptop with M3 chip'
    },
    {
      languageId: 2, // Vietnamese
      name: 'MacBook Pro 14 inch',
      description: 'Laptop mạnh mẽ với chip M3'
    }
  ],
  
  // Define variants
  variants: [
    {
      name: 'RAM',
      options: [
        { value: '16GB' },
        { value: '32GB' }
      ]
    },
    {
      name: 'Storage',
      options: [
        { value: '512GB' },
        { value: '1TB' }
      ]
    }
  ],
  
  // Create SKUs (will be auto-connected to variant options later)
  skus: [
    {
      value: '16GB-512GB',
      price: 1999,
      stock: 50,
      images: ['...'],
      // Note: variantOptionIds will be filled after variants are created
    }
  ]
};
```

#### Step 2: Create Product

```typescript
POST /admin/products
Authorization: Bearer {token}
Content-Type: application/json

// After creation, you may need to update SKUs with variantOptionIds
// Or create SKUs separately after getting variant option IDs
```

---

### Use Case 4: Stock Management

#### Scenario A: Receive New Stock

```typescript
PUT /admin/products/skus/{skuId}/stock
Authorization: Bearer {token}

{
  "quantity": 50,
  "operation": "increment"
}
```

#### Scenario B: Process Order (Decrease Stock)

```typescript
PUT /admin/products/skus/{skuId}/stock
Authorization: Bearer {token}

{
  "quantity": 1,
  "operation": "decrement"
}
```

#### Scenario C: Monitor Low Stock

```typescript
// Get all SKUs with stock <= 10
GET /admin/products/low-stock?threshold=10
Authorization: Bearer {token}

// Response: Array of SKUs with low stock
// Use this for inventory alerts
```

---

### Use Case 5: Search & Filter

#### Frontend Search Implementation

```typescript
const ProductSearch = () => {
  const [filters, setFilters] = useState({
    search: '',
    brandIds: [],
    categoryIds: [],
    minPrice: null,
    maxPrice: null,
    inStock: true,
    sortBy: 'created',
    sortOrder: 'desc'
  });
  
  const searchProducts = () => {
    const query = new URLSearchParams();
    
    if (filters.search) query.append('search', filters.search);
    if (filters.brandIds.length) query.append('brandIds', filters.brandIds.join(','));
    if (filters.categoryIds.length) query.append('categoryIds', filters.categoryIds.join(','));
    if (filters.minPrice) query.append('minPrice', filters.minPrice);
    if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);
    if (filters.inStock) query.append('inStock', 'true');
    query.append('sortBy', filters.sortBy);
    query.append('sortOrder', filters.sortOrder);
    
    fetch(`/products?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        // Handle results
      });
  };
  
  return (
    <div>
      <input 
        value={filters.search}
        onChange={(e) => setFilters({...filters, search: e.target.value})}
        placeholder="Search products..."
      />
      
      <BrandFilter 
        selected={filters.brandIds}
        onChange={(ids) => setFilters({...filters, brandIds: ids})}
      />
      
      <CategoryFilter 
        selected={filters.categoryIds}
        onChange={(ids) => setFilters({...filters, categoryIds: ids})}
      />
      
      <PriceRangeFilter 
        min={filters.minPrice}
        max={filters.maxPrice}
        onChange={(min, max) => setFilters({...filters, minPrice: min, maxPrice: max})}
      />
      
      <button onClick={searchProducts}>Search</button>
    </div>
  );
};
```

---

### Use Case 6: Category Navigation

#### Display Category Tree

```typescript
GET /categories/tree?languageId=1

// Use recursive component to display
const CategoryTree = ({ categories }) => {
  return (
    <ul>
      {categories.map(category => (
        <li key={category.id}>
          <Link to={`/categories/${category.id}`}>
            {category.translations[0]?.name}
            ({category._count.products} products)
          </Link>
          
          {category.childCategories?.length > 0 && (
            <CategoryTree categories={category.childCategories} />
          )}
        </li>
      ))}
    </ul>
  );
};
```

---

### Use Case 7: Multi-language Support

#### Switch Language

```typescript
// Store language preference
const [languageId, setLanguageId] = useState(1); // 1 = English, 2 = Vietnamese

// All API calls include languageId
GET /products?languageId=${languageId}
GET /brands?languageId=${languageId}
GET /categories/tree?languageId=${languageId}

// Display translations
const displayName = product.translations.find(
  t => t.languageId === languageId
)?.name || product.translations[0]?.name;
```

---

### Use Case 8: Related Products & Recommendations

#### Show Related Products

```typescript
GET /products/{productId}/related?limit=6&languageId=1

// Display as "You may also like" section
const RelatedProducts = ({ productId }) => {
  const [related, setRelated] = useState([]);
  
  useEffect(() => {
    fetch(`/products/${productId}/related?limit=6&languageId=1`)
      .then(res => res.json())
      .then(data => setRelated(data.data));
  }, [productId]);
  
  return (
    <section>
      <h2>You May Also Like</h2>
      <div className="product-grid">
        {related.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
```

#### Show Top Rated Products

```typescript
GET /products/top-rated?limit=10&languageId=1

// Display on homepage or sidebar
```

---

### Use Case 9: Admin Dashboard Statistics

#### Display Product Statistics

```typescript
GET /admin/products/statistics
GET /admin/brands/statistics
GET /admin/categories/statistics

// Example Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: null,
    brands: null,
    categories: null
  });
  
  useEffect(() => {
    Promise.all([
      fetch('/admin/products/statistics').then(r => r.json()),
      fetch('/admin/brands/statistics').then(r => r.json()),
      fetch('/admin/categories/statistics').then(r => r.json())
    ]).then(([products, brands, categories]) => {
      setStats({
        products: products.data,
        brands: brands.data,
        categories: categories.data
      });
    });
  }, []);
  
  return (
    <div className="dashboard">
      <StatCard 
        title="Total Products" 
        value={stats.products?.totalProducts}
      />
      <StatCard 
        title="Out of Stock" 
        value={stats.products?.outOfStockProducts}
        alert={stats.products?.outOfStockProducts > 0}
      />
      <StatCard 
        title="Total Inventory Value" 
        value={`$${stats.products?.totalValue.toLocaleString()}`}
      />
      
      <TopBrands brands={stats.brands?.topBrands} />
      <TopCategories categories={stats.categories?.topCategories} />
    </div>
  );
};
```

---

## Service Integration

### Using Products Service in Another Module

```typescript
// In your module
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  // ...
})
export class OrdersModule {}

// In your service
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(private readonly productsService: ProductsService) {}
  
  async createOrder(items: OrderItem[]) {
    // Validate stock availability
    for (const item of items) {
      const product = await this.productsService.getProductById(item.productId);
      const sku = product.skus.find(s => s.id === item.skuId);
      
      if (!sku || sku.stock < item.quantity) {
        throw new Error('Insufficient stock');
      }
    }
    
    // Create order...
    
    // Update stock
    for (const item of items) {
      await this.productsService.updateStock(item.skuId, item.quantity, 'decrement');
    }
  }
}
```

---

## Testing Examples

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductRepository } from './repositories/product.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findWithTranslations: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductRepository, useValue: mockRepository },
        // ... other dependencies
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(ProductRepository);
  });

  it('should get product by id', async () => {
    const mockProduct = { id: 1, name: 'Test Product' };
    repository.findWithTranslations.mockResolvedValue(mockProduct as any);

    const result = await service.getProductById(1);

    expect(result).toEqual(mockProduct);
    expect(repository.findWithTranslations).toHaveBeenCalledWith(1, undefined);
  });
});
```

---

## Performance Tips

### 1. Use Language Filtering
Always specify `languageId` to reduce data transferred:
```typescript
GET /products?languageId=1
```

### 2. Pagination
Always use pagination for lists:
```typescript
GET /products?page=1&limit=12
```

### 3. Specific Includes
When using repositories directly, only include what you need:
```typescript
const product = await productRepository.findMany({
  include: {
    brand: true,
    translations: { where: { languageId } }
  }
});
```

### 4. Caching (Future)
Consider implementing caching for:
- Category tree
- Brand list
- Top rated products

---

## Troubleshooting

### Issue: "Insufficient stock" error

**Solution:** Check stock before adding to cart:
```typescript
const sku = await getSKU(skuId);
if (sku.stock < quantity) {
  // Show error
}
```

### Issue: Circular reference in categories

**Solution:** The system validates this automatically. If error occurs, check parent chain.

### Issue: Cannot delete brand/category

**Solution:** Remove all associated products first, or use soft delete which is automatic.

### Issue: SKU variant options not matching

**Solution:** Ensure variant option IDs are valid and belong to the product's variants.

---

## Best Practices

1. **Always validate stock** before order processing
2. **Use transactions** for complex operations (create product with SKUs)
3. **Include languageId** for better UX
4. **Implement optimistic UI updates** for better perceived performance
5. **Cache category tree** - it doesn't change often
6. **Use soft delete** - allows recovery
7. **Log all admin actions** - audit trail is automatic
8. **Validate variant combinations** before creating SKUs

---

## Next Steps

- [API Examples](./api-examples.md) - Detailed API documentation
- [README](./README.md) - Module overview
- Configure permissions for your admin users
- Set up seed data for testing
- Implement frontend integration
- Add caching layer for frequently accessed data
