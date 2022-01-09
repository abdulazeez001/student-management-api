const express = require('express');
const router = express.Router({mergeParams:true});
const { protect, authorize } = require('../middleware/protect');
const { queryResult } = require('../middleware/queryResult');
const Course = require('../model/Course');

const {
    getCourse,
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/course');

router.route('/')
      .get(queryResult(Course,{
          path:'school',
          select:'name description'
      }),getCourses)
      .post(protect,authorize('admin','publisher'),addCourse)

router.route('/:id')
      .get(getCourse)
      .put(protect,authorize('admin','publisher'),updateCourse)
      .delete(protect,authorize('admin','publisher'),deleteCourse)

module.exports = router