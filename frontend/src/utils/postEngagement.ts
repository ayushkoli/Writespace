/** Compare Mongo ObjectIds serialized as strings (or mixed) */
export function listIncludesUserId(ids: string[] | undefined, userId: string | undefined): boolean {
  if (!userId || !ids?.length) return false;
  const uid = String(userId);
  return ids.some((id) => String(id) === uid);
}
