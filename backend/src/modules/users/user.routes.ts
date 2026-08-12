import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { createUserSchema, updateUserSchema, userQuerySchema } from './user.schema';

const router = Router();
const controller = new UserController();

router.use(authenticate);
router.use(authorize('ADMIN')); // Only administrators can manage staff accounts

router.get('/', validate(userQuerySchema, 'query'), controller.list);
router.post('/', validate(createUserSchema), controller.create);
router.patch('/:id', validate(updateUserSchema), controller.update);

export default router;
