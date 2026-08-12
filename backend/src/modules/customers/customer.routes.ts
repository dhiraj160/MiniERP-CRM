import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { createCustomerSchema, updateCustomerSchema, addNoteSchema, customerQuerySchema } from './customer.schema';

const router = Router();
const controller = new CustomerController();

// All routes require authentication
router.use(authenticate);

router.get('/follow-ups', authorize('ADMIN', 'SALES'), controller.getFollowUps);
router.get('/', validate(customerQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('ADMIN', 'SALES'), validate(createCustomerSchema), controller.create);
router.patch('/:id', authorize('ADMIN', 'SALES'), validate(updateCustomerSchema), controller.update);
router.post('/:id/notes', authorize('ADMIN', 'SALES'), validate(addNoteSchema), controller.addNote);

export default router;
