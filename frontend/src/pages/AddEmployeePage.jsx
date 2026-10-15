import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees, createEmployee, parseApiError } from '../api/employees.js';
import EmployeeForm from '../components/employees/EmployeeForm.jsx';
import StatusMessage from '../components/common/StatusMessage.jsx';
import { validateEmployeeForm } from '../utils/validateEmployee.js';

const EMPTY_FORM = {
  employee_id: '',
  name: '',
  role: '',
  level: '',
  salary: '',
  joining_date: '',
  manager_employee_id: '',
};

const REDIRECT_DELAY_MS = 1500;

export default function AddEmployeePage() {
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // A ref updates instantly (unlike state), so a fast double-click cannot submit twice.
  const submitLockRef = useRef(false);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    async function loadManagers() {
      try {
        setManagers(await fetchEmployees());
      } catch (error) {
        setLoadError(parseApiError(error).message);
      } finally {
        setLoadingManagers(false);
      }
    }
    loadManagers();

    return () => clearTimeout(redirectTimerRef.current);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Clear that field's error as soon as the user starts fixing it.
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitLockRef.current) return;

    setFormError('');
    const validationErrors = validateEmployeeForm(values, managers);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    try {
      const result = await createEmployee({
        ...values,
        employee_id: values.employee_id.trim(),
        name: values.name.trim(),
        role: values.role.trim(),
        level: Number(values.level),
        salary: Number(values.salary),
        manager_employee_id: values.manager_employee_id || null,
      });

      // Keep the form locked while we show the success message and then redirect.
      setSuccessMessage(`${result.data.name} (${result.data.employee_id}) was added successfully. Redirecting to the employee list…`);
      redirectTimerRef.current = setTimeout(() => navigate('/employees'), REDIRECT_DELAY_MS);
    } catch (error) {
      const apiError = parseApiError(error);
      setErrors(apiError.fieldErrors);
      setFormError(apiError.message);
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Add Employee</h1>
      <p className="page-subtitle">Enter the details of the new team member and choose who they report to.</p>

      {successMessage && <StatusMessage type="success" title="Employee added">{successMessage}</StatusMessage>}
      {formError && !successMessage && <StatusMessage type="error" title="Could not add employee">{formError}</StatusMessage>}

      {loadingManagers && <StatusMessage type="loading" title="Loading managers…" />}
      {loadError && (
        <StatusMessage type="warning" title="Could not load the manager list">
          {loadError} You can still add a root employee, but a manager cannot be selected.
        </StatusMessage>
      )}

      {!loadingManagers && (
        <EmployeeForm
          values={values}
          errors={errors}
          managers={managers}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
