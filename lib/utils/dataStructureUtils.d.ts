declare function createMapFromObject(obj: {
    [key: string]: any;
}): Map<string, any>;
declare function isArrayOfStrings(x: unknown): x is string[];
declare function isArrayOfObjects(x: unknown): x is Array<{
    [key: string]: any;
}>;
declare function isObjectEmpty(obj: unknown): obj is {};
export { createMapFromObject, isArrayOfStrings, isArrayOfObjects, isObjectEmpty };
