// Visibility filter for every public property query: published and not expired.
export function publicWhere() {
  return {
    status: "active",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}
