const express = require('express');
const router = express.Router({mergeParams:true});
const { protect, authorize } = require('../middleware/protect');
const { queryResult } = require('../middleware/queryResult');
const School = require('../model/School');
const courseRoutes = require('./course')
const reviewRoutes = require('./review')

const {
  getSchool,
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getSchoolsInRadius,
  uploadSchoolPhoto
} = require('../controllers/school');



router.use('/:schoolId/courses',courseRoutes);
router.use('/:schoolId/reviews',reviewRoutes)
router.route('/radius/:zipcode/:distance').get(getSchoolsInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), uploadSchoolPhoto);

router
  .route('/')
  .get(queryResult(School, 'courses'), getSchools)
  .post(protect, authorize('publisher', 'admin'), createSchool);

router
  .route('/:id')
  .get(getSchool)
  .put(protect, authorize('publisher', 'admin'), updateSchool)
  .delete(protect, authorize('publisher', 'admin'), deleteSchool);

module.exports = router