// https://www.npmjs.com/package/@bscotch/utility
// https://github.com/bscotch/tools
// https://github.com/bscotch/tools/blob/develop/src/lib/strings.ts

function withoutInitialLinebreaks(str) {
  return str.replace(/^[\r\n]+/, '');
}

function withoutTrailingWhitespace(str) {
  return str.replace(/\s+$/, '');
}

function cleanTemplate(strings, ...interps) {
  // Trim these things up
  const cleanStrings = [...strings];
  cleanStrings[0] = withoutInitialLinebreaks(cleanStrings[0]);
  const lastStringIdx = cleanStrings.length - 1;
  cleanStrings[lastStringIdx] = withoutTrailingWhitespace(
    cleanStrings[lastStringIdx],
  );

  // For each interp, if it has newlines when stringified each
  // line after the first needs to inherit the indentation
  // level of its starting point.
  let string = '';
  for (let i = 0; i < cleanStrings.length; i++) {
    string += cleanStrings[i];
    if (i == lastStringIdx) {
      break;
    }
    let interp = `${interps[i]}`;
    const linebreakRegex = /(\r?\n)/;
    const interpLines = interp.split(linebreakRegex).filter((x) => x);
    if (interpLines.length && i < lastStringIdx) {
      // How indented are we?
      const indentMatch = string.match(/\n?([^\n]+?)$/);
      if (indentMatch) {
        // amount of indent to add to each entry that is a break
        // (skip the last one, since if it's a newline we don't
        //  want that to cause an indent on the next line also)
        for (let i = 0; i < interpLines.length; i++) {
          if (interpLines[i].match(linebreakRegex)) {
            interpLines[i] += ' '.repeat(indentMatch[1].length);
          }
        }
      }
    }
    interp = interpLines.join('');
    string += interp;
  }
  return string;
}

/**
 * Remove linebreaks and extra spacing in a template string.
 */
export function oneline(strings, ...interps) {
  return cleanTemplate(strings, ...interps)
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/\s+/g, ' ');
}
