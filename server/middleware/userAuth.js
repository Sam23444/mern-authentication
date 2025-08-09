import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again!!!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token. Login Again!!!",
      });
    }

    req.userId = decoded.id; // ✅ Use req.userId, not req.body.userId
    next(); // ✅ Proceed to controller
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed: " + error.message,
    });
  }
};

export default userAuth;
