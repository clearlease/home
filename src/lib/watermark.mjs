// Invisible watermark for the privacy policy. Every 6 to 14 words one Latin letter becomes its
// Cyrillic twin or one space becomes a four-per-em space. Montserrat draws the twins with the same
// outline (widths differ by at most 0.014 em), so readers see no change, but copies keep the marks.
// Find them in a suspected copy with `node scripts/watermark-check.mjs <url or file>`.
export const TWINS = { a: 'а', c: 'с', e: 'е', o: 'о', p: 'р' };
export const SPACE = ' ';

const MIN = 6, SPREAD = 9; // gap of 6 to 14 words, so never more than 20 words without a mark
const UNSAFE = /[@&]|:\/\/|\w[.\/]\w/; // emails, URLs, domains, HTML entities: never change their letters

// Marks the text of an HTML fragment; tags, attributes and code stay untouched. Same input, same output.
export function watermark(html, seed = 20250911) {
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  let gap = 0, target = MIN, letterTurn = true, heading = false, code = false;
  return html.split(/(<[^>]*>)/).map((part) => {
    if (part.startsWith('<')) {
      const tag = /^<(\/?)(h[1-6]|code|pre)\b/i.exec(part);
      if (tag && tag[2][0].toLowerCase() === 'h') heading = !tag[1];
      else if (tag) code = !tag[1];
      return part;
    }
    if (code) return part;
    return part.replace(/(\S+)( (?=\S))?/g, (m, word, space) => {
      if (++gap < target) return m;
      // headings hyphenate, and a Cyrillic letter would change where, so they only get spaces
      // only letters inside a Latin word: a lone Cyrillic "а" (as in "lit. a") could be a real Cyrillic word
      const letters = heading || UNSAFE.test(word) ? [] : [...word.matchAll(/(?<=[A-Za-zÄÖÜäöüß])[aceop]|[aceop](?=[A-Za-zÄÖÜäöüß])/g)].map((x) => x.index);
      const useLetter = letters.length && (letterTurn || !space);
      if (!useLetter && !space) return m; // nothing to mark here, try the next word
      gap = 0;
      target = MIN + Math.floor(rnd() * SPREAD);
      letterTurn = !letterTurn;
      if (!useLetter) return word + SPACE;
      const i = letters[Math.floor(rnd() * letters.length)];
      return word.slice(0, i) + TWINS[word[i]] + word.slice(i + 1) + (space || '');
    });
  }).join('');
}

const MARKS = new RegExp(`[${Object.values(TWINS).join('')}${SPACE}]`, 'g');
// Back to the original text, used by the tests to prove nothing else changed.
export const unwatermark = (text) => text.replace(MARKS, (c) => (c === SPACE ? ' ' : Object.keys(TWINS).find((k) => TWINS[k] === c)));

// Marks in a suspected copy: Cyrillic twins next to Latin letters, and four-per-em spaces.
export function findMarks(text) {
  return [...text.matchAll(new RegExp(`(?<=[A-Za-zÄÖÜäöüß])[${Object.values(TWINS).join('')}]|[${Object.values(TWINS).join('')}](?=[A-Za-zÄÖÜäöüß])|${SPACE}`, 'g'))]
    .map((m) => ({ index: m.index, char: m[0] === SPACE ? 'U+2005 space' : `Cyrillic ${m[0]}`, context: text.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ') }));
}
