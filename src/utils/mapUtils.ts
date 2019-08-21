function createMapFromObject<T>(obj: T) {
  const map = new Map();

  for (let key in obj) {
    map.set(key, obj[key]);
  }

  return map;
}

export { createMapFromObject };
