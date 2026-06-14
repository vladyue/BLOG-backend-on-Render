import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default (req, res, next) => {
    const token = req.headers.authorization || '';

    if(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            req.userId = decoded._id;

            next();
        } catch(err) {
            return res.status(403).json({
                message: 'Нет доступа'
            });
        }
    } else {
        return res.status(404).json({
            message: 'Нет доступа'
        });
    }
};