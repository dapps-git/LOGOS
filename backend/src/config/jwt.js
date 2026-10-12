const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment');
    }
    return 'logos_dev_only_jwt_secret_key_insecure';
  }
  return secret;
};

module.exports = {
  getJwtSecret
};
