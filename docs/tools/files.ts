import { DeclarationReference } from '@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference';
import { DocDeclarationReference } from '@microsoft/tsdoc';
import { Context } from './types';
import { ApiItem } from '@microsoft/api-extractor-model';
import { UNSAFE_FILENAME, BASE_PATH, OUTDIR } from './constants';
import Path from 'path';
import Fs from 'fs/promises';
import { last } from './utils';
import GithubSlugger from 'github-slugger';

export function referenceToLink(
  context: Context,
  reference?: DeclarationReference | DocDeclarationReference,
  linkTxt?: string,
) {
  if (!reference) {
    console.warn('Empty reference');
    return null;
  }

  const ref = context.apiModel.resolveDeclarationReference(reference, context.apiItem);
  if (ref.errorMessage || !ref.resolvedApiItem) {
    // console.warn(
    //   reference instanceof DeclarationReference ? reference.symbol?.componentPath?.component.toString() : '',
    //   ref.errorMessage,
    // );
    return null;
  }

  const linkText = linkTxt || ref.resolvedApiItem.getScopedNameWithinPackage();
  const url = getFileUrl(ref.resolvedApiItem);
  return { url, linkText };
}

export function getSafeFilename(name: string) {
  return name.replace(/^@typeofweb\//, '').replace(UNSAFE_FILENAME, '_');
}

export function getApiItemName(apiItem: ApiItem): string {
  if (apiItem.kind === 'Model') {
    return 'index.md';
  }

  const hierarchy = apiItem.getHierarchy();

  if (apiItem.kind === 'PropertySignature' && hierarchy.length > 0) {
    const anchor = getHashLink(last(hierarchy));
    const filename = getApiItemName(hierarchy[hierarchy.length - 2]);
    return `${filename}#${anchor}`;
  }

  const segments: string[] = hierarchy
    .map((hierarchyItem) => {
      switch (hierarchyItem.kind) {
        case 'Model':
        case 'EntryPoint':
        case 'Package':
          return '';
        default:
          return getSafeFilename(hierarchyItem.displayName);
      }
    })
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

  const baseName = segments.join('.');
  const filename = baseName || 'index';
  return `${filename}.md`;
}

export function getHashLink(apiItem: ApiItem): string {
  const slugger = new GithubSlugger();
  return slugger.slug(apiItem.displayName);
}

export function getFileUrl(apiItem: ApiItem) {
  const name = getApiItemName(apiItem);
  return Path.join(BASE_PATH, name);
}

export function getFilePath(apiItem: ApiItem) {
  const name = getApiItemName(apiItem);
  return Path.join(OUTDIR, name);
}

export async function rimraf() {
  await Fs.readdir(OUTDIR);
  await Fs.rm(OUTDIR, { recursive: true });
  await Fs.mkdir(OUTDIR);
}
