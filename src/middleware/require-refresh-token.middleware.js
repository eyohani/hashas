const jwt = require('jsonwebtoken');

const requireRefreshToken = (req, res, next) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = requireRefreshToken;
