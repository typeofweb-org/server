import { array, boolean, number, object, oneOf, string } from '@typeofweb/schema';

import { routeConfigToOpenApiPathsDefinitions } from '../src/modules/openapi';

describe('routeConfigToOpenApi', () => {
  it('should work', async () => {
    await routeConfigToOpenApiPathsDefinitions({
      path: '/users/:userId/invoices',
      method: 'post',
      validation: {
        params: {
          userId: string(),
        },
        payload: object({
          id: string(),
          item: object({
            price: number(),
          })(),
        })(),
        query: {
          isFun: boolean(),
          search: string(),
          category: oneOf(['html', 'css'])(),
        },
        response: array(
          object({
            id: string(),
            total: number(),
          })(),
        )(),
      },
    });
  });
});
