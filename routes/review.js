const express = require('express');
const router = express.Router({mergeParams:true});
const { protect, authorize } = require('../middleware/protect');
const { queryResult } = require('../middleware/queryResult');
const Review = require('../model/Review');

const {
    getReview,
    getReviews,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/review')

router.route('/')
      .get(queryResult(Review,{
          path:'school',
          select:'name description'
      }),getReviews)
      .post(protect, authorize('user', 'admin'),addReview)

router.route('/:id')
      .get(getReview)
      .put(protect, authorize('user', 'admin'),updateReview)
      .delete(protect, authorize('user', 'admin'),deleteReview)

module.exports = router