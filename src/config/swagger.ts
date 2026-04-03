// ─────────────────────────────────────────────────────────
// OpenAPI / Swagger Specification — Static Definition
// ─────────────────────────────────────────────────────────
// Defined as a plain object (not file-scanned) so it works
// on Vercel serverless where .ts source files are not
// available at runtime for swagger-jsdoc to glob-scan.
// ─────────────────────────────────────────────────────────

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Finance Dashboard API',
    version: '1.0.0',
    description:
      'A comprehensive Finance Data Processing and Access Control Backend API. ' +
      'Features JWT authentication, role-based access control (VIEWER / ANALYST / ADMIN), ' +
      'financial record CRUD with filtering & pagination, dashboard analytics, and soft-delete support.',
    contact: {
      name: 'API Support',
      email: 'support@financedashboard.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://backend-assignment-tau.vercel.app',
      description: 'Production server (Vercel) — use this',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server (local only)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from the /api/auth/login endpoint',
      },
    },
    schemas: {
      FinancialRecord: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number', example: 5000.5 },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string', example: 'Salary' },
          description: { type: 'string', example: 'Monthly salary' },
          transactionDate: { type: 'string', format: 'date-time' },
          isDeleted: { type: 'boolean', default: false },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              statusCode: { type: 'integer' },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication & registration' },
    { name: 'Users', description: 'User management (Admin only)' },
    { name: 'Financial Records', description: 'CRUD operations for financial records' },
    { name: 'Dashboard', description: 'Analytics and summary endpoints' },
  ],
  paths: {
    // ─── Auth ───────────────────────────────────────────────
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'viewer@example.com' },
                  password: { type: 'string', minLength: 8, example: 'password123' },
                  name: { type: 'string', example: 'John Viewer' },
                  role: {
                    type: 'string',
                    enum: ['VIEWER', 'ANALYST', 'ADMIN'],
                    default: 'VIEWER',
                    example: 'VIEWER',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            name: { type: 'string' },
                            role: { type: 'string' },
                          },
                        },
                        token: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '409': { description: 'User already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login with email and password',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@example.com' },
                  password: { type: 'string', example: 'admin123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Profile retrieved successfully' },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    // ─── Users ──────────────────────────────────────────────
    '/api/users': {
      get: {
        summary: 'Get all users (Admin only)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of all users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          email: { type: 'string' },
                          name: { type: 'string' },
                          role: { type: 'string' },
                          isActive: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '403': { description: 'Forbidden – Admin access required' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get a user by ID (Admin only)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID (UUID)' },
        ],
        responses: {
          '200': { description: 'User details' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/users/{id}/status': {
      patch: {
        summary: 'Activate or deactivate a user (Admin only)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isActive'],
                properties: {
                  isActive: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User status updated' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/users/{id}/role': {
      patch: {
        summary: "Update a user's role (Admin only)",
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'], example: 'ANALYST' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User role updated' },
          '404': { description: 'User not found' },
        },
      },
    },

    // ─── Financial Records ───────────────────────────────────
    '/api/records': {
      post: {
        summary: 'Create a new financial record',
        tags: ['Financial Records'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'type', 'category', 'transactionDate'],
                properties: {
                  amount: { type: 'number', example: 5000.5 },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'INCOME' },
                  category: { type: 'string', example: 'Salary' },
                  description: { type: 'string', example: 'Monthly salary payment' },
                  transactionDate: { type: 'string', format: 'date', example: '2025-01-15' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Record created successfully' },
          '400': { description: 'Validation error' },
        },
      },
      get: {
        summary: 'List financial records with filtering & pagination',
        description:
          'VIEWER sees only own records. ANALYST and ADMIN see all records. ' +
          'Supports filtering by date range, category, and type. Paginated results.',
        tags: ['Financial Records'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10, maximum: 100 }, description: 'Records per page' },
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] }, description: 'Filter by type' },
          { in: 'query', name: 'category', schema: { type: 'string' }, description: 'Filter by category (exact)' },
          { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by description or category' },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' }, description: 'Start of date range (YYYY-MM-DD)' },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' }, description: 'End of date range (YYYY-MM-DD)' },
          { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['transactionDate', 'amount', 'createdAt'], default: 'transactionDate' } },
          { in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of financial records',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/FinancialRecord' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/records/{id}': {
      get: {
        summary: 'Get a financial record by ID',
        tags: ['Financial Records'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Financial record details' },
          '404': { description: 'Record not found' },
        },
      },
      put: {
        summary: 'Update a financial record',
        description: 'Only the record owner or ADMIN can update.',
        tags: ['Financial Records'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  transactionDate: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Record updated successfully' },
          '403': { description: 'Forbidden – not the owner' },
          '404': { description: 'Record not found' },
        },
      },
      delete: {
        summary: 'Soft-delete a financial record',
        description: 'Only the record owner or ADMIN can delete. Record is soft-deleted (isDeleted = true).',
        tags: ['Financial Records'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Record deleted successfully' },
          '403': { description: 'Forbidden – not the owner' },
          '404': { description: 'Record not found' },
        },
      },
    },

    // ─── Dashboard ───────────────────────────────────────────
    '/api/dashboard/summary': {
      get: {
        summary: 'Get dashboard summary with analytics',
        description:
          'Returns total income, total expense, net balance, category-wise breakdown, ' +
          'recent 5 transactions, and monthly trends for the last 12 months. ' +
          'VIEWER: sees only own data. ANALYST & ADMIN: sees all data.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Dashboard summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        overview: {
                          type: 'object',
                          properties: {
                            totalIncome: { type: 'number', example: 150000 },
                            totalExpense: { type: 'number', example: 85000 },
                            netBalance: { type: 'number', example: 65000 },
                            totalRecords: { type: 'integer', example: 42 },
                          },
                        },
                        categoryBreakdown: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              category: { type: 'string' },
                              type: { type: 'string' },
                              total: { type: 'number' },
                              count: { type: 'integer' },
                            },
                          },
                        },
                        recentTransactions: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/FinancialRecord' },
                        },
                        monthlyTrends: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              month: { type: 'string', example: '2025-01' },
                              income: { type: 'number' },
                              expense: { type: 'number' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
  },
};
