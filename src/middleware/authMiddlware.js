import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "847n5p475co4nx7mc4501mc40m030"; // jwt secret

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" }); // check for token

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {   
    console.log("Auth Error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
