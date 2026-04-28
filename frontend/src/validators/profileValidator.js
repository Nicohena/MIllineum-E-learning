const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateProfile = ({ name, email }) => {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Valid email is required';
  return { valid: Object.keys(errors).length === 0, errors };
};

export default {
  validateProfile,
};
