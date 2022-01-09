const express = require('express');
const router = express.Router();

const {register,
       login,
       logout,
       getMe,
       updateDetails,
       updatePassword,
       resetPassword
    } = require('../controllers/auth');

const {protect} = require('../middleware/protect')

router.post('/register',register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/user',protect,getMe);
router.put('/detailsupdate',protect,updateDetails);
router.put('/passwordupdate',protect,updatePassword)
router.put('/passwordreset/:resetToken',resetPassword);

module.exports = router