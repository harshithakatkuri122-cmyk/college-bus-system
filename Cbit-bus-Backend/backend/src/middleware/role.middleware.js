exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Keep transport-admin as canonical while accepting legacy admin checks.
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role === "admin" ? "transport-admin" : role
    );
    const normalizedUserRole =
      req.user.role === "admin" ? "transport-admin" : req.user.role;

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};