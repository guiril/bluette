const QUERY_TERM_PATTERN = /\p{Script=Han}|[^\s\p{Script=Han}]+/gu;

interface TitleSegment {
  text: string;
  isMatch: boolean;
}

export const splitTitleByQuery = (title: string, query: string) => {
  const queryTerms = query.toLowerCase().match(QUERY_TERM_PATTERN) ?? [];

  if (queryTerms.length === 0) return [{ text: title, isMatch: false }];

  const lowerTitle = title.toLowerCase();
  const isMatchedAt = Array.from({ length: title.length }, () => false);

  for (const term of queryTerms) {
    let matchIndex = lowerTitle.indexOf(term);

    while (matchIndex !== -1) {
      for (let offset = 0; offset < term.length; offset += 1) {
        isMatchedAt[matchIndex + offset] = true;
      }

      matchIndex = lowerTitle.indexOf(term, matchIndex + term.length);
    }
  }

  const segments: TitleSegment[] = [];

  for (let index = 0; index < title.length; index += 1) {
    const isMatch = isMatchedAt[index] ?? false;
    const lastSegment = segments.at(-1);

    if (lastSegment && lastSegment.isMatch === isMatch) {
      lastSegment.text += title[index];
    } else {
      segments.push({ text: title[index] ?? '', isMatch });
    }
  }

  return segments;
};
