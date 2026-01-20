import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token)
    return res
      .status(401)
      .json({ message: "ACCESS DENIED: No token provided" });

  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in env.");
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      decoded,
      id : decoded._id,
      role : decoded.role
    };
    next();
  } catch (err) {

    if(err.name == 'TolkenExpiredError') {
      return res.status(401).json({ message: "Unauthorized: Token has expired" });
    };
    
    console.log("AUTHENTICATION ERROR:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
