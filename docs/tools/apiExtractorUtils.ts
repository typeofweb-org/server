import {
  ApiItem,
  ApiModel,
  ApiParameterListMixin,
  ApiDocumentedItem,
  ApiPackage,
  ApiPropertyItem,
  Excerpt,
  ApiMethod,
  ApiReturnTypeMixin,
  ApiReleaseTagMixin,
  ReleaseTag,
  ApiDeclaredItem,
} from '@microsoft/api-extractor-model';
import * as h from './html';
import { toMarkdownString, toHtmlString } from './stringify';

import Fs from 'fs/promises';
import { readFileSync } from 'fs';

import Prettier from 'prettier';

import {
  root,
  paragraph,
  text,
  heading,
  list,
  listItem,
  brk,
  rootWithTitle,
  Children,
  link,
  code,
  inlineCode,
  table,
  tableRow,
  tableCell,
  html,
  strong,
  emphasis,
} from 'mdast-builder';
import { Node, Parent, Literal } from 'unist';

import Path from 'path';

import { ApiItemKind, Context } from './types';
import { getTSBlock, getTSBlockInHtml, isEmptyOrWhitespace, printTsDoc } from './tsdoc';
import { rimraf, getFilePath, getHashLink, referenceToLink, getFileUrl } from './files';
import { StandardTags } from '@microsoft/tsdoc';

const prettierrc = JSON.parse(readFileSync(Path.join(process.cwd(), '..', '.prettierrc'), 'utf-8'));

type GroupName = keyof typeof GROUPS;
const GROUPS = {
  Types: [ApiItemKind.Interface, ApiItemKind.TypeAlias],
  Enums: [ApiItemKind.Enum],
  Functions: [ApiItemKind.Function],
  Classes: [ApiItemKind.Class],
  Other: [],
} as const;

const API_ITEM_KIND_TO_GROUP = (Object.entries(GROUPS) as Array<[GroupName, readonly ApiItemKind[]]>).reduce<
  Partial<Record<ApiItemKind, GroupName>>
>((acc, [group, kinds]) => {
  kinds.forEach((kind) => (acc[kind] = group));
  return acc;
}, {});

async function run() {
  const apiModel = new ApiModel();
  const apiContainer = apiModel.loadPackage(Path.join('server.api.json'));

  await rimraf();
  return printIndexPage(apiModel, apiContainer);
}

async function save(apiItem: ApiItem, content: Parent) {
  const filePath = getFilePath(apiItem);
  const markdown = toMarkdownString(content);
  await Fs.writeFile(filePath, Prettier.format(markdown, { ...prettierrc, parser: 'markdown' }));
}

async function printIndexPage(apiModel: ApiModel, apiItem: ApiPackage) {
  const main = apiItem.kind === 'Package' ? apiItem.entryPoints[0] : apiItem;

  const apiMembers = main.members;

  const typesToPrint = apiMembers.filter((m) => API_ITEM_KIND_TO_GROUP[m.kind] === 'Types');
  const functionsToPrint = apiMembers.filter((m) => API_ITEM_KIND_TO_GROUP[m.kind] === 'Functions');
  const enumsToPrint = apiMembers.filter((m) => API_ITEM_KIND_TO_GROUP[m.kind] === 'Enums');
  const classesToPrint = apiMembers.filter((m) => API_ITEM_KIND_TO_GROUP[m.kind] === 'Classes');
  const otherToPrint = apiMembers.filter((m) => API_ITEM_KIND_TO_GROUP[m.kind] === 'Other');

  const indexPage = root([
    heading(1, text(`${apiItem.displayName} reference`)),
    ...printIndexMembersSummary({ apiModel, apiItem }, 'Types', typesToPrint),
    ...printIndexMembersSummary({ apiModel, apiItem }, 'Functions', functionsToPrint),
    ...printIndexMembersSummary({ apiModel, apiItem }, 'Enums', enumsToPrint),
    ...printIndexMembersSummary({ apiModel, apiItem }, 'Classes', classesToPrint),
    ...printIndexMembersSummary({ apiModel, apiItem }, 'Other', otherToPrint),
  ]);

  await save(main, indexPage);

  await Promise.all(typesToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))));
  await Promise.all(functionsToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))));
  await Promise.all(enumsToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))));
  await Promise.all(classesToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))));
  await Promise.all(otherToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))));
}

async function printTypePage({ apiItem, apiModel }: Context) {
  const fileDestination = apiItem instanceof ApiDeclaredItem ? await findReferenceTo(apiItem.excerpt.text) : null;

  const summary =
    apiItem instanceof ApiDocumentedItem && apiItem.tsdocComment
      ? [printTsDoc({ apiModel, apiItem }, apiItem.tsdocComment.summarySection)].flat()
      : [];

  const examples = getTSBlock(
    { apiModel, apiItem },
    { tagName: 'example', apiItem, getTitle: (block, idx) => heading(3, text(`Example ${idx + 1}`)) },
  );

  const tbody = apiItem.members.map((m) => {
    const type =
      m instanceof ApiPropertyItem
        ? excerptToCodeBlock({ apiItem: m, apiModel }, m.propertyTypeExcerpt)
        : ApiParameterListMixin.isBaseClassOf(m)
        ? h.code(getFunctionSignature({ apiItem, apiModel }, m, { includeParamTypes: true, includeReturnType: true }))
        : '';

    const description =
      m instanceof ApiDocumentedItem && m.tsdocComment
        ? toHtmlString(root(printTsDoc({ apiModel: apiModel, apiItem: m }, m.tsdocComment.summarySection)))
        : '';

    const memberExamples = getTSBlockInHtml(
      { apiModel, apiItem },
      { tagName: 'example', apiItem: m, getTitle: (block, idx) => strong(text(`Example ${idx + 1}`)) },
    );

    const memberDefaultValues = getTSBlockInHtml(
      { apiModel, apiItem },
      { tagName: 'defaultValue', apiItem: m, getTitle: (block, idx) => strong(text('default: ')) },
    );

    const releaseTag = ApiReleaseTagMixin.isBaseClassOf(m) ? [h.strong(ReleaseTag[m.releaseTag])] : [];

    return h.tr([
      h.td([
        h.anchor(getHashLink(m)),
        h.code(
          getDisplayName({ apiItem: m, apiModel }, m, {
            includeParams: false,
            includeParamTypes: false,
            includeReturnType: false,
            includeReleaseTag: false,
          }),
        ),
      ]),
      h.td(type),
      h.td([
        description.length > 0 && h.div(description),
        memberExamples.length > 0 && h.div(memberExamples),
        releaseTag.length > 0 && h.div(releaseTag),
        memberDefaultValues.length > 0 && h.div(memberDefaultValues),
      ]),
    ]);
  });

  return root([
    frontmatter(apiItem, fileDestination),
    heading(
      1,
      text(
        getDisplayName({ apiItem, apiModel }, apiItem, {
          includeParams: true,
          includeParamTypes: false,
          includeReturnType: false,
          includeReleaseTag: false,
        }),
      ),
    ),
    ...(!isEmptyOrWhitespace(summary) ? [heading(2, text('Summary')), paragraph(summary)] : []),
    ...(tbody.length > 0
      ? [
          heading(2, text('Signatures')),
          html(h.table([h.thead(h.tr([h.td('Property'), h.td('Type'), h.td('Description')])), h.tbody(tbody)])),
        ]
      : []),
    ...(!isEmptyOrWhitespace(examples) ? [heading(2, text('Examples')), ...examples] : []),
  ]);
}

function excerptToCodeBlock(context: Context, excerpt: Excerpt): string {
  return h.code(excerptToHtml(context, excerpt));
}

function excerptToHtml(context: Context, excerpt: Excerpt): string {
  return h.toString(
    excerpt.spannedTokens.map((token) => {
      if (token.canonicalReference) {
        const result = referenceToLink(context, token.canonicalReference);
        return result ? h.a(result.url, result.linkText) : h.getHtmlEscapedText(token.text);
      } else {
        return h.getHtmlEscapedText(token.text);
      }
    }),
  );
}

function printIndexMembersSummary(context: Context, title: string, members: readonly ApiItem[]): Node[] {
  if (members.length === 0) {
    return [];
  }

  return [
    heading(2, text(title)),
    table(
      [],
      [
        tableRow([tableCell(text('Name')), tableCell(text('Summary'))]),
        ...members.map((m) => {
          const displayName = getDisplayName({ apiItem: m, apiModel: context.apiModel }, m, {
            includeParams: true,
            includeParamTypes: false,
            includeReturnType: false,
            includeReleaseTag: false,
          });

          const summary =
            m instanceof ApiDocumentedItem && m.tsdocComment
              ? [printTsDoc({ apiModel: context.apiModel, apiItem: m }, m.tsdocComment.summarySection)].flat()
              : [];

          const releaseTag = ApiReleaseTagMixin.isBaseClassOf(m) ? [strong(text(ReleaseTag[m.releaseTag]))] : [];

          return tableRow([
            tableCell(link(getFileUrl(m), '', inlineCode(displayName))),
            tableCell([...summary, ...releaseTag]),
          ]);
        }),
      ],
    ),
  ];
}

const getDisplayName = (
  context: Context,
  apiItem: ApiItem,
  {
    includeParams,
    includeParamTypes,
    includeReturnType,
    includeReleaseTag,
  }: { includeParams: boolean; includeParamTypes: boolean; includeReturnType: boolean; includeReleaseTag: boolean },
) => {
  const releaseTag =
    includeReleaseTag && ApiReleaseTagMixin.isBaseClassOf(apiItem) ? ` (${ReleaseTag[apiItem.releaseTag]})` : '';

  const functionSignature =
    includeParams && ApiParameterListMixin.isBaseClassOf(apiItem)
      ? getFunctionSignature(context, apiItem, { includeParamTypes, includeReturnType })
      : '';

  return apiItem.displayName + functionSignature + releaseTag;
};

const getFunctionSignature = (
  context: Context,
  apiItem: ApiParameterListMixin,
  { includeParamTypes, includeReturnType }: { includeParamTypes: boolean; includeReturnType: boolean },
) => {
  const paramsSignature = getFunctionParamsSignature(context, apiItem, { includeParamTypes });
  if (includeReturnType && ApiReturnTypeMixin.isBaseClassOf(apiItem)) {
    const returnType = excerptToHtml({ apiItem, apiModel: context.apiModel }, apiItem.returnTypeExcerpt);
    return `${paramsSignature} => ${returnType}`;
  } else {
    return paramsSignature;
  }
};

const getFunctionParamsSignature = (
  context: Context,
  apiItem: ApiParameterListMixin,
  { includeParamTypes }: { includeParamTypes: boolean },
) => {
  if (!includeParamTypes) {
    return '(' + apiItem.parameters.map((x) => x.name).join(', ') + ')';
  } else {
    return (
      '(' +
      apiItem.parameters
        .map((x) => `${x.name}: ${excerptToHtml({ apiItem, apiModel: context.apiModel }, x.parameterTypeExcerpt)}`)
        .join(', ') +
      ')'
    );
  }
};

function frontmatter(
  context: Context,
  apiItem: ApiItem,
  fileDestination: {
    path: string;
    line: number;
  } | null,
): Literal {
  const value = Object.entries({
    releaseTag: ApiReleaseTagMixin.isBaseClassOf(apiItem) ? ReleaseTag[apiItem.releaseTag] : null,
    ...(fileDestination && { fileDestination: `${fileDestination.path.replace(/^\//, '')}#L${fileDestination.line}` }),
    title: getDisplayName(context, apiItem, {
      includeParamTypes: false,
      includeParams: true,
      includeReleaseTag: true,
      includeReturnType: false,
    }),
  })
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');
  return { type: 'yaml', value };
}

run();

async function findReferenceTo(excerpt: string) {
  // api-extractor emits _some_ types as `export declare `
  excerpt = excerpt.replace('export declare ', 'export ');

  // remove semicolon from functions without body
  excerpt = excerpt.endsWith(';') ? excerpt.slice(0, -1) : excerpt;

  // try formatting excerpt with prettier by adding an empty block to it
  try {
    excerpt = Prettier.format(excerpt + '{}', { ...prettierrc, parser: 'typescript' });
  } catch {
    excerpt = Prettier.format(excerpt, { ...prettierrc, parser: 'typescript' });
  }

  // get first line
  [excerpt] = excerpt.split('\n');
  excerpt = excerpt.trim();

  // remove empty block added a few lines above
  excerpt = excerpt.endsWith('{}') ? excerpt.slice(0, -2).trim() : excerpt;

  // api-extractor incorrently emits empty return type as as `: {`
  excerpt = excerpt.endsWith(': {') ? excerpt.slice(0, -3).trim() : excerpt;

  const basePath = Path.join(process.cwd(), '..');
  const match = await searchInDir(excerpt, Path.join(basePath, 'src'));
  if (match) {
    return {
      ...match,
      path: match.path.replace(basePath, ''),
    };
  }
  return null;
}

async function searchInDir(excerpt: string, path = ''): Promise<{ line: number; path: string } | null> {
  const directory = await Fs.opendir(path);

  for await (const dirent of directory) {
    const currentPath = Path.join(path, dirent.name);

    if (dirent.isFile()) {
      const file = await Fs.readFile(currentPath, 'utf-8');
      const index = Prettier.format(file, { ...prettierrc, parser: 'typescript' })
        .split('\n')
        .findIndex((line) => line.includes(excerpt));
      if (index > -1) {
        return { line: index + 1, path: currentPath };
      }
    } else if (dirent.isDirectory()) {
      const match = await searchInDir(excerpt, currentPath);
      if (match) {
        return match;
      }
    }
  }
  return null;
}
