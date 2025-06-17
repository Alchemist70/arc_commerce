const adminAuth = (req, res, next) => {
  if (!(req.user.isAdmin || req.user.is_admin)) {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

module.exports = adminAuth;
