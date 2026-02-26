import { describe, expect, test } from 'vitest';

import commaSeparatedList from '../src/utils/commaSeparatedList';

describe('commaSeparatedList', () => {
  test('parses comma-separated values', () => {
    expect(commaSeparatedList('')).toEqual([]);
    expect(commaSeparatedList(' ')).toEqual([]);
    expect(commaSeparatedList(',')).toEqual([]);
    expect(commaSeparatedList(' , ')).toEqual([]);
    expect(commaSeparatedList('a')).toEqual(['a']);
    expect(commaSeparatedList('a,')).toEqual(['a']);
    expect(commaSeparatedList(',a')).toEqual(['a']);
    expect(commaSeparatedList('a,b')).toEqual(['a', 'b']);
    expect(commaSeparatedList('a ,b')).toEqual(['a', 'b']);
    expect(commaSeparatedList('a, b')).toEqual(['a', 'b']);
    expect(commaSeparatedList('a , b')).toEqual(['a', 'b']);
    expect(commaSeparatedList('a, b,')).toEqual(['a', 'b']);
    expect(commaSeparatedList('a , b,')).toEqual(['a', 'b']);
    expect(commaSeparatedList('a, b, ')).toEqual(['a', 'b']);
    expect(commaSeparatedList('a , b, ')).toEqual(['a', 'b']);
    expect(commaSeparatedList(' a, b,')).toEqual(['a', 'b']);
  });
});
