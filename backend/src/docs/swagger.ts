import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NewsPulse AI API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API for NewsPulse AI mobile news app with personalization, behavior tracking, Mediastack integration, and AIMLADS ad server.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        AnonymousHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-anonymous-id',
          description: 'Guest Device / Session Identifier'
        }
      },
      schemas: {
        StandardSuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        },
        StandardErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        },
        NewsArticle: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65d123456789abcdef012345' },
            externalId: { type: 'string', example: 'ms_a1b2c3d4e5f67890' },
            title: { type: 'string', example: 'India Unveils State-of-the-Art AI Computing Infrastructure' },
            shortSummary: { type: 'string', example: 'Ministry of Electronics announces 10,000+ GPU supercomputing cluster.' },
            description: { type: 'string' },
            content: { type: 'string' },
            sourceName: { type: 'string', example: 'TechPulse India' },
            articleUrl: { type: 'string', example: 'https://example.com/tech/ai' },
            imageUrl: { type: 'string', example: 'https://images.unsplash.com/photo-1618005182384' },
            category: { type: 'string', example: 'technology' },
            tags: { type: 'array', items: { type: 'string' } },
            publishedAt: { type: 'string', format: 'date-time' },
            provider: { type: 'string', example: 'mediastack' }
          }
        }
      }
    },
    security: [{ BearerAuth: [] }, { AnonymousHeader: [] }],
    paths: {
      '/api/v1/health': {
        get: {
          summary: 'System Health Check',
          description: 'Returns status for API, MongoDB, Redis, and Mediastack configuration without exposing secrets.',
          tags: ['Health'],
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'NewsPulse API is healthy' },
                      data: {
                        type: 'object',
                        properties: {
                          status: { type: 'string', example: 'healthy' },
                          timestamp: { type: 'string', format: 'date-time' },
                          service: { type: 'string', example: 'newspulse-backend' },
                          database: { type: 'string', example: 'connected' },
                          mediastackConfigured: { type: 'boolean', example: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/news': {
        get: {
          summary: 'Get Latest News Articles',
          description: 'Retrieves a paginated list of latest short news articles. Supports category, country, language, and keyword filters.',
          tags: ['News'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              required: false,
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of articles per page',
              required: false,
              schema: { type: 'integer', default: 20 }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Category filter (sports, technology, cricket, business, ai, india, etc.)',
              required: false,
              schema: { type: 'string', example: 'sports' }
            },
            {
              name: 'country',
              in: 'query',
              description: 'Country code (default: in)',
              required: false,
              schema: { type: 'string', default: 'in' }
            },
            {
              name: 'language',
              in: 'query',
              description: 'Language code (default: en)',
              required: false,
              schema: { type: 'string', default: 'en' }
            },
            {
              name: 'keywords',
              in: 'query',
              description: 'Search keywords',
              required: false,
              schema: { type: 'string', example: 'cricket' }
            }
          ],
          responses: {
            '200': {
              description: 'List of articles retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'News retrieved' },
                      data: {
                        type: 'object',
                        properties: {
                          articles: { type: 'array', items: { $ref: '#/components/schemas/NewsArticle' } },
                          total: { type: 'integer', example: 100 }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request / Invalid parameters' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/v1/news/test/mediastack': {
        get: {
          summary: 'Test Mediastack Provider Connection',
          description: 'Executes a single controlled test request to Mediastack API and returns normalized sample output.',
          tags: ['News'],
          responses: {
            '200': {
              description: 'Controlled Mediastack test request executed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Mediastack test request executed successfully' },
                      data: {
                        type: 'object',
                        properties: {
                          configured: { type: 'boolean', example: true },
                          count: { type: 'integer', example: 5 },
                          articles: { type: 'array', items: { $ref: '#/components/schemas/NewsArticle' } }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'MEDIASTACK_API_KEY is not configured in environment variables' },
            '503': { description: 'News provider temporarily unavailable' }
          }
        }
      },
      '/api/v1/news/category/{category}': {
        get: {
          summary: 'Get News Articles by Category',
          description: 'Retrieves articles filtered by specific category.',
          tags: ['News'],
          parameters: [
            {
              name: 'category',
              in: 'path',
              required: true,
              description: 'Category slug',
              schema: { type: 'string', example: 'sports' }
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 20 }
            }
          ],
          responses: {
            '200': { description: 'Articles for category retrieved successfully' },
            '400': { description: 'Invalid category' },
            '500': { description: 'Server error' }
          }
        }
      },
      '/api/v1/news/search': {
        get: {
          summary: 'Search News Articles',
          description: 'Searches news articles by keyword, title, or topic query.',
          tags: ['News'],
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: false,
              schema: { type: 'string', example: 'cricket' }
            },
            {
              name: 'keywords',
              in: 'query',
              required: false,
              schema: { type: 'string', example: 'cricket' }
            }
          ],
          responses: {
            '200': { description: 'Search results returned' }
          }
        }
      },
      '/api/v1/news/{id}': {
        get: {
          summary: 'Get Article by ID',
          description: 'Retrieves complete details for a specific short news article by ID.',
          tags: ['News'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '65d123456789abcdef012345' }
            }
          ],
          responses: {
            '200': { description: 'Article retrieved' },
            '404': { description: 'Article not found' }
          }
        }
      },
      '/api/v1/news/trending': {
        get: {
          summary: 'Get Top Trending News',
          tags: ['News'],
          responses: {
            '200': { description: 'Trending articles retrieved' }
          }
        }
      },
      '/api/v1/news/latest': {
        get: {
          summary: 'Get Latest News Stories',
          tags: ['News'],
          responses: {
            '200': { description: 'Latest articles retrieved' }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../app.ts'),
    path.join(__dirname, '../app.js')
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
