// Plain constants shared between client components and Server Actions.
// No "use server" or "server-only" directive — those restrict what a
// module may export (Server Action files: async functions only; server-only
// files: throws if imported into client code), and this value is needed on
// both sides.
export const RESET_CONFIRMATION_PHRASE = "DELETE ALL DATA";
