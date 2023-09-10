function transformToNestObject(schema) {
    const result = {};
    for (const [key, value] of Object.entries(schema)) {
      const nestedObject = transformToNestObject(value);
      result[key] = nestedObject;
    }
    return result;
  }