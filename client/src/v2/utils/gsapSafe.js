import gsap from 'gsap';

const isEmptyTarget = (target) => {
  if (!target) return true;
  if (typeof target === 'string' && target.trim() === '') return true;
  if (Array.isArray(target) && target.length === 0) return true;
  return false;
};

/**
 * gsap.fromTo, but no-ops (instead of warning to the console) when `target`
 * is empty/undefined or resolves to zero matched elements. Use for selectors
 * whose markup may not exist yet (async-rendered content) or may have changed.
 */
export const safeFromTo = (target, fromVars, toVars) => {
  if (isEmptyTarget(target)) return null;
  const matched = typeof target === 'string' ? gsap.utils.toArray(target) : target;
  if (!matched || (Array.isArray(matched) && matched.length === 0)) return null;
  return gsap.fromTo(matched, fromVars, toVars);
};

/** gsap.to, with the same existence guard as safeFromTo. */
export const safeTo = (target, vars) => {
  if (isEmptyTarget(target)) return null;
  const matched = typeof target === 'string' ? gsap.utils.toArray(target) : target;
  if (!matched || (Array.isArray(matched) && matched.length === 0)) return null;
  return gsap.to(matched, vars);
};
