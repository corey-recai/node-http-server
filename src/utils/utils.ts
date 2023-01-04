export function isEmpty(obj: {}): boolean {
  for (let i in obj) return false;
  return true;
}
