/**
 * Smoothly scrolls a DOM element container to the bottom.
 * 
 * @param {HTMLElement} element - The scroll container DOM node.
 * @param {boolean} [smooth=true] - Whether to animate the scroll behavior.
 */
export const scrollToBottom = (element, smooth = true) => {
  if (!element) return;
  
  // Use requestAnimationFrame to ensure the DOM layout calculations are finished
  requestAnimationFrame(() => {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  });
};

export default scrollToBottom;
