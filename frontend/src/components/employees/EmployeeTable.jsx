import { formatSalary, formatDate, formatManager } from '../../utils/format.js';

export default function EmployeeTable({ employees }) {
  return (
    // The wrapper scrolls sideways on small screens instead of breaking the layout.
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Employee ID</th>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col" className="numeric">Level</th>
            <th scope="col" className="numeric">Salary</th>
            <th scope="col">Joining Date</th>
            <th scope="col">Manager</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employee_id}>
              <td><span className="badge">{employee.employee_id}</span></td>
              <td className="strong">{employee.name}</td>
              <td>{employee.role}</td>
              <td className="numeric">{employee.level}</td>
              <td className="numeric">{formatSalary(employee.salary)}</td>
              <td>{formatDate(employee.joining_date)}</td>
              <td>{formatManager(employee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
