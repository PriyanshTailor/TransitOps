import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, companyId, role) => {
  return jwt.sign({ userId, companyId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId, companyId, role) => {
  return jwt.sign({ userId, companyId, role }, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_12345', { expiresIn: '7d' });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_12345');
};
