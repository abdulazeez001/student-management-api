const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../util/async');
const School = require('../model/School');
const Course = require('../model/Course');


exports.getCourses = asyncHandler( async (req,res,next)=>{
    if(req.params.schoolId){
        const course = await Course.find({school:req.params.schoolId});

        return res.status(200).json({
            success:true,
            count:course.length,
            data:course
        });
    }else {
         res.status(200).json(res.queryResults);
    }
});

exports.getCourse = asyncHandler( async (req,res,next)=>{
    const course = await Course.findById(req.params.id).populate({
        path:'school',
        select:'name description'
    })

    if(!course){
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        )
    }

    res.status(200).json({
        success:true,
        data:course
    })
})

exports.addCourse = asyncHandler( async(req,res,next)=>{
    req.body.school = req.params.schoolId;
    req.body.user = req.user.id;

    const school = await School.findById(req.params.schoolId);

    if(!school){
        return next(
            new ErrorResponse(
                `No school with the id of ${req.params.schoolId}`,
                 404
            )
        )
    }
      // Make sure user is school owner
    if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
        new ErrorResponse(
            `User ${req.user.id} is not authorized to add a course to school ${school._id}`,
            401
        )
        );
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success:true,
        data:course
    })
})

exports.updateCourse = asyncHandler( async(req,res,next)=>{
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update course ${course._id}`,
          401
        )
      );
    }
  
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      success: true,
      data: course
    });
})

exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
  
    if (!course) {
      return next(
        new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete course ${course._id}`,
          401
        )
      );
    }
  
    await course.remove();
  
    res.status(200).json({
      success: true,
      data: {}
    });
  });
  