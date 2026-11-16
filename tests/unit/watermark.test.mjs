import { readFileSync } from 'node:fs';
import { marked } from 'marked';
import { describe, expect, it } from 'vitest';
import { watermark, unwatermark, findMarks, SPACE } from '../../src/lib/watermark.mjs';

const source = readFileSync('resources/content/20250911 - clearlease - privacy.md', 'utf8');
const original = marked.parse(source);
const marked_ = watermark(original);
const visible = (html) => html.replace(/<[^>]*>/g, ' ').split(/[ \n\t]+/).filter(Boolean); // words as a reader sees them

describe('privacy policy watermark', () => {
  it('starts from a clean source', () => {
    expect(findMarks(source), 'privacy.md holds watermark characters, probably text copied from the live page').toEqual([]);
  });

  it('changes nothing but the marked characters', () => {
    expect(marked_).not.toBe(original);
    expect(unwatermark(marked_)).toBe(original);
  });

  it('leaves no more than 20 words in a row without a mark', () => {
    let run = 0, longest = 0;
    for (const word of visible(marked_)) {
      // a four-per-em space joins two words into one token here, which counts as marked
      run = findMarks(word).length || word.includes(SPACE) ? 0 : run + 1;
      longest = Math.max(longest, run);
    }
    expect(longest).toBeLessThanOrEqual(20);
    expect(findMarks(marked_).length).toBeGreaterThan(visible(original).length / 15);
  });

  it('keeps tags, links, emails and heading letters intact', () => {
    expect(marked_.match(/<[^>]*>/g)).toEqual(original.match(/<[^>]*>/g));
    for (const word of visible(marked_).filter((w) => /@|:\/\//.test(w))) expect(findMarks(word.replaceAll(SPACE, ''))).toEqual([]);
    for (const h of marked_.match(/<h\d[^>]*>[\s\S]*?<\/h\d>/g)) expect(findMarks(h.replaceAll(SPACE, ' '))).toEqual([]);
  });

  it('is stable across builds', () => {
    expect(watermark(original)).toBe(marked_);
  });
});
