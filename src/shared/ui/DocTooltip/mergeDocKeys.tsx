export const mergeDocKeys = (
  ...docKeysArrays: (
    | (string | undefined | null)[]
    | string
    | null
    | undefined
  )[]
): string | undefined => {
  if (!docKeysArrays || docKeysArrays.length === 0) {
    return undefined;
  }

  const mergedSet = new Set<string>();

  docKeysArrays.forEach((docKeys) => {
    if (Array.isArray(docKeys)) {
      docKeys.forEach((key) => {
        if (key) {
          mergedSet.add(key);
        }
      });
    } else if (docKeys) {
      mergedSet.add(docKeys);
    }
  });

  if (mergedSet.size === 0) {
    return undefined;
  }

  return Array.from(mergedSet).join(",");
};
