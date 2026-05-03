
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")           // strip apostrophes (Levi's → Levis)
    .replace(/[^a-z0-9\s-]/g, "")   // strip non-alphanumeric (except spaces and hyphens)
    .replace(/[\s-]+/g, "-")        // collapse whitespace/hyphens into single hyphen
    .replace(/^-+|-+$/g, "");       // trim leading/trailing hyphens
};
