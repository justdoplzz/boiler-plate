const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const util = require('util');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        unique: 1,
    },
    password: {
        type: String,
        minlength: 5,
    },
    lastname: {
        type: String,
        maxlength: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number,
    }
})


userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){        // 비밀번호를 수정할 때
        // 비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword) {

    // plainPassword: 1234567 / 암호화된 비밀번호: $2b$10$/2CWPx0W5nWE7WWErWLDHOaCQWNnhX.reSaVfiYzMwrZnEZT0h/r6
    const result = bcrypt.compare(plainPassword, this.password);
    return result;
}

userSchema.methods.generateToken = async function(){
    const user = this;

    // jsonwebtoken 을 이용해서 token 생성
    const token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token;

    try {
        const savedUser = await user.save();
        return user;
    } catch (error) {
        return error;
    }
}


userSchema.statics.findByToken = async function(token){
    const user = this;
    const verifyPromise = util.promisify(jwt.verify);

    try {
        // token 을 decode
        const decoded = await verifyPromise(token, 'secretToken');

        const userData = await user.findOne({ "_id": decoded, "token": token});

        return userData
    } catch (error) {
        return error;
    }
}


const User = mongoose.model('User', userSchema);

module.exports = { User }