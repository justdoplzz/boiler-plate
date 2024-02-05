const express = require('express');
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./server/config/key')
const { User } = require('./server/models/User');
const { auth } = require('./server/middleware/auth');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
}).then(() => console.log('MongoDB Connected ~'))
    .catch(err => console.log(err));


app.get('/', (req, res) => res.send('Hello World!!!'))


app.get("/api/hello", async (req, res) => {


    await res.send("안녕하세요~~");

})


app.post('/api/users/register', async (req, res) => {

    // 회원가입 할 때 필요한 정보들을 client 에서 가져오면 그것들을 데이터 베이스에 넣어준다
    const user = new User(req.body)

    // 정보들이 user 모델에 저장 됨
    const result = await user.save().then(() => {
        res.status(200).json({
            success: true,
        })
    }).catch((err) => {
        res.json({ success: false, err })
    })
})

app.post("/api/users/login", async (req, res) => {
    try {

        // 1. 요청된 이메일이 db에 있는지 확인
        const user = await User.findOne({ email: req.body.email});
        if(!user){
            return res.json({
                loginSuccess: false,
                message: '제공된 이메일에 해당하는 유저가 없습니다.'
            })
        }

        // 2. 요청된 이메일이 db 에 존재한다면 비밀번호 체크
        const isMatch = await user.comparePassword(req.body.password);
        if(!isMatch){
            return res.json({
                loginSuccess: false,
                message: '비밀번호가 틀렸습니다.',
            });
        }

        // 3. 비밀번호가 맞는다면 토큰 생성
        const userData = await user.generateToken();
        // 쿠키에 token 저장
        res.cookie("x_auth", userData.token)
            .status(200)
            .json({ loginSuccess: true, userId: userData._id });

    } catch (error) {
        return res.status(400).send(err);
    }
})


app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해 왔다는 얘기 = authentication 이 true 라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    })
})

app.get('/api/users/logout', auth, async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ _id: req.user._id }, { token: "" });
        if(!user){
            return res.json({ success: false, message: 'User not found' });
        }
        return res.status(200).send({
            success: true,
            message: '로그아웃 성공'
        })
    } catch (error) {
        
    }
    User.findOneAndUpdate({ _id: req.user,_id }, { token: "" }, (err, user) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).send({
            success: true
        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}`))