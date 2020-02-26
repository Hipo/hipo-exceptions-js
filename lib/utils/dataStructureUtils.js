"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createMapFromObject(obj) {
    return new Map(Object.entries(obj));
}
exports.createMapFromObject = createMapFromObject;
function isArrayOfStrings(x) {
    return Array.isArray(x) && x.every(item => typeof item === "string");
}
exports.isArrayOfStrings = isArrayOfStrings;
function isArrayOfObjects(x) {
    return (Array.isArray(x) &&
        x.every(item => typeof item === "object" && !Array.isArray(item)));
}
exports.isArrayOfObjects = isArrayOfObjects;
function isObjectEmpty(obj) {
    return typeof obj === "object" && !Array.isArray(obj) && obj
        ? Object.keys(obj).length === 0
        : false;
}
exports.isObjectEmpty = isObjectEmpty;
