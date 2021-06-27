import { isSchema, object } from '@typeofweb/schema';
import Prettier from 'prettier';
import { getTypeScriptReader, getOpenApiWriter, makeConverter } from 'typeconv';

import type { TypeOfWebRoute } from './shared';
import type { SomeSchema } from '@typeofweb/schema';
import type { OpenAPIV2 } from 'openapi-types';

type RouteSubset = Pick<TypeOfWebRoute, 'method' | 'path' | 'validation'>;

const capitelizeFirst = <Word extends string>(word: Word) =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Capitalize first letter
  (word.slice(0, 1).toUpperCase() + word.slice(1)) as Capitalize<Word>;

const pathToIdentifier = (path: string): string => {
  return capitelizeFirst(
    path
      .replace(/[\/\-](\w?)/g, (_, l: string) => l.toUpperCase())
      .replace(/:(\w?)/g, (_, l: string) => 'By' + l.toUpperCase()),
  );
};

const routeToIdentifier = (route: RouteSubset) => {
  return capitelizeFirst(route.method) + pathToIdentifier(route.path);
};

export const routeConfigToOpenApi = async (route: RouteSubset) => {
  const identifier = routeToIdentifier(route);
  const definitions = (await getOpenApiResultForRoute(identifier, route)).components.schemas;
  const paths = getOpenApiPathForRoute(identifier, route, definitions);

  const swaggerJson: OpenAPIV2.Document = {
    swagger: '2.0',
    info: {
      title: 'Test',
      description: 'Description',
      version: '1.0',
    },
    definitions,
    paths,
  };
  console.log(JSON.stringify(swaggerJson));
};

export const getOpenApiPathForRoute = (
  identifier: string,
  route: RouteSubset,
  definitions: OpenAPIV2.DefinitionsObject,
): OpenAPIV2.PathsObject => {
  const operation: OpenAPIV2.OperationObject = {
    operationId: 'a',
    parameters: [
      ...(route.validation.params
        ? Object.keys(route.validation.params)
            .map((paramName): OpenAPIV2.GeneralParameterObject | undefined => {
              const paramSchema = definitions[schemaToName(identifier, 'params')];
              const type = paramSchema?.properties?.[paramName]?.type;
              if (Array.isArray(type)) {
                // @todo
                return;
              }

              return {
                name: paramName,
                in: 'path',
                required: paramSchema?.required?.includes(paramName) ?? true,
                type: type ?? 'string',
              };
            })
            .filter((x): x is OpenAPIV2.GeneralParameterObject => typeof x !== 'undefined')
        : []),
    ],
    responses: {
      default: route.validation.response
        ? {
            description: schemaToName(identifier, 'response'),
            schema: { $ref: `#/definitions/${schemaToName(identifier, 'response')}` },
          }
        : {
            description: 'Unknown response',
          },
    },
  };
  const pathItemObject: OpenAPIV2.PathItemObject = {
    [route.method]: operation,
  };
  const pathsObject: OpenAPIV2.PathsObject = {
    [expressRoutePathToSwaggerPath(route.path)]: pathItemObject,
  };
  return pathsObject;
};

export const getOpenApiResultForRoute = async (
  identifier: string,
  route: RouteSubset,
): Promise<{ readonly components: { readonly schemas: OpenAPIV2.DefinitionsObject } }> => {
  const data = typesForRoute(route, identifier);

  const reader = getTypeScriptReader({
    nonExported: 'include',
    unsupported: 'warn',
  });
  const writer = getOpenApiWriter({ format: 'json', title: 'My API', version: 'v1', schemaVersion: '2.0' });
  const converter = makeConverter(reader, writer);

  return JSON.parse((await converter.convert({ data })).data);
};

const schemaToName = (identifier: string, kind: keyof RouteSubset['validation']) => {
  const suffix = capitelizeFirst(kind);
  return `${identifier}${suffix}`;
};

const typesForRoute = (route: RouteSubset, identifier: string): string => {
  const typeScriptCode = Object.entries(route.validation).reduce((acc, [kind, maybeSchema]) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- it's true
    const name = schemaToName(identifier, kind as keyof RouteSubset['validation']);
    const schema: SomeSchema<any> = isSchema(maybeSchema) ? maybeSchema : object(maybeSchema)();
    return acc + '\n' + `export type ${name} = ${schema.toString()};\n`;
  }, '');
  return Prettier.format(typeScriptCode, { parser: 'typescript' });
};

const expressRoutePathToSwaggerPath = (expressPath: string): string => {
  return expressPath.replace(/:(\w+)/g, '{$1}');
};
