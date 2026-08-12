import { Router } from 'express';
import { ChallanController } from './challan.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { createChallanSchema, updateChallanSchema, challanQuerySchema } from './challan.schema';

const router = Router();
const controller = new ChallanController();

router.use(authenticate);

router.get('/', validate(challanQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('ADMIN', 'SALES'), validate(createChallanSchema), controller.create);
router.patch('/:id', authorize('ADMIN', 'SALES'), validate(updateChallanSchema), controller.update);
router.post('/:id/confirm', authorize('ADMIN', 'SALES'), controller.confirm);
router.post('/:id/cancel', authorize('ADMIN'), controller.cancel);

export default router;
