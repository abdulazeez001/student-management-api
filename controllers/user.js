const User = require('../model/User');
const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../util/async');



// Get all user
// GET /api/users

exports.getUsers = asyncHandler( async (req,res,next)=>{
    // const users = await User.find({});

    res.status(200).json(res.queryResults)
})

// Get single user
// GET /api/users/:id
exports.getUser = asyncHandler( async (req,res,next)=>{
    const {id} = req.params

    const user = await User.findById(id)

    res.status(200)
       .json({
           success:true,
           data:user
       })
})

// Create a user
// POST /api/users

exports.createUser = asyncHandler( async (req,res,next)=>{
    const user = await User.create(req.body);

    res.status(200).json({
        success:true,
        data:user
    })
})

// Update User
// PUT /api/users/:id

exports.updateUser = asyncHandler( async (req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        data:user
    })
})

// Delete User
// DELETE /api/users/:id

exports.deleteUser = asyncHandler( async (req,res,next)=>{
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success:true,
        data:{}
    })
})