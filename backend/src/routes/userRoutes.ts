import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';

const userRouter = Router();

// All user routes are protected
userRouter.use(authenticate);

userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

export default userRouter;
