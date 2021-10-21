import { Router } from 'express'
import authMiddleware from '../../middleware/auth.js'
import { login, register, findUserById } from '../../controllers/Auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/user', authMiddleware, findUserById)

export default router
