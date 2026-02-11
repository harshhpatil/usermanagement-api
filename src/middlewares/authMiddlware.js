import jwt from "jsonwebtoken";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants.js";

/**
 * Authentication middleware - Verifies JWT token
 */
export const authMiddleware = (req, res, next) => {
  // Check for token in cookies or Authorization header
  let token = req.cookies?.token;
  
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: "Access denied: No token provided" 
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in env.");
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      decoded,
      id: decoded.userid,
      role: decoded.role
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        message: "Token has expired" 
      });
    }
    
    console.log("AUTHENTICATION ERROR:", err.message);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: ERROR_MESSAGES.INVALID_TOKEN 
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.UNAUTHORIZED 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        message: "Access denied: Insufficient permissions" 
      });
    }

    next();
  };
};
