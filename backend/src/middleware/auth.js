import { verifyAccessToken } from "../lib/jwt.js";
import { User } from "../models/User.js";

export function getTokenFromRequest(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "unauthorized" });

    const payload = verifyAccessToken(token);
  
    const userId = payload.sub || payload.id;

    if (!userId) return res.status(401).json({ error: "invalid_token_payload" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(401).json({ error: "user_not_found" });

    req.user = { 
      id: String(user._id), 
      email: user.email, 
      role: user.role, 
      name: user.name 
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "session_expired" });
  }
}