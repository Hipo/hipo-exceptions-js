"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createMapFromObject(obj) {
    const map = new Map();
    for (const key in obj) {
        map.set(key, obj[key]);
    }
    return map;
}
exports.createMapFromObject = createMapFromObject;
function isArrayOfString(x) {
    return (Array.isArray(x) &&
        x.every(item => Boolean(item && typeof item === "string")));
}
exports.isArrayOfString = isArrayOfString;
function isArrayOfObjects(x) {
    return Array.isArray(x) && x.every(item => typeof item === "object");
}
exports.isArrayOfObjects = isArrayOfObjects;
function isObjectEmpty(obj) {
    return typeof obj === "object" && !Array.isArray(obj) && obj
        ? Object.keys(obj).length === 0
        : false;
}
exports.isObjectEmpty = isObjectEmpty;
