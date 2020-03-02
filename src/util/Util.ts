export function filterObject(obj: any) {
  const ret: any = {};
  Object.keys(obj)
    .filter(key => obj[key] !== undefined)
    .forEach(key => (ret[key] = obj[key]));
  return ret;
}

export function no(name: string) {
  throw new Error(`env not found - ${name}`);
}
