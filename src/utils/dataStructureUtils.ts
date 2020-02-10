function createMapFromObject<T>(obj: T) {
  const map = new Map();

  for (const key in obj) {
    map.set(key, obj[key]);
  }

  return map;
}

function isArrayOfString(x: unknown): boolean {
  return (
    Array.isArray(x) &&
    x.every(item => Boolean(item && typeof item === "string"))
  );
}

function isArrayOfObject(x: unknown): boolean {
  return (
    Array.isArray(x) &&
    x.every(item => Boolean(item && typeof item === "object"))
  );
}

function isObjectEmpty(obj: unknown): boolean {
  return typeof obj === "object" && obj ? Object.keys(obj).length === 0 : false;
}

export { createMapFromObject, isArrayOfString, isArrayOfObject, isObjectEmpty };
