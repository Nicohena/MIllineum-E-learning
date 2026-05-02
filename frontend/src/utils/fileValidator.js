const toMb = (bytes) => bytes / (1024 * 1024);

export const validateFileSize = (file, maxMb = 10) => {
  if (!file) return { valid: false, reason: 'No file provided' };
  if (toMb(file.size) > maxMb) {
    return { valid: false, reason: `File must be smaller than ${maxMb}MB` };
  }
  return { valid: true, reason: '' };
};

export const validateFileType = (file, allowedExtensions = []) => {
  if (!file) return { valid: false, reason: 'No file provided' };
  if (allowedExtensions.length === 0) return { valid: true, reason: '' };
  const name = file.name || '';
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  if (!allowedExtensions.map((item) => item.toLowerCase()).includes(extension)) {
    return { valid: false, reason: `Allowed file types: ${allowedExtensions.join(', ')}` };
  }
  return { valid: true, reason: '' };
};

export default {
  validateFileSize,
  validateFileType,
};
