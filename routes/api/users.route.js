import { Router } from 'express';
import authMiddleware from '../../middleware/auth.js'
import { getUsers, deleteUser, updateUser, createUser } from '../../controllers/User.controller.js'

const router = Router();

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Private
 */

router.post('/list', authMiddleware, getUsers)
router.post('/delete', authMiddleware, deleteUser)
router.post('/update', authMiddleware, updateUser)
router.post('/create', authMiddleware, createUser)

export default router
