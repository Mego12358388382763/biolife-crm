import "server-only";

// Helpers for putting user-typed text into PostgREST filters. Values are
// always treated as literal text: LIKE wildcards are escaped, and values
// inside `.or()` strings are double-quoted so commas, dots and parentheses
// can't add or alter filter conditions.

// Escape LIKE/ILIKE wildcards (`%`, `_`) and the escape character itself, so
// the value only ever matches literally. Postgres' default LIKE escape is `\`.
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

// Quote a value for use inside a PostgREST logic-tree string such as `.or()`.
function quotePostgrestValue(value: string): string {
  return `"${value.replace(/[\\"]/g, (char) => `\\${char}`)}"`;
}

// `.or()` filter matching `term` as a case-insensitive substring of any column.
export function ilikeAnyFilter(columns: string[], term: string): string {
  const pattern = quotePostgrestValue(`%${escapeLikePattern(term)}%`);
  return columns.map((column) => `${column}.ilike.${pattern}`).join(",");
}
