const jwt = require('jsonwebtoken');
const asyncHandler = require('../util/async');
const ErrorResponse = require('../util/errorResponse');
const User = require('../model/User');
const { config } = require('../config');

exports.protect = asyncHandler(async (req,res,next)=>{
    let token;
//    Get token from Request header
    if(req.headers.authorization && 
       req.headers.authorization.startsWith('Bearer')){
           
           token = req.headers.authorization.split(' ')[1];

       }
    //    Or get token from cookies
    else if(req.cookies.token){
        token = req.cookies.token
    }
    // Check for token existence
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route',401))
    }

    try{
        // Verify token
        const user = jwt.verify(token,config.secret);
        
        // Get user from token 
        req.user = await User.findById(user.id)

        next()
    }catch(err){
        return next(new ErrorResponse('Not authorized to access this route',401))
    }
});

// Give access to authorized roles
exports.authorize = (...roles) =>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)){

            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                     403
                )
            );
        }
        next();
    };
};