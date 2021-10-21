import authRoutes from './auth.route.js';
import itemRoutes from './items.route.js';
import userRoutes from './users.route.js';
import { Router } from 'express'

const router = Router()

router.use('/items', itemRoutes)
router.use('/users', userRoutes)
router.use('/auth', authRoutes)

export default router