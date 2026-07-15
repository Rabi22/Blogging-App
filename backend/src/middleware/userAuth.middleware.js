import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import tokenBlacklistModel from '../models/blacklist.model.js'


async function authUser(req, res, next) {
  try {
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers?.authorization || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return res.status(401).json({ status:"error" ,message: 'Authentication token not provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET,{ ignoreExpiration: false });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const blacklisted = await tokenBlacklistModel.exists({ tokenHash }).lean();

    if (blacklisted) {
      return res.status(401).json({ message: 'Token has been revoked (blacklisted)' });
    }

    req.user = { id: decoded.id, username: decoded.username };
    return next();
  } catch (err) {
        return res.status(401).json({ status: "error",message: 'Invalid or expired token'});
  }
}


export default authUser;