function createMapFromObject(obj: { [key: string]: any }) {
  return new Map(Object.entries(obj));
}

function isArrayOfStrings(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(item => typeof item === "string");
}

function isArrayOfObjects(x: unknown): x is Array<{ [key: string]: any }> {
  return (
    Array.isArray(x) &&
    x.every(item => typeof item === "object" && !Array.isArray(item))
  );
}

function isObjectEmpty(obj: unknown): obj is {} {
  return typeof obj === "object" && !Array.isArray(obj) && obj
    ? Object.keys(obj).length === 0
    : false;
}

export {
  createMapFromObject,
  isArrayOfStrings,
  isArrayOfObjects,
  isObjectEmpty
};
