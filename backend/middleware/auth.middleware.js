import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // First, accept server-side session authentication
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    return next();
  }

  // Fallback to Bearer token
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
