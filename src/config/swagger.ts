import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
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
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter your JWT token obtained from the /api/auth/login endpoint',
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
            transactionDate: {
              type: 'string',
              format: 'date-time',
            },
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
      {
        name: 'Financial Records',
        description: 'CRUD operations for financial records',
      },
      {
        name: 'Dashboard',
        description: 'Analytics and summary endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js', './routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
