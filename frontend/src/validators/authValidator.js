const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLogin = ({ identifier, password }) => {
  const errors = {};
  if (!identifier || identifier.trim().length === 0) errors.identifier = 'Login ID is required';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateRegister = ({ name, email, password, role }) => {
  const errors = {};
  if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Valid email is required';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!role) errors.role = 'Role is required';
  return { valid: Object.keys(errors).length === 0, errors };
};

export default {
  validateLogin,
  validateRegister,
};
