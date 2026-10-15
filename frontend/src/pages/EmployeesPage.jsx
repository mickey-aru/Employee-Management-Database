import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEmployees, parseApiError } from '../api/employees.js';
import EmployeeTable from '../components/employees/EmployeeTable.jsx';
import StatusMessage from '../components/common/StatusMessage.jsx';

// True if the search text appears in the employee's ID, name or role (ignoring case).
function matchesSearch(employee, searchText) {
  const needle = searchText.trim().toLowerCase();
  if (!needle) return true;
  return [employee.employee_id, employee.name, employee.role].some((value) =>
    value.toLowerCase().includes(needle)
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    async function loadEmployees() {
      try {
        setEmployees(await fetchEmployees());
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  // The whole list is small, so filtering in the browser is instant and simple.
  const visibleEmployees = employees.filter((employee) => matchesSearch(employee, searchText));

  function renderContent() {
    if (loading) return <StatusMessage type="loading" title="Loading employees…" />;
    if (error) return <StatusMessage type="error" title="Could not load employees">{error}</StatusMessage>;
    if (employees.length === 0) {
      return (
        <StatusMessage type="empty" title="No employees yet">
          <Link to="/employees/add">Add the first employee</Link> to get started.
        </StatusMessage>
      );
    }
    if (visibleEmployees.length === 0) {
      return <StatusMessage type="empty" title="No results">No employees match “{searchText.trim()}”.</StatusMessage>;
    }
    return <EmployeeTable employees={visibleEmployees} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Employees</h1>
          <p className="page-subtitle">
            {!loading && !error ? `${visibleEmployees.length} of ${employees.length} employees` : 'Browse company members and details'}
          </p>
        </div>
        <Link to="/employees/add" className="btn btn-primary">Add Employee</Link>
      </div>

      <div className="search">
        <label htmlFor="search" className="visually-hidden">Search employees</label>
        <input
          id="search"
          type="search"
          placeholder="Search by employee ID, name or role"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          disabled={loading || Boolean(error)}
        />
      </div>

      {renderContent()}
    </div>
  );
}
