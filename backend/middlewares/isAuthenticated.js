import jwt from 'jsonwebtoken'
const isAuthenticated = async (req, res, next) => {

    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(500).json({
                success: false,
                message: 'User not authenticated !!'
            });
        }
        const decode =jwt.verify(token, process.env.SecretKey);
        if(!decode){
        return res.status(500).json({
            success: false,
            message: 'Invalid Token !!'
        });
        }
        req.id=decode.userId;
        next();
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

export default isAuthenticated;