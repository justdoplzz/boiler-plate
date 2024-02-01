const express = require('express');
const app = express()
const port = 5000

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key')

const { User } = require('./models/User');

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


app.post('/register', async (req, res) => {

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


app.listen(port, () => console.log(`Example app listening on port ${port}`))