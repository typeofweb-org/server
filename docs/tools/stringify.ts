import RemarkStringify from 'remark-stringify';
import RemarkRehype from 'remark-rehype';
import RehypeStringify from 'rehype-stringify';
import Gfm from 'remark-gfm';
import RemarkFrontmatter from 'remark-frontmatter';
import Unified from 'unified';
import { Node, Parent, Literal } from 'unist';

export function toMarkdownString(tree: Node): string {
  const processor = Unified().use(RemarkFrontmatter, ['yaml']).use(Gfm).use(RemarkStringify, {
    fences: true,
  });

  return processor.stringify(tree);
}

export function toHtmlString(tree: Node) {
  const processor = Unified().use(RemarkFrontmatter, ['yaml']).use(Gfm).use(RemarkRehype).use(RehypeStringify);

  return processor.stringify(processor.runSync(tree));
}
