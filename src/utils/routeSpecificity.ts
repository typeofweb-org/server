enum Specificity {
  TRAILING_SLASH = '0',
  LITERAL = '1',
  PARAM = '2',
  WILDCARD = '3',
}

const segmentToSpecificity = (segment: string): Specificity => {
  if (segment === '') {
    return Specificity.TRAILING_SLASH;
  }
  if (segment.startsWith(':')) {
    return Specificity.PARAM;
  }
  if (segment.includes('*')) {
    return Specificity.WILDCARD;
  }
  return Specificity.LITERAL;
};

export const calculateSpecificity = (path: string) => {
  return path.replace(/^\//g, '').split('/').map(segmentToSpecificity).join('');
};
