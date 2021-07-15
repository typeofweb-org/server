import Path from 'path';
import Fs from 'fs/promises';
import Prettier from 'prettier';
import {
  DocBlock,
  DocBlockTag,
  DocCodeSpan,
  DocComment,
  DocDeclarationReference,
  DocErrorText,
  DocEscapedText,
  DocExcerpt,
  DocFencedCode,
  DocHtmlAttribute,
  DocHtmlEndTag,
  DocHtmlStartTag,
  DocInheritDocTag,
  DocInlineTag,
  DocLinkTag,
  DocMemberIdentifier,
  DocMemberReference,
  DocMemberSelector,
  DocMemberSymbol,
  DocNode,
  DocParagraph,
  DocParamBlock,
  DocParamCollection,
  DocPlainText,
  DocSection,
  DocSoftBreak,
  StandardTags,
  TSDocTagDefinition,
} from '@microsoft/tsdoc';
import { Node, Literal, Parent } from 'unist';
import { inlineCode, text, paragraph, link, code, root } from 'mdast-builder';
import { Context, DocNodeKind } from './types';
import { as } from './utils';
import { referenceToLink } from './files';
import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { toHtmlString } from './stringify';
import { readFileSync } from 'fs';

const prettierrc = JSON.parse(readFileSync(Path.join(process.cwd(), '..', '.prettierrc'), 'utf-8'));

export function nodeIsParent(node: Node): node is Parent {
  return 'children' in node;
}

export function nodeIsLiteral(node: Node): node is Literal {
  return 'value' in node;
}

export function isEmptyOrWhitespace(tree: Node[] | Node): boolean {
  return [tree].flat().every((node) => {
    if (nodeIsLiteral(node)) {
      return (typeof node.value === 'string' && !node.value.trim()) || node.value === null || node.value === undefined;
    } else if (nodeIsParent(node)) {
      return node.children.every(isEmptyOrWhitespace);
    } else {
      return true;
    }
  });
}

export function printTsDoc(context: Context, doc: DocNode): Node[] | Node {
  switch (doc.kind) {
    case DocNodeKind.Block: {
      const d = as<DocBlock>(doc);
      break;
    }
    case DocNodeKind.BlockTag: {
      const d = as<DocBlockTag>(doc);
      break;
    }
    case DocNodeKind.Excerpt: {
      const d = as<DocExcerpt>(doc);
      break;
    }
    case DocNodeKind.FencedCode: {
      const d = as<DocFencedCode>(doc);
      return code(d.language, d.code);
    }
    case DocNodeKind.CodeSpan: {
      const d = as<DocCodeSpan>(doc);
      return inlineCode(d.code);
    }
    case DocNodeKind.Comment: {
      const d = as<DocComment>(doc);
      break;
    }
    case DocNodeKind.DeclarationReference: {
      const d = as<DocDeclarationReference>(doc);
      break;
    }
    case DocNodeKind.ErrorText: {
      const d = as<DocErrorText>(doc);
      break;
    }
    case DocNodeKind.EscapedText: {
      const d = as<DocEscapedText>(doc);
      break;
    }
    case DocNodeKind.HtmlAttribute: {
      const d = as<DocHtmlAttribute>(doc);
      break;
    }
    case DocNodeKind.HtmlEndTag: {
      const d = as<DocHtmlEndTag>(doc);
      break;
    }
    case DocNodeKind.HtmlStartTag: {
      const d = as<DocHtmlStartTag>(doc);
      break;
    }
    case DocNodeKind.InheritDocTag: {
      const d = as<DocInheritDocTag>(doc);
      break;
    }
    case DocNodeKind.InlineTag: {
      const d = as<DocInlineTag>(doc);
      break;
    }
    case DocNodeKind.LinkTag: {
      const d = as<DocLinkTag>(doc);
      if (d.codeDestination) {
        const result = referenceToLink(context, d.codeDestination, d.linkText);
        return result
          ? link(result.url, '', d.linkText ? text(d.linkText) : inlineCode(result.linkText))
          : d.linkText
          ? inlineCode(d.linkText)
          : [];
      } else if (d.urlDestination) {
        const linkText = d.linkText || d.urlDestination;
        return link(d.urlDestination, '', text(linkText));
      } else if (d.linkText) {
        return link(d.linkText);
      }
    }
    case DocNodeKind.MemberIdentifier: {
      const d = as<DocMemberIdentifier>(doc);
      break;
    }
    case DocNodeKind.MemberReference: {
      const d = as<DocMemberReference>(doc);
      break;
    }
    case DocNodeKind.MemberSelector: {
      const d = as<DocMemberSelector>(doc);
      break;
    }
    case DocNodeKind.MemberSymbol: {
      const d = as<DocMemberSymbol>(doc);
      break;
    }
    case DocNodeKind.Paragraph: {
      const d = as<DocParagraph>(doc);
      return paragraph(d.getChildNodes().flatMap((n) => printTsDoc(context, n)));
    }
    case DocNodeKind.ParamBlock: {
      const d = as<DocParamBlock>(doc);
      break;
    }
    case DocNodeKind.ParamCollection: {
      const d = as<DocParamCollection>(doc);
      return d.getChildNodes().flatMap((n) => printTsDoc(context, n));
    }
    case DocNodeKind.PlainText: {
      const d = as<DocPlainText>(doc);
      return text(d.text);
    }
    case DocNodeKind.Section: {
      const d = as<DocSection>(doc);
      return d.getChildNodes().flatMap((n) => printTsDoc(context, n));
    }
    case DocNodeKind.SoftBreak: {
      const d = as<DocSoftBreak>(doc);
      return text(' ');
    }
  }
  console.warn(`${doc.kind} was not handled`);
  return [];
}

export function trimWhitespaceInlineCode(data: Node[]): Node[] {
  const firstCodeIndex = data.reduce(
    (foundIndex, n, idx) => (foundIndex !== -1 ? foundIndex : n.type === 'inlineCode' ? idx : -1),
    -1,
  );
  const lastCodeIndex = data.reduceRight(
    (foundIndex, n, idx) => (foundIndex !== -1 ? foundIndex : n.type === 'inlineCode' ? idx : -1),
    -1,
  );

  if (firstCodeIndex === -1 || lastCodeIndex === -1) {
    return data;
  }

  return data.filter((n, idx) => {
    if (idx < firstCodeIndex || idx > lastCodeIndex) {
      return n.type !== 'text' || ((n as Literal).value as string).trim().length > 0;
    }
    return true;
  });
}

export function collapseParagraphs(data: Node[]): Node[] {
  return data
    .flat()
    .flatMap((node) => (node.type === 'paragraph' ? collapseParagraphs((node as Parent).children) : node));
}

type TsDocTagNames = {
  [K in keyof typeof StandardTags]: typeof StandardTags[K] extends TSDocTagDefinition ? K : never;
}[keyof typeof StandardTags];

export function getTSBlock(
  context: Context,
  {
    tagName,
    apiItem,
    getTitle,
  }: {
    tagName: TsDocTagNames;
    apiItem: ApiItem;
    getTitle?: (block: DocBlock, idx: number, allBlocks: DocBlock[]) => Node;
  },
) {
  return apiItem instanceof ApiDocumentedItem && apiItem.tsdocComment
    ? apiItem.tsdocComment.customBlocks
        .filter((b) => b.blockTag.tagNameWithUpperCase === StandardTags[tagName].tagNameWithUpperCase)
        .flatMap((block, idx, allBlocks) => {
          const headingTitle = getTitle ? getTitle(block, idx, allBlocks) : null;
          const data = [printTsDoc({ apiItem, apiModel: context.apiModel }, block.content)].flat();
          const markdown = root([
            ...(headingTitle ? [headingTitle] : []),
            ...trimWhitespaceInlineCode(collapseParagraphs(data)),
          ]);

          return markdown;
        })
    : [];
}

export function getTSBlockInHtml(
  context: Context,
  {
    tagName,
    apiItem,
    getTitle,
  }: {
    tagName: TsDocTagNames;
    apiItem: ApiItem;
    getTitle?: (block: DocBlock, idx: number, allBlocks: DocBlock[]) => Node;
  },
) {
  const data = getTSBlock(context, { tagName, apiItem, getTitle });

  return data.map((markdown) => toHtmlString(markdown));
}

const readFileLines = (() => {
  const map = new Map<string, string[]>();

  return async function readFileLines(filePath: string) {
    if (map.has(filePath)) {
      return map.get(filePath)!;
    }

    const file = (await Fs.readFile(filePath, 'utf-8')).split('\n');
    // we can skip this as all the files are already formatted
    // const result = Prettier.format(file, { ...prettierrc, parser: 'typescript' });
    map.set(filePath, file);
    return file;
  };
})();

export async function findReferenceTo(excerpt: string) {
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
      const index = (await readFileLines(currentPath)).findIndex((line) => line.includes(excerpt));
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
