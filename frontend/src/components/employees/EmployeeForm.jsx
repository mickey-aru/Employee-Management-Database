// One labelled input with its error message. Kept local because only this form uses it.
function Field({ id, label, error, hint, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

export default function EmployeeForm({ values, errors, managers, submitting, onChange, onSubmit }) {
  // Shared props for every input: current value, change handler, and accessibility wiring.
  const inputProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange,
    disabled: submitting,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form className="card form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <Field id="employee_id" label="Employee ID" error={errors.employee_id} hint="Unique, e.g. EMP018">
          <input type="text" maxLength={20} placeholder="EMP018" {...inputProps('employee_id')} />
        </Field>

        <Field id="name" label="Employee Name" error={errors.name}>
          <input type="text" maxLength={100} placeholder="Full name" {...inputProps('name')} />
        </Field>

        <Field id="role" label="Role" error={errors.role}>
          <input type="text" maxLength={100} placeholder="Software Engineer" {...inputProps('role')} />
        </Field>

        <Field id="level" label="Level" error={errors.level} hint="Lower number = more senior (CEO is 1)">
          <input type="number" min="1" max="99" step="1" placeholder="5" {...inputProps('level')} />
        </Field>

        <Field id="salary" label="Salary (INR per year)" error={errors.salary}>
          <input type="number" min="0" step="0.01" placeholder="850000" {...inputProps('salary')} />
        </Field>

        <Field id="joining_date" label="Joining Date" error={errors.joining_date}>
          <input type="date" {...inputProps('joining_date')} />
        </Field>

        <div className="form-wide">
          <Field
            id="manager_employee_id"
            label="Manager"
            error={errors.manager_employee_id}
            hint="Must have a lower level number and an equal or higher salary. Leave as root employee only for the top of the organisation."
          >
            <select {...inputProps('manager_employee_id')}>
              <option value="">No Manager / Root Employee</option>
              {managers.map((manager) => (
                <option key={manager.employee_id} value={manager.employee_id}>
                  {manager.name} — {manager.role} — {manager.employee_id}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}
