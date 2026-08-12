import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';

const router = Router();
const controller = new CategoryController();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', authorize('ADMIN'), controller.create);

export default router;
