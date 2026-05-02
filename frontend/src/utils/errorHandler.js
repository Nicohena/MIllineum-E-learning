export const normalizeError = (error, fallbackMessage = 'Something went wrong') => {
  if (!error) return fallbackMessage;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  return fallbackMessage;
};

export const safeAsync = async (action, fallback = null) => {
  try {
    const data = await action();
    return { data, error: null };
  } catch (error) {
    return { data: fallback, error: normalizeError(error) };
  }
};

export default {
  normalizeError,
  safeAsync,
};
