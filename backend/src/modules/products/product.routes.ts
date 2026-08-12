import { Router } from 'express';
import { ProductController } from './product.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { createProductSchema, updateProductSchema, productQuerySchema } from './product.schema';

const router = Router();
const controller = new ProductController();

router.use(authenticate);

router.get('/low-stock', authorize('ADMIN', 'WAREHOUSE'), controller.getLowStock);
router.get('/', validate(productQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('ADMIN', 'WAREHOUSE'), validate(createProductSchema), controller.create);
router.patch('/:id', authorize('ADMIN', 'WAREHOUSE'), validate(updateProductSchema), controller.update);

export default router;
