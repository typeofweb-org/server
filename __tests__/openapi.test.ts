import { array, number, object, string } from '@typeofweb/schema';

import { routeConfigToOpenApi } from '../src/modules/openapi';

describe('routeConfigToOpenApi', () => {
  it('should work', async () => {
    await routeConfigToOpenApi({
      path: '/users/:userId/invoices',
      method: 'get',
      validation: {
        params: {
          userId: string(),
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
