export default function detectMessageType(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'excel';
  if (mimetype.includes('word')) return 'word';
  return 'other';
}
