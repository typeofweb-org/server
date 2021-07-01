const visit = require('unist-util-visit');
const is = require('unist-util-is');

// Shamelessly stolen from React Query docs
// @see https://github.com/tannerlinsley/react-query/blob/16b7d290c70639b627d9ada32951d211eac3adc3/docs/src/lib/docs/remark-paragraph-alerts.js
module.exports.remarkParagraphAlerts = function remarkParagraphAlerts() {
  const sigils = {
    '=>': 'success',
    '->': 'info',
    '~>': 'warning',
    '!>': 'danger',
  };

  return function transformer(tree) {
    visit(tree, 'paragraph', (pNode, _, parent) => {
      visit(pNode, 'text', (textNode) => {
        Object.keys(sigils).forEach((symbol) => {
          if (textNode.value.startsWith(`${symbol} `)) {
            // Remove the literal sigil symbol from string contents
            textNode.value = textNode.value.replace(`${symbol} `, '');

            // Wrap matched nodes with <div> (containing proper attributes)
            parent.children = parent.children.map((node) => {
              return is(pNode, node)
                ? {
                    type: 'wrapper',
                    children: [node],
                    data: {
                      hName: 'div',
                      hProperties: {
                        className: ['alert', `alert-${sigils[symbol]}`, 'g-type-body'],
                        role: 'alert',
                      },
                    },
                  }
                : node;
            });
          }
        });
      });
    });
  };
};

module.exports.fixMarkdownLinks = function remarkParagraphAlerts() {
  return function transformer(tree) {
    visit(tree, ['link', 'linkReference'], (node) => {
      if (typeof node.url === 'string') {
        if (node.url.startsWith('./') && node.url.endsWith('.md')) {
          node.url = node.url.replace(/\.md$/, '');
        }
      }
    });
  };
};
