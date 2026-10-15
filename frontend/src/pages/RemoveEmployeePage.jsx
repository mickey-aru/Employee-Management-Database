import { useState } from 'react';
import { fetchEmployee, deleteEmployee, parseApiError } from '../api/employees.js';
import StatusMessage from '../components/common/StatusMessage.jsx';
import { formatManager } from '../utils/format.js';

// Builds the friendly sentence shown when deletion is blocked by direct reports.
function buildBlockedMessage(employee, directReports) {
  const count = directReports.length;
  const noun = count === 1 ? 'employee currently reports' : 'employees currently report';
  return `${employee.name} cannot be removed because ${count} ${noun} to them. Reassign those employees first.`;
}

export default function RemoveEmployeePage() {
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [employee, setEmployee] = useState(null);       // set after a successful lookup
  const [finding, setFinding] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [confirming, setConfirming] = useState(false);  // true while the "Are you sure?" box is open
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [blockedReports, setBlockedReports] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  function resetResultState() {
    setEmployee(null);
    setLookupError('');
    setConfirming(false);
    setRemoveError('');
    setBlockedReports([]);
  }

  // Step 1: look the employee up. Nothing is deleted here.
  async function handleFind(event) {
    event.preventDefault();
    const employeeId = employeeIdInput.trim();
    if (!employeeId) {
      resetResultState();
      setLookupError('Please enter an Employee ID.');
      return;
    }

    resetResultState();
    setSuccessMessage('');
    setFinding(true);
    try {
      setEmployee(await fetchEmployee(employeeId));
    } catch (error) {
      setLookupError(parseApiError(error).message);
    } finally {
      setFinding(false);
    }
  }

  // Step 2: the user confirmed, so now (and only now) call DELETE.
  async function handleConfirmRemove() {
    if (removing) return;
    setRemoving(true);
    setRemoveError('');

    try {
      const result = await deleteEmployee(employee.employee_id);
      setSuccessMessage(`${result.data.name} (${result.data.employee_id}) was removed.`);
      resetResultState();
      setEmployeeIdInput('');
    } catch (error) {
      const apiError = parseApiError(error);
      setConfirming(false);
      if (apiError.directReports.length > 0) {
        setBlockedReports(apiError.directReports);
      } else {
        setRemoveError(apiError.message);
      }
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Remove Employee</h1>
      <p className="page-subtitle">Find an employee first, then confirm before anything is deleted.</p>

      {successMessage && <StatusMessage type="success" title="Employee removed">{successMessage}</StatusMessage>}

      <form className="card form" onSubmit={handleFind} noValidate>
        <div className={`field ${lookupError ? 'has-error' : ''}`}>
          <label htmlFor="employeeId">Employee ID</label>
          <div className="inline-form">
            <input
              id="employeeId"
              type="text"
              placeholder="EMP005"
              value={employeeIdInput}
              onChange={(event) => setEmployeeIdInput(event.target.value)}
              aria-invalid={Boolean(lookupError)}
              aria-describedby={lookupError ? 'employeeId-error' : undefined}
            />
            <button type="submit" className="btn btn-secondary" disabled={finding}>
              {finding ? 'Searching…' : 'Find Employee'}
            </button>
          </div>
          {lookupError && <p className="field-error" id="employeeId-error">{lookupError}</p>}
        </div>
      </form>

      {employee && (
        <section className="card employee-card" aria-label="Employee found">
          <h2 className="card-title">{employee.name}</h2>
          <dl className="details">
            <div><dt>Employee ID</dt><dd>{employee.employee_id}</dd></div>
            <div><dt>Role</dt><dd>{employee.role}</dd></div>
            <div><dt>Level</dt><dd>{employee.level}</dd></div>
            <div><dt>Manager</dt><dd>{formatManager(employee)}</dd></div>
          </dl>

          {blockedReports.length > 0 && (
            <StatusMessage type="error" title={buildBlockedMessage(employee, blockedReports)}>
              <p>This employee has direct reports and cannot be removed. Employee reassignment will be supported in a future version.</p>
              <ul className="report-list">
                {blockedReports.map((report) => (
                  <li key={report.employee_id}>{report.name} ({report.employee_id})</li>
                ))}
              </ul>
            </StatusMessage>
          )}

          {removeError && <StatusMessage type="error" title="Could not remove employee">{removeError}</StatusMessage>}

          {!confirming && (
            <button
              type="button"
              className="btn btn-destructive"
              onClick={() => setConfirming(true)}
              disabled={blockedReports.length > 0}
            >
              Remove Employee
            </button>
          )}

          {confirming && (
            <div className="confirm-box" role="alertdialog" aria-labelledby="confirm-text">
              <p id="confirm-text">
                Are you sure you want to remove <strong>{employee.name} ({employee.employee_id})</strong>? This cannot be undone.
              </p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-destructive" onClick={handleConfirmRemove} disabled={removing}>
                  {removing ? 'Removing…' : 'Yes, remove'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)} disabled={removing}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
