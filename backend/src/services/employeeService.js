const pool = require('../config/db');

// An "expected" error: something the client did wrong (bad input, not found, conflict).
// Controllers turn these into HTTP responses. Anything else is an unexpected 500.
class ServiceError extends Error {
  constructor(statusCode, message, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra; // extra JSON fields for the response, e.g. { errors } or { directReports }
  }
}

// Shared SELECT: each employee plus their manager's user-facing ID and name.
// The internal numeric ids never leave the backend.
const EMPLOYEE_SELECT = `
  SELECT e.employee_id, e.name, e.role, e.level, e.salary, e.joining_date,
         m.employee_id AS manager_employee_id, m.name AS manager_name
  FROM employees e
  LEFT JOIN employees m ON e.manager_id = m.id
`;

const MIN_JOINING_DATE = '1950-01-01';

// ---------- helpers ----------

// DECIMAL columns come back from mysql2 as strings, so convert salary to a number.
function formatEmployee(row) {
  return { ...row, salary: Number(row.salary) };
}

function normalizeEmployeeId(rawValue) {
  return String(rawValue ?? '').trim().toUpperCase();
}

// In SQL LIKE, % and _ are wildcards. Escape them so a search for "50%" is literal.
function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&');
}

// Looks up the raw row (including the internal id) for business-rule checks.
async function findRowByEmployeeId(employeeId) {
  const [rows] = await pool.execute(
    'SELECT id, employee_id, name, role, level FROM employees WHERE employee_id = ?',
    [employeeId]
  );
  return rows[0] || null;
}

// True only for real calendar dates such as 2024-02-29 (not 2023-02-31).
function isRealDate(isoString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return false;
  const parsed = new Date(`${isoString}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === isoString;
}

// ---------- validation ----------

// Checks every field and returns cleaned values, or throws a 400 listing all problems.
function validateNewEmployee(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ServiceError(400, 'Request body must be a JSON object.');
  }

  const errors = {};

  const employeeId = normalizeEmployeeId(body.employee_id);
  if (!employeeId) {
    errors.employee_id = 'Employee ID is required.';
  } else if (employeeId.length > 20) {
    errors.employee_id = 'Employee ID must be 20 characters or fewer.';
  } else if (!/^[A-Z0-9_-]+$/.test(employeeId)) {
    errors.employee_id = 'Employee ID may only contain letters, numbers, hyphens and underscores.';
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) errors.name = 'Name is required.';
  else if (name.length > 100) errors.name = 'Name must be 100 characters or fewer.';

  const role = typeof body.role === 'string' ? body.role.trim() : '';
  if (!role) errors.role = 'Role is required.';
  else if (role.length > 100) errors.role = 'Role must be 100 characters or fewer.';

  // Accept numbers or numeric strings, but reject things like "", "abc", true, [].
  const level = toNumber(body.level);
  if (level === null || !Number.isInteger(level) || level < 1 || level > 99) {
    errors.level = 'Level must be a whole number between 1 and 99.';
  }

  const salary = toNumber(body.salary);
  if (salary === null || salary <= 0) {
    errors.salary = 'Salary must be a number greater than zero.';
  } else if (salary > 9999999999.99) {
    errors.salary = 'Salary is too large.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(String(body.salary).trim())) {
    // Checking the text avoids floating point surprises (e.g. 0.1 + 0.2).
    errors.salary = 'Salary can have at most 2 decimal places.';
  }

  const joiningDate = typeof body.joining_date === 'string' ? body.joining_date.trim() : '';
  if (!joiningDate) {
    errors.joining_date = 'Joining date is required.';
  } else if (!isRealDate(joiningDate)) {
    errors.joining_date = 'Joining date must be a valid date (YYYY-MM-DD).';
  } else if (joiningDate < MIN_JOINING_DATE) {
    errors.joining_date = `Joining date cannot be before ${MIN_JOINING_DATE}.`;
  } else if (joiningDate > latestAllowedJoiningDate()) {
    errors.joining_date = 'Joining date cannot be more than one year in the future.';
  }

  // Manager is optional (the CEO has none).
  const managerEmployeeId = normalizeEmployeeId(body.manager_employee_id);

  if (Object.keys(errors).length > 0) {
    throw new ServiceError(400, Object.values(errors).join(' '), { errors });
  }

  return {
    employee_id: employeeId,
    name,
    role,
    level,
    salary,
    joining_date: joiningDate,
    manager_employee_id: managerEmployeeId || null,
  };
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function latestAllowedJoiningDate() {
  const limit = new Date();
  limit.setUTCFullYear(limit.getUTCFullYear() + 1);
  return limit.toISOString().slice(0, 10);
}

// ---------- queries ----------

async function getAllEmployees(search,level) {
  let sql = EMPLOYEE_SELECT;
  const params = [];
   level = Number(level);
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    sql += ' WHERE e.employee_id LIKE ? OR e.name LIKE ? OR e.role LIKE ?';
    params.push(pattern, pattern, pattern);
  }

  if(level){
    console.log("got level value");
    if(search){
      sql += ' AND e.level = ?';
    }
    else{
      sql += 'WHERE e.level = ?';
    }
  
    params.push(level);
  }
  

  // Most senior first (level 1), then alphabetical.
  sql += ' ORDER BY e.level ASC, e.name ASC';

  console.log("sql query is: ",sql)

  const [rows] = await pool.execute(sql, params);
  return rows.map(formatEmployee);
}

async function getEmployeeByEmployeeId(rawEmployeeId) {
  const employeeId = normalizeEmployeeId(rawEmployeeId);
  const [rows] = await pool.execute(`${EMPLOYEE_SELECT} WHERE e.employee_id = ?`, [employeeId]);

  if (rows.length === 0) {
    throw new ServiceError(404, 'Employee not found.');
  }
  return formatEmployee(rows[0]);
}

async function createEmployee(body) {
  const data = validateNewEmployee(body);

  const existing = await findRowByEmployeeId(data.employee_id);
  if (existing) {
    throw new ServiceError(409, `Employee ID ${data.employee_id} already exists.`, {
      errors: { employee_id: 'This Employee ID is already in use.' },
    });
  }

  // Translate the manager's user-facing ID into the internal id used by the foreign key.
  let managerInternalId = null;
  if (data.manager_employee_id) {
    const manager = await findRowByEmployeeId(data.manager_employee_id);

    if (!manager) {
      throw managerError('The selected manager does not exist.');
    }
    if (manager.employee_id === data.employee_id) {
      throw managerError('An employee cannot be their own manager.');
    }
    // Lower level number = more senior, so a manager must have a smaller number.
    if (manager.level >= data.level) {
      throw managerError(
        `A manager must be more senior than the employee. ${manager.name} is level ${manager.level}, ` +
          `so the new employee's level must be greater than ${manager.level}.`
      );
    }
    managerInternalId = manager.id;
  }

  try {
    await pool.execute(
      `INSERT INTO employees (employee_id, name, role, level, salary, joining_date, manager_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.employee_id, data.name, data.role, data.level, data.salary, data.joining_date, managerInternalId]
    );
  } catch (err) {
    // Two requests with the same ID can pass the check above at the same time;
    // the UNIQUE constraint is the final safety net.
    if (err.code === 'ER_DUP_ENTRY') {
      throw new ServiceError(409, `Employee ID ${data.employee_id} already exists.`, {
        errors: { employee_id: 'This Employee ID is already in use.' },
      });
    }
    throw err;
  }

  return getEmployeeByEmployeeId(data.employee_id);
}

function managerError(message) {
  return new ServiceError(400, message, { errors: { manager_employee_id: message } });
}

async function deleteEmployee(rawEmployeeId) {
  const employeeId = normalizeEmployeeId(rawEmployeeId);
  const employee = await findRowByEmployeeId(employeeId);

  if (!employee) {
    throw new ServiceError(404, 'Employee not found.');
  }

  // Business rule: anyone who still manages people cannot be removed.
  const [directReports] = await pool.execute(
    'SELECT employee_id, name FROM employees WHERE manager_id = ? ORDER BY name ASC',
    [employee.id]
  );

  if (directReports.length > 0) {
    throw new ServiceError(409, 'Employee cannot be removed because they have direct reports.', {
      directReports,
    });
  }

  try {
    await pool.execute('DELETE FROM employees WHERE id = ?', [employee.id]);
  } catch (err) {
    // A report was added between our check and the DELETE: the foreign key blocks it.
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new ServiceError(409, 'Employee cannot be removed because they have direct reports.');
    }
    throw err;
  }

  return { employee_id: employee.employee_id, name: employee.name ,role: employee.role, level: employee.level};
}

// Builds the org tree with ONE query. The idea:
//   1. Make a node for every employee and store it in a Map keyed by internal id.
//   2. Walk the list once: put each node into its manager's `children` array.
//      Nodes without a manager become roots.
// Each employee is touched a constant number of times, so this is O(n).
async function getHierarchy() {
  const [rows] = await pool.execute(
    'SELECT id, manager_id, employee_id, name, role, level FROM employees ORDER BY level ASC, name ASC'
  );

  const nodesById = new Map();
  for (const row of rows) {
    nodesById.set(row.id, {
      employee_id: row.employee_id,
      name: row.name,
      role: row.role,
      level: row.level,
      depth: (row.level) - 1,
      team_size:0,
      children: [], 
     
    });
     console.log("depth is",row.level - 1);
  }

  const roots = [];
  for (const row of rows) {
    const node = nodesById.get(row.id);
    const parent = row.manager_id === null ? null : nodesById.get(row.manager_id);

    if (parent) {
      parent.children.push(node);
      parent.children.push(node);
    } else {
      // No manager (normal for the CEO). Several roots are allowed so odd data never breaks the UI.
      roots.push(node);
     
    }
  }

  return roots;
}

module.exports = {
  ServiceError,
  getAllEmployees,
  getEmployeeByEmployeeId,
  createEmployee,
  deleteEmployee,
  getHierarchy,
};
