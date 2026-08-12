import { Router } from 'express';
import { StockController } from './stock.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { stockMoveSchema, stockQuerySchema } from './stock.schema';

const router = Router();
const controller = new StockController();

router.use(authenticate);

router.get('/movements', validate(stockQuerySchema, 'query'), controller.listMovements);
router.post('/move', authorize('ADMIN', 'WAREHOUSE'), validate(stockMoveSchema), controller.move);

export default router;
