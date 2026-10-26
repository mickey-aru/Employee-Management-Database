// Friendly checks run before sending the form. The backend repeats all of these
// (never trust the browser), so this only exists to give faster feedback.
// Returns an object like { name: 'Name is required.' }; empty object means valid.
export function validateEmployeeForm(values, managers) {
  const errors = {};

  const employeeId = values.employee_id.trim();
  if (!employeeId) errors.employee_id = 'Employee ID is required.';
  else if (employeeId.length > 20) errors.employee_id = 'Employee ID must be 20 characters or fewer.';
  else if (!/^[A-Za-z0-9_-]+$/.test(employeeId)) {
    errors.employee_id = 'Use only letters, numbers, hyphens and underscores.';
  }

  const name = values.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length > 100) errors.name = 'Name must be 100 characters or fewer.';

  const role = values.role.trim();
  if (!role) errors.role = 'Role is required.';
  else if (role.length > 100) errors.role = 'Role must be 100 characters or fewer.';

  const level = Number(values.level);
  if (values.level === '' || !Number.isInteger(level) || level < 1 || level > 99) {
    errors.level = 'Level must be a whole number between 1 and 99.';
  }

  const salary = Number(values.salary);
  if (values.salary === '' || !Number.isFinite(salary) || salary <= 0) {
    errors.salary = 'Salary must be greater than zero.';
  }

  if (!values.joining_date) errors.joining_date = 'Joining date is required.';

  // Lower level number = more senior, so the manager's level must be smaller.
  if (values.manager_employee_id && !errors.level) {
    const manager = managers.find((m) => m.employee_id === values.manager_employee_id);
    if (manager && manager.level >= level) {
      errors.manager_employee_id =
        `${manager.name} is level ${manager.level}. Choose a manager with a lower level number than ${level}.`;
    }
  }

  // A manager cannot earn less than the person who reports to them.
  if (values.manager_employee_id && !errors.salary && !errors.manager_employee_id) {
    const manager = managers.find((m) => m.employee_id === values.manager_employee_id);
    if (manager && manager.salary < salary) {
      errors.manager_employee_id =
        `A manager's salary cannot be less than the employee's salary. ${manager.name} earns less than the salary entered.`;
    }
  }

  return errors;
}
