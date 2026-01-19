import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token provided" }); 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Auth Error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
