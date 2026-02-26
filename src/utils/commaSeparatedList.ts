export default function commaSeparatedList(str: string) {
  return str
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}
