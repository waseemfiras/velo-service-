export const getApiUrl = (path: string): string => {
  // Always use relative path so that Netlify proxy or local dev server handles it.
  return path;
};

