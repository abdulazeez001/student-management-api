const crypto = require('crypto');
const ErrorResponse = require('../util/errorResponse')
const sendTokenResponse = require('../util/sendTokenResponse')
const asyncHandler = require('../util/async')
const User = require('../model/User')

// Register  User
// POST /api/v1/auth/register

exports.register = asyncHandler( async (req,res,next)=>{
    const {name,email,password, role} = req.body;

    // Create user
    const user = await User.create({
         name,
         email,
         password,
         role
    });

    sendTokenResponse(user,200,res)
});

// Login User
// POST /api/auth/login

exports.login = asyncHandler( async (req,res,next)=>{
    const {email, password} = req.body;

    // Validate email and password
    if (!email || !password){
        return next(new ErrorResponse('Please provide your email and password',400))
    }

    // Check for user in database
    const user = await User.findOne({email}).select('+password');
  
    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401))
    }

    // Check for password validity
    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials', 401))
    }

    sendTokenResponse(user,200,res)
})

// LOGOUT USER
//  GET /api/auth/logout

exports.logout = asyncHandler( async (req,res,next)=>{
    res.clearCookie('token');

    res.status(200).json({
        success:true,
        data:{}
    })
})

//    Get current logged in user
//   GET /api/auth/user

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
  
    res.status(200).json({
      success: true,
      data: user
    });
  });

// Update user details
// PUT /api/auth/details

exports.updateDetails = asyncHandler(async (req,res,next)=>{
    const {name,email} = req.body
    const fieldToUpdate = {
        name,
        email
    }
    const user = await User.findByIdAndUpdate(req.user.id,fieldToUpdate,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        data:user
    })
})

// Update password
// PUT /api/auth/passwordupdate

exports.updatePassword = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    
    const isMatch = await user.comparePassword(req.body.currentPassword)

    if (!isMatch){
        return next(new ErrorResponse('Password is not correct',401))
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user,200,res)
})

// Forgot password
// POST /api/auth/forgotpassword




// Reset password
// PUT /api/auth/passwordreset

exports.resetPassword = asyncHandler(async (req,res,next)=>{
    const resetPasswordToken = crypto
                                  .createHash('sha256')
                                  .update(req.params.resetToken)
                                  .digest('hex')
    
    const user = User.findOne({resetPasswordToken,
                               resetPasswordExpire:{$gt:Date.now()}})

    if(!user){
        return next(new ErrorResponse('Invalid reset token',400));
    }

    // Set Password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user,200,res)

})