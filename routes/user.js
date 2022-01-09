const express = require('express');
const router = express.Router({mergeParams:true});
const { protect, authorize } = require('../middleware/protect');
const { queryResult } = require('../middleware/queryResult');
const User = require('../model/User');

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/user');





router.use(protect)
router.use(authorize('admin'))


router.route('/')
      .get(queryResult(User), getUsers)
      .post(createUser);

router.route('/:id')
      .get(getUser)
      .put(updateUser)
      .delete(deleteUser)

module.exports = router