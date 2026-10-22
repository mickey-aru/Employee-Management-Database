const employeeService = require('../services/employeeService');

const { ServiceError } = employeeService;

// Expected errors (validation, not found, conflict) become JSON responses here.
// Anything unexpected is passed to the global error handler (a 500).
function handleError(err, res, next) {
  if (err instanceof ServiceError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, ...err.extra });
  }
  next(err);
}

async function getEmployees(req, res, next) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const level = typeof req.query.level === 'string' ? req.query.level : '';
    const bonus = typeof req.query.bonus === 'string' ? req.query.bonus : null;

    if(bonus ){
      if(( bonus != 'false' ) & (bonus != 'true')){
        res.status(400).json({
          success:'false',
          message : 'Invalide Request'
        });
      }
    }
    

    console.log("level is ",level);
    
    const employees = await employeeService.getAllEmployees(search, level, bonus);
    res.json({ success: true, data: employees });
  } catch (err) {
    handleError(err, res, next);
  }
}

async function getEmployee(req, res, next) {
  try {
    const employee = await employeeService.getEmployeeByEmployeeId(req.params.employeeId);
    res.json({ success: true, data: employee });
  } catch (err) {
    handleError(err, res, next);
  }
}

async function createEmployee(req, res, next) {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, message: 'Employee added successfully.', data: employee });
  } catch (err) {
    handleError(err, res, next);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const removed = await employeeService.deleteEmployee(req.params.employeeId);

    res.json({ success: true, message: `${removed.name} (${removed.employee_id}) removed successfully` , data: removed });
  } catch (err) {
    handleError(err, res, next);
  }
}

async function getHierarchy(req, res, next) {
  try {
    const hierarchy = await employeeService.getHierarchy();
    res.json({ success: true, data: hierarchy });
  } catch (err) {
    handleError(err, res, next);
  }
}

module.exports = { getEmployees, getEmployee, createEmployee, deleteEmployee, getHierarchy };
