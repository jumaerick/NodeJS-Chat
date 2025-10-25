const idMap = new Map([
  ['Chat Application', 1],
  ['Erevuka', 2],
  ['AKI', 3],
]);

// Convert keys to lowercase and invert the map
const platformMapper = new Map(
  [...idMap].map(([key, value]) => [value, key.toLowerCase()])
);

export default platformMapper;
