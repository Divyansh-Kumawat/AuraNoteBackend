const jwt = require('jsonwebtoken');
const JWT_SECRET = 'deekayisarapper';

const fetchuser = (req, res, next) => {
    // Get token from request headers
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }

    try {
        // Verify the token and extract user data
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;  // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
};

module.exports = fetchuser;
