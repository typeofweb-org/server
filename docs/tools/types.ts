import { ApiModel, ApiItem } from '@microsoft/api-extractor-model';

export type Context = {
  apiModel: ApiModel;
  apiItem: ApiItem;
};

export enum ApiItemKind {
  CallSignature = 'CallSignature',
  Class = 'Class',
  Constructor = 'Constructor',
  ConstructSignature = 'ConstructSignature',
  EntryPoint = 'EntryPoint',
  Enum = 'Enum',
  EnumMember = 'EnumMember',
  Function = 'Function',
  IndexSignature = 'IndexSignature',
  Interface = 'Interface',
  Method = 'Method',
  MethodSignature = 'MethodSignature',
  Model = 'Model',
  Namespace = 'Namespace',
  Package = 'Package',
  Property = 'Property',
  PropertySignature = 'PropertySignature',
  TypeAlias = 'TypeAlias',
  Variable = 'Variable',
  None = 'None',
}

export enum DocNodeKind {
  Block = 'Block',
  BlockTag = 'BlockTag',
  Excerpt = 'Excerpt',
  FencedCode = 'FencedCode',
  CodeSpan = 'CodeSpan',
  Comment = 'Comment',
  DeclarationReference = 'DeclarationReference',
  ErrorText = 'ErrorText',
  EscapedText = 'EscapedText',
  HtmlAttribute = 'HtmlAttribute',
  HtmlEndTag = 'HtmlEndTag',
  HtmlStartTag = 'HtmlStartTag',
  InheritDocTag = 'InheritDocTag',
  InlineTag = 'InlineTag',
  LinkTag = 'LinkTag',
  MemberIdentifier = 'MemberIdentifier',
  MemberReference = 'MemberReference',
  MemberSelector = 'MemberSelector',
  MemberSymbol = 'MemberSymbol',
  Paragraph = 'Paragraph',
  ParamBlock = 'ParamBlock',
  ParamCollection = 'ParamCollection',
  PlainText = 'PlainText',
  Section = 'Section',
  SoftBreak = 'SoftBreak',
}
