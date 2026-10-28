# Products API reference

The following example shows how the pieces cooperate. It uses an in-memory repository to keep attention on architecture. A database-backed implementation can replace it behind the same interface.

### API contract

| Method and path | Purpose | Success |
| --- | --- | ---: |
| `GET /api/products` | List products | `200` |
| `GET /api/products/:id` | Retrieve one product | `200` |
| `POST /api/products` | Create a product | `201` |
| `PATCH /api/products/:id` | Partially update a product | `200` |
| `DELETE /api/products/:id` | Delete a product | `204` |

### Domain types

```ts
// products.types.ts
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  description?: string;
}

export type NewProduct = Omit<Product, 'id'>;
export type ProductPatch = Partial<Omit<Product, 'id' | 'sku'>>;
```

For real money, avoid floating-point ambiguity. Store integer minor units such as cents or use a suitable decimal type.

### Schemas

```ts
// products.schema.ts — Zod4, defaults belong only to creation
import { z } from 'zod';
export const productIdSchema = z.string().uuid();
const editableFields = {
  name: z.string().trim().min(2).max(100),
  price: z.number().finite().positive(),
  stock: z.number().int().nonnegative(),
  description: z.string().trim().max(1000).optional(),
};
export const createProductSchema = z.object({
  ...editableFields,
  sku: z.string().trim().regex(/^[A-Z0-9-]{3,30}$/),
  stock: editableFields.stock.default(0),
}).strict().transform(({ description, ...required }) =>
  description === undefined ? required : { ...required, description });

export const updateProductSchema = z.object(editableFields).partial().strict()
  .refine(patch => Object.keys(patch).length > 0 &&
    Object.values(patch).every(value => value !== undefined), {
    error: 'At least one defined editable field is required',
  }).transform(({ name, price, stock, description }) => ({
    ...(name !== undefined ? { name } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(stock !== undefined ? { stock } : {}),
    ...(description !== undefined ? { description } : {}),
  }));
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

Zod4 applies defaults even inside optional fields, so partial() of a creation schema containing stock.default(0) can synthesize stock during an unrelated PATCH. Build PATCH from fields without creation defaults. Reject empty/explicit-undefined patches, keep omitted fields absent, preserve explicit stock:0 and reject unknown/immutable id/sku. The transforms project only defined primitive fields, aligning exact optionality with the domain types. Null is not a deletion operation here; define a separate explicit nullable/reset contract if needed. Creation alone defaults stock to0. Test both parsed output keys and the persisted unchanged stock after a name-only update.


### Repository

```ts
// products.repository.ts
import { randomUUID } from 'node:crypto';
import { ConflictError } from '../shared/errors/app-errors.js';
import type { NewProduct, Product, ProductPatch } from './products.types.js';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  create(input: NewProduct): Promise<Product>;
  update(id: string, patch: ProductPatch): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  async findAll(): Promise<Product[]> {
    return [...this.products.values()].map((product) => ({ ...product }));
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return product ? { ...product } : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = [...this.products.values()].find((item) => item.sku === sku);
    return product ? { ...product } : null;
  }

  async create(input: NewProduct): Promise<Product> {
    // No await between duplicate check and insertion: atomic within this JS isolate.
    if ([...this.products.values()].some(product => product.sku === input.sku))
      throw new ConflictError('SKU already exists');
    const product: Product = { id: randomUUID(), name: input.name, sku: input.sku,
      price: input.price, stock: input.stock,
      ...(input.description !== undefined ? { description: input.description } : {}) };
    this.products.set(product.id, product);
    return { ...product };
  }

  async update(id: string, patch: ProductPatch): Promise<Product | null> {
    const current = this.products.get(id);
    if (!current) return null;

    const updated = { ...current, ...patch };
    this.products.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}
```

Cloning returned objects prevents callers from accidentally changing repository state without calling update. This model contains only primitive fields, so a shallow copy is sufficient; nested mutable data would need an ownership policy. The service lookup is a friendly early conflict check, not race prevention: create itself checks and inserts without an await. Two concurrent service calls therefore cannot insert the same SKU in this single-process fake. A real database must enforce a unique constraint/index and translate its violation; this in-memory critical section is not cross-process synchronization.

### Service

```ts
// products.service.ts
import { ConflictError, NotFoundError } from '../shared/errors/app-errors.js';
import type { ProductRepository } from './products.repository.js';
import type { CreateProductInput, UpdateProductInput } from './products.schema.js';
import type { Product } from './products.types.js';

export function createProductService(repository: ProductRepository) {
  return {
    list(): Promise<Product[]> {
      return repository.findAll();
    },

    async getById(id: string): Promise<Product> {
      const product = await repository.findById(id);
      if (!product) throw new NotFoundError('Product', id);
      return product;
    },

    async create(input: CreateProductInput): Promise<Product> {
      const duplicate = await repository.findBySku(input.sku);
      if (duplicate) throw new ConflictError(`SKU ${input.sku} already exists`);
      return repository.create(input);
    },

    async update(id: string, patch: UpdateProductInput): Promise<Product> {
      const product = await repository.update(id, patch);
      if (!product) throw new NotFoundError('Product', id);
      return product;
    },

    async remove(id: string): Promise<void> {
      const deleted = await repository.delete(id);
      if (!deleted) throw new NotFoundError('Product', id);
    },
  };
}
```

### Validation middleware

```ts
// shared/validation/validate.ts
import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

type RequestTarget = 'body' | 'params' | 'query';

export function validate(target: RequestTarget, schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Request ${target} is invalid`,
          details: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
      return;
    }

    res.locals[target] = result.data;
    next();
  };
}
```

### Controller factory

```ts
// products.controller.ts
import type { RequestHandler } from 'express';
import type { createProductService } from './products.service.js';

type ProductService = ReturnType<typeof createProductService>;

export function createProductController(service: ProductService) {
  const list: RequestHandler = async (_req, res) => {
    res.json(await service.list());
  };

  const getById: RequestHandler = async (_req, res) => {
    res.json(await service.getById(res.locals.params.id));
  };

  const create: RequestHandler = async (_req, res) => {
    const product = await service.create(res.locals.body);
    res.status(201).location(`/api/products/${product.id}`).json(product);
  };

  const update: RequestHandler = async (_req, res) => {
    const product = await service.update(res.locals.params.id, res.locals.body);
    res.json(product);
  };

  const remove: RequestHandler = async (_req, res) => {
    await service.remove(res.locals.params.id);
    res.status(204).end();
  };

  return { list, getById, create, update, remove };
}
```

### Router composition

```ts
// products.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../shared/validation/validate.js';
import { createProductController } from './products.controller.js';
import { createProductSchema, productIdSchema, updateProductSchema } from './products.schema.js';
import type { createProductService } from './products.service.js';

export function createProductsRouter(service: ReturnType<typeof createProductService>): Router {
  const router = Router();
  const controller = createProductController(service);
  const paramsSchema = z.object({ id: productIdSchema });

  router.get('/', controller.list);
  router.get('/:id', validate('params', paramsSchema), controller.getById);
  router.post('/', validate('body', createProductSchema), controller.create);
  router.patch(
    '/:id',
    validate('params', paramsSchema),
    validate('body', updateProductSchema),
    controller.update,
  );
  router.delete('/:id', validate('params', paramsSchema), controller.remove);

  return router;
}
```

### Composition root

Construct concrete dependencies in one place.

```ts
// app.ts
import express from 'express';
import { errorHandler } from './shared/middleware/error-handler.js';
import { InMemoryProductRepository } from './products/products.repository.js';
import { createProductService } from './products/products.service.js';
import { createProductsRouter } from './products/products.routes.js';

export const app = express();

const repository = new InMemoryProductRepository();
const service = createProductService(repository);

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use('/api/products', createProductsRouter(service));

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' },
  });
});

app.use(errorHandler);
```

This is dependency injection without requiring a dependency-injection framework. Construction is centralized, dependencies are visible, and tests can supply fakes.

---
