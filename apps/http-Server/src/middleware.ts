import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


export const verifyToken = (
  req: any,
  res: any,
  next: any
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as {id : string};
    console.log("This is the decoded from jwt ",decoded);
    
    req.userId = decoded.id;

    console.log("This is the userId from decoded ",req.userId);

    next();
  } catch (err) {
    return res.status(401).json({ message: "Some error occured at middleware", err });
  }
};