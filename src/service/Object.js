export function renameKeyKeepPositionAndRef(obj, oldKey, newKey) {
  const entries = Object.entries(obj).map(([key, value]) =>
    key === oldKey ? [newKey, value] : [key, value],
  );

  // Clear all existing own properties
  for (const key of Object.keys(obj)) {
    delete obj[key];
  }

  // Re-add them in order, onto the SAME object
  for (const [key, value] of entries) {
    obj[key] = value;
  }

  return obj; // same reference, for convenience
}
