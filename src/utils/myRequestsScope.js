/**
 * صفحة «طلباتي»: المديرون يرون كل الطلبات؛ الموظفون يرون طلباتهم فقط (عبر user_id في الـ API).
 *
 * @param {Record<string, unknown>|null|undefined} user
 * @returns {boolean} true = لا نُرسل user_id (كل الطلبات)
 */
export function userSeesAllMyRequests(user) {
  if (!user || typeof user !== 'object') return false;
  const type = Number(user.type);
  if (type === 1) return true;
  if (user.is_manager === true || user.is_manager === 1) return true;
  if (user.is_leader === true || user.is_leader === 1) return true;
  return false;
}
