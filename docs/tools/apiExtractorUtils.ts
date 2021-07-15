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

import { ApiItemKind, Context, FrontmatterMeta } from './types';
import { findReferenceTo, getTSBlock, getTSBlockInHtml, isEmptyOrWhitespace, printTsDoc } from './tsdoc';
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

  await Promise.all([
    ...typesToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))),
    ...functionsToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))),
    ...enumsToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))),
    ...classesToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))),
    ...otherToPrint.map(async (m) => save(m, await printTypePage({ apiItem: m, apiModel }))),
  ]);
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

    const displayName = getDisplayName({ apiItem: m, apiModel }, m, {
      includeParams: false,
      includeParamTypes: false,
      includeReturnType: false,
      includeReleaseTag: false,
    });

    return h.tr(
      [
        h.td([h.h3(displayName, `aria-hidden="true" tabindex="-1" hidden`), h.code(displayName)]),
        h.td(type),
        h.td([
          description.length > 0 && h.div(description),
          memberExamples.length > 0 && h.div(memberExamples),
          releaseTag.length > 0 && h.div(releaseTag),
          memberDefaultValues.length > 0 && h.div(memberDefaultValues),
        ]),
      ],
      `id="${getHashLink(m)}"`,
    );
  });

  return root([
    frontmatter({ apiItem, apiModel }, apiItem, fileDestination),
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
          html(h.table([h.thead(h.tr([h.th('Property'), h.th('Type'), h.th('Description')])), h.tbody(tbody)])),
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
  const meta: FrontmatterMeta = {
    releaseTag: ApiReleaseTagMixin.isBaseClassOf(apiItem) ? ReleaseTag[apiItem.releaseTag] : null,
    ...(fileDestination && { fileDestination: `${fileDestination.path.replace(/^\//, '')}#L${fileDestination.line}` }),
    title: getDisplayName(context, apiItem, {
      includeParamTypes: false,
      includeParams: true,
      includeReleaseTag: true,
      includeReturnType: false,
    }),
  };
  const value = Object.entries(meta)
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');
  return { type: 'yaml', value };
}

run();
