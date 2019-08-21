"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createMapFromObject(obj) {
    const map = new Map();
    for (let key in obj) {
        map.set(key, obj[key]);
    }
    return map;
}
exports.createMapFromObject = createMapFromObject;
