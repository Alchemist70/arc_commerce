const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    console.log("Authenticating request:", {
      path: req.path,
      method: req.method,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization
          ? "Bearer [REDACTED]"
          : undefined,
      },
    });

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      console.log("No authorization header found");
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
      console.log("No token found in authorization header");
      return res.status(401).json({ message: "Authentication token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    });

    // Ensure consistent userId field
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.error("No user ID found in token");
      return res
        .status(401)
        .json({ message: "Invalid token: no user ID found" });
    }

    // Set user info in request
    req.user = {
      userId: userId, // Use consistent userId field
      id: userId, // Also set id for compatibility
      email: decoded.email,
      fullname: decoded.fullname,
      isAdmin: decoded.isAdmin,
    };

    console.log("Authentication successful, user info set:", {
      userId: req.user.userId,
      isAdmin: req.user.isAdmin,
    });

    next();
  } catch (error) {
    console.error("Authentication error:", {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
    });

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired",
        error: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "Invalid token",
        error: "INVALID_TOKEN",
      });
    }

    return res.status(403).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

module.exports = authenticateToken;
