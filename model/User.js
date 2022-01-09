const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt  = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../config');


const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'Name is required']
    },
    email: {
        type:String,
        required:[true, 'Email is required'],
        unique:true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
          ]
    },
    role:{
        type:String,
        enum: ['user', 'publisher','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true, 'Password is required'],
        minlength:[6,'is shorter than the minimum allowed length (6)'],
        select:false
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
});


// Encrypt password before saving to database
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);

})

// Compare inputed password to hashed password from database
UserSchema.methods.comparePassword = async function (userPassword){
    return await bcrypt.compare(userPassword,this.password);
}

// Sign JWT token and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this._id},config.secret,{
        expiresIn:config.jwtTokenExpire
    });
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Hash token and update resetPasswordToken field
    this.resetPasswordToken = crypto
               .createHash('sha256')
               .update(token)
               .digest('hex')
    
    this.resetPasswordExpire =  Date.now() + 10 * 60 * 1000;

    return token
}

module.exports = mongoose.model('User',UserSchema);