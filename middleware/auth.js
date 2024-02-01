const { User } =  require('../models/User');

// 인증 처리 하는 부분
let auth = async (req, res, next) => {
    try {
        // 클라이언트 쿠키에서 token 가져오기
        let token = req.cookies.x_auth;

        // token 을 복호화 한 후 user 찾기
        const user = await User.findByToken(token);

        if(!user){
            return res.json({ isAuth: false, error: true });
        }

        req.token = token;
        req.user = user;
        next();
        
    } catch (error) {
        throw error;
    }
}

module.exports = { auth };

