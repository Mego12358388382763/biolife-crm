import * as z from "zod";

// Postgres' `uuid` type accepts any 8-4-4-4-12 hex string; it does not
// enforce the RFC 4122 version/variant nibbles the way zod's built-in
// `.uuid()` does. Use this for IDs coming from our own database (selects,
// hidden fields) rather than `z.string().uuid()`, which rejects otherwise
// valid Postgres UUIDs whose version/variant nibbles don't match.
export const idSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, "Invalid ID");
