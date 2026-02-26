export default function capitalize(str: string) {
  if (typeof str === 'string') {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return '';
}
