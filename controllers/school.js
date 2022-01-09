const School = require('../model/School');
const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../util/async');
const geocoder = require('../util/geocoder');
const path = require('path')




exports.getSchools = asyncHandler(async (req,res,next)=>{
    res.status(200).json(res.queryResults);
})


exports.getSchool = asyncHandler( async (req,res, next)=>{
    const school = await School.findById(req.params.id);

    if(!school){
        return next(new ErrorResponse(`School not found with id of ${req.params.id}`, 404))
    }
    res.status(200).json({
        success:true,
        data:school
    })
})


exports.createSchool = asyncHandler( async (req,res,next) =>{
    req.body.user = req.user._id
   
    const userSchool = await School.findOne({user:req.user._id})

    if(userSchool && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a school`,
                400
            )
        )
    }

    const school = await School.create(req.body);

    res.status(201).json({
        success:true,
        data:school
    })
})


exports.updateSchool = asyncHandler(async (req,res,next)=>{
    const school = await School.findOne(req.params.id);

    if(!school){
        return next(
            new ErrorResponse(
            `User ${req.user.id} is not authorized to update this school`,
            401)
        )
    }

    if (school.user.toString() !== req.user.id && req.user.role !== 'admin'){
       return next(
           new ErrorResponse(
            `User ${req.user.id} is not authorized to update this school`,
            401
           )
       )
    }
    schoolUpdate = await School.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        data:schoolUpdate
    })
})


exports.deleteSchool = asyncHandler( async (req,res,next)=>{
    const school = await School.findOne(req.params.id);

    if(!school){
        return next(
            new ErrorResponse(
            `User ${req.user.id} is not authorized to update this school`,
            401)
        )
    }

    if (school.user.toString() !== req.user.id && req.user.role !== 'admin'){
       return next(
           new ErrorResponse(
            `User ${req.user.id} is not authorized to update this school`,
            401
           )
       )
    }

    await school.remove();

    res.status(200).json({
        success:true,
        data:{}
    })
})

exports.getSchoolsInRadius = asyncHandler(
   async function(req,res,next){
        const {zipcode,distance} = req.params
    
       // Earth Radius = 3,963 mi / 6,378 km
        const radius = distance / 3963;
    
        const location = await geocoder.geocode(zipcode);
        const {latitude,longitude} = location[0];
    
        const schools = await School.find({
            location:{
                $geoWithin:{
                    $centerSphere:[[longitude,latitude],radius]
                }
            }
        })
    
        res.status(200).json({
            success:true,
            data:schools
        })
    
        
    })


exports.uploadSchoolPhoto = asyncHandler( async (req,res,next)=>{
    const school = await School.findById(req.params.id);
   
    if (!school) {
      return next(
        new ErrorResponse(`school not found with id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is school owner
    if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this school`,
          401
        )
      );
    }

    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`, 400));
    }
    const file = req.files[''];
      // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
        new ErrorResponse(
            `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
            400
        )
        );
    }
  // Create custom filename
  file.name = `photo_${school._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await School.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});