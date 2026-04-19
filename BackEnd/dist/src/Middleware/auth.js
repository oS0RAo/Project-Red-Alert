import { verifyToken } from "../utils/jwt.js";
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ msg: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: "Invalid token format" });
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ msg: "Unauthorized" });
    }
};
export const registerMiddleware = (req, res, next) => {
    const { fullName, password, email } = req.body;
    if (!fullName || !password || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }
    next();
};
export const loginMiddleware = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    next();
};
//# sourceMappingURL=auth.js.map