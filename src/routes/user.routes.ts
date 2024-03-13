import { Router } from 'express'
import userControllers from '../controllers/user.controllers'
const userRouter = Router()

userRouter.route('/api/users')
  .get(userControllers.getAllUsers)
  .post(userControllers.createNewUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser)

export default userRouter