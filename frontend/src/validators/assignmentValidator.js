export const validateAssignmentPayload = ({ title, dueDate, points }) => {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (!dueDate) errors.dueDate = 'Due date is required';
  if (points == null || Number(points) <= 0) errors.points = 'Points must be greater than 0';
  return { valid: Object.keys(errors).length === 0, errors };
};

export default {
  validateAssignmentPayload,
};
