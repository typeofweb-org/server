import { array, boolean, number, object, oneOf, string } from '@typeofweb/schema';

import { getOpenApiForRoutes, routeConfigToOpenApiPathsDefinitions } from '../src/modules/openapi';

describe('open api generator', () => {
  it('routeConfigToOpenApiPathsDefinitions should generate single schema', async () => {
    const openapi = await routeConfigToOpenApiPathsDefinitions({
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

    expect(openapi).toMatchSnapshot();
  });

  it('getOpenApiForRoutes should generate schema for whole app', async () => {
    const routes = [
      {
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
      },
      {
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
      },
    ] as const;

    const openapi = await getOpenApiForRoutes(routes, {
      title: 'Swagger',
      description: 'This is Swagger',
      version: '1.1.1',
    });

    expect(openapi).toMatchSnapshot();
  });
});
