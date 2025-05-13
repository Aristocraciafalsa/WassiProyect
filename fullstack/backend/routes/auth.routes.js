import express from 'express';
import { registerUser, loginCliente, loginAdminOperario, getClientData } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/login-cliente:
 * post:
 * summary: Login as a client
 * description: Authenticates a client and returns a JWT token.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * format: email
 * description: Client's email address.
 * password:
 * type: string
 * description: Client's password.
 * responses:
 * 200:
 * description: Authentication successful. Returns a JWT token.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token:
 * type: string
 * description: JWT access token.
 * expiresIn:
 * type: number
 * description: Expiration time of the token in seconds.
 * 400:
 * description: Invalid credentials.
 * 500:
 * description: Internal server error.
 */
router.post('/login-cliente', loginCliente);

/**
 * @openapi
 * /api/auth/login-admin-operario:
 * post:
 * summary: Login as an admin or operator
 * description: Authenticates an admin or operator and returns a JWT token.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * format: email
 * description: Admin/Operator email address.
 * password:
 * type: string
 * description: Admin/Operator password.
 * responses:
 * 200:
 * description: Authentication successful. Returns a JWT token.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token:
 * type: string
 * description: JWT access token.
 * expiresIn:
 * type: number
 * description: Expiration time of the token in seconds.
 * 400:
 * description: Invalid credentials.
 * 403:
 * description: Unauthorized access.
 * 500:
 * description: Internal server error.
 */
router.post('/login-admin-operario', loginAdminOperario);

/**
 * @openapi
 * /api/auth/register:
 * post:
 * summary: Register a new user
 * description: Registers a new client user.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserInput'
 * responses:
 * 201:
 * description: User registration successful.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: "User created successfully"
 * userId:
 * type: string
 * description: The ID of the newly registered user.
 * 400:
 * description: Invalid input.
 * 409:
 * description: Email already taken.
 * 500:
 * description: Internal server error.
 */
router.post('/register', registerUser);

/**
 * @openapi
 * /api/auth/client-data:
 * get:
 * summary: Get client data
 * description: Retrieves client data using the JWT token.
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Client data retrieved successfully.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * 401:
 * description: Unauthorized.
 * 500:
 * description: Internal server error.
 */
router.get('/client-data', getClientData);

/**
 * @openapi
 * components:
 * schemas:
 * User:
 * type: object
 * properties:
 * id:
 * type: string
 * description: The user ID.
 * name:
 * type: string
 * description: The name of the user.
 * email:
 * type: string
 * format: email
 * description: The email address of the user.
 * role:
 * type: string
 * description: The role of the user (e.g., client, admin).
  * createdAt:
 * type: string
 * format: date-time
 * description: The date the user was created.
 * updatedAt:
 * type: string
 * format: date-time
 * description: The date the user was last updated.
 * UserInput:
 * type: object
 * required:
 * - name
 * - email
 * - password
 * properties:
 * name:
 * type: string
 * description: The name of the user.
 * email:
 * type: string
 * format: email
 * description: The email address of the user.
 * password:
 * type: string
 * description: The password for the user.
 */
export default router;
