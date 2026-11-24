const noteDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const formatNoteDate = (isoDate: string) =>
  noteDateFormatter.format(new Date(isoDate)).replaceAll('-', '.');
