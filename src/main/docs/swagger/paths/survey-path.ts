export const surveyPath = {
  get: {
    security: [{
      apiKeyAuth: [],
      apiKeyAuthExample: []
    }],
    tags: ['Enquete'],
    summary: 'API para listar todas as enquetes',
    responses: {
      200: {
        description: 'Sucesso',
        content: {
          'application/json': {
            schema: {
              $ref: '#/schemas/surveys'
            }
          }
        }
      },
      404: {
        $ref: '#/components/notFound'
      },
      403: {
        $ref: '#/components/forbidden'
      },
      500: {
        $ref: '#/components/internalServer'
      }
    }
  }
}
