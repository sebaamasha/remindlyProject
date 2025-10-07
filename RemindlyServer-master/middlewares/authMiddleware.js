const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified; 
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }
        res.status(400).json({ error: 'Invalid token' });
    }
};


exports.authorizeTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Access forbidden: Only teachers can perform this action.' });
    }
    next();
};
exports.authorizeStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access forbidden: Only teachers can perform this action.' });
    }
    next();
};

