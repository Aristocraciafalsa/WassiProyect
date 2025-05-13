import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/ProductController.js';

const router = express.Router();

/**
 * @openapi
 * /api/products:
 * get:
 * summary: Get all products
 * description: Retrieve a list of all products.
 * responses:
 * 200:
 * description: A list of products.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Product'
 * 500:
 * description: Internal server error.
 */
router.get("/", getProducts);

/**
 * @openapi
 * /api/products/{id}:
 * get:
 * summary: Get a single product by ID
 * description: Retrieve a single product by its ID.
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: ID of the product to retrieve.
 * schema:
 * type: string
 * responses:
 * 200:
 * description: The product object.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Product'
 * 404:
 * description: Product not found.
 * 500:
 * description: Internal server error.
 */
router.get("/:id", getProduct);

/**
 * @openapi
 * /api/products/{id}:
 * put:
 * summary: Update a product by ID
 * description: Update a product's information by its ID.
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: ID of the product to update.
 * schema:
 * type: string
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ProductInput'
 * responses:
 * 200:
 * description: The updated product object.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Product'
 * 400:
 * description: Invalid input.
 * 404:
 * description: Product not found.
 * 500:
 * description: Internal server error.
 */
router.put("/:id", updateProduct);

/**
 * @openapi
 * /api/products:
 * post:
 * summary: Create a new product
 * description: Create a new product.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ProductInput'
 * responses:
 * 201:
 * description: The created product object.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Product'
 * 400:
 * description: Invalid input.
 * 500:
 * description: Internal server error.
 */
router.post("/", createProduct);

/**
 * @openapi
 * /api/products/{id}:
 * delete:
 * summary: Delete a product by ID
 * description: Delete a product by its ID.
 * parameters:
 * - in: path
 * name: id
 * required: true
 * description: ID of the product to delete.
 * schema:
 * type: string
 * responses:
 * 204:
 * description: Product deleted successfully.
 * 404:
 * description: Product not found.
 * 500:
 * description: Internal server error.
 */
router.delete("/:id", deleteProduct);

/**
 * @openapi
 * components:
 * schemas:
 * Product:
 * type: object
 * properties:
 * id:
 * type: string
 * description: The product ID.
 * name:
 * type: string
 * description: The name of the product.
 * description:
 * type: string
 * description: A description of the product.
 * price:
 * type: number
 * format: float
 * description: The price of the product.
 * createdAt:
 * type: string
 * format: date-time
 * description: The date the product was created.
 * updatedAt:
 * type: string
 * format: date-time
 * description: The date the product was last updated.
 * ProductInput:
 * type: object
 * required:
 * - name
 * - description
 * - price
 * properties:
 * name:
 * type: string
 * description: The name of the product.
 * description:
 * type: string
 * description: A description of the product.
 * price:
 * type: number
 * format: float
 * description: The price of the product.
 */
export default router;