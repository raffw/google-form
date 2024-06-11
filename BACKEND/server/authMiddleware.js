const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'yourSecretKey');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(400).send({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware