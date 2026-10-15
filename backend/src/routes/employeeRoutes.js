const express = require('express');
const controller = require('../controllers/employeeController');

const router = express.Router();

router.get('/', controller.getEmployees);

// IMPORTANT: '/hierarchy' must be declared BEFORE '/:employeeId'.
// Express matches routes top to bottom, so otherwise "hierarchy" would be treated as an employee ID.
router.get('/hierarchy', controller.getHierarchy);

router.get('/:employeeId', controller.getEmployee);
router.post('/', controller.createEmployee);
router.delete('/:employeeId', controller.deleteEmployee);

module.exports = router;
