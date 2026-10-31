const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // Check whether user information exists
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Check whether user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission."
            });
        }

        // Allow access
        next();
    };
};

module.exports = roleMiddleware;