// Salary as Indian rupees, e.g. 850000 -> "₹8,50,000"
export function formatSalary(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// "2026-10-01" -> "1 Oct 2026". Parsed by hand so timezones can never shift the day.
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// "Rahul Verma (EMP002)" or an em dash when there is no manager.
export function formatManager(employee) {
  if (!employee.manager_employee_id) return '—';
  return `${employee.manager_name} (${employee.manager_employee_id})`;
}
