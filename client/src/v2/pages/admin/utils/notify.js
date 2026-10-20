import toast from 'react-hot-toast';

/**
 * Toast notifications helper matching exact formatting and JSON error parsing of original AdminDashboard.
 * @param {string|object} msg - Error or success message string/object
 */
export const notify = (msg) => {
  let finalMsg = typeof msg === 'string' ? msg : String(msg);

  // Parse backend JSON errors into readable messages
  if (finalMsg.includes('{') && finalMsg.includes('}')) {
    try {
      const jsonStartIndex = finalMsg.indexOf('{');
      const prefix = finalMsg.substring(0, jsonStartIndex).trim();
      const jsonStr = finalMsg.substring(jsonStartIndex);
      const errObj = JSON.parse(jsonStr);

      let readableErrors = [];
      for (const [field, errors] of Object.entries(errObj)) {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        if (Array.isArray(errors)) {
          readableErrors.push(`${fieldName}: ${errors.join(' ')}`);
        } else if (typeof errors === 'string') {
          readableErrors.push(`${fieldName}: ${errors}`);
        }
      }
      if (readableErrors.length > 0) {
        finalMsg = (prefix ? prefix + ' ' : '') + readableErrors.join(' | ');
      }
    } catch (e) {
      // Not parseable, leave as is
    }
  }

  const lower = finalMsg.toLowerCase();
  const isSuccess =
    lower.includes('success') ||
    lower.includes('saved') ||
    lower.includes('uploaded') ||
    lower.includes('updated') ||
    lower.includes('added') ||
    lower.includes('deleted');

  if (isSuccess) {
    toast.success(finalMsg, { duration: 5000 });
  } else {
    toast.error(finalMsg, { duration: 6000 });
  }
};

export default notify;
