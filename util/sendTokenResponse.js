
//  Generate token, save to cookie, send response
const sendTokenResponse = (user, statusCode, res) =>{
    // generate token
    const token = user.getSignedJwtToken()

    const options = {
        expires:new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true
    }

    if (process.env.NODE_ENV === 'production'){
        options.secret = true;
    }

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
          success:true,
          token
      })
}

module.exports = sendTokenResponse