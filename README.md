# Employee Management System

A small full-stack app for managing company employees and visualising who reports to whom.
It is built as a learning/portfolio project: React on the front, Express + MySQL on the back, no ORM, no auth, no extras.

## Features

- **View employees** in a table with search (by employee ID, name or role)
- **Add an employee** with a validated form and a manager dropdown
- **Remove an employee** with a two-step flow (find, then confirm)
- **Organization hierarchy**: an expandable tree rendered recursively from the database
- Server-side validation and consistent JSON errors
- Responsive layout (desktop, tablet, mobile)

Editing/reassigning employees is intentionally **not** in V1 (see [Future work](#future-work)).

## Technology stack

| Layer    | Tools                                   |
| -------- | --------------------------------------- |
| Frontend | React 18, Vite, React Router, Axios, plain CSS |
| Backend  | Node.js, Express, `mysql2` (promise API), `dotenv`, `cors`, `nodemon` (dev) |
| Database | MySQL 8                                 |

## Architecture overview

```
Browser (React)  ──HTTP/JSON──▶  Express  ──SQL──▶  MySQL
                                   │
        Route  →  Controller  →  Service
        (URLs)    (req / res)    (business rules + SQL)
```

- **Routes** only map URLs to controller functions.
- **Controllers** read the request, call a service, and turn expected errors into HTTP responses.
- **Services** hold the business rules (validation, manager checks, deletion rule, tree building) and all SQL.
- **errorHandler middleware** catches everything unexpected and returns a safe message (no stack traces or SQL).

In development the Vite server proxies `/api` to Express (port 5000), so the browser talks to a single origin.
CORS is also enabled for `http://localhost:5173`.

## Folder structure

```
employee-management-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js                  # mysql2 connection pool
│   │   ├── controllers/employeeController.js
│   │   ├── routes/employeeRoutes.js
│   │   ├── services/employeeService.js   # business rules + SQL
│   │   ├── middleware/errorHandler.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/employees.js              # every API call lives here
│   │   ├── components/{layout,common,employees,hierarchy}/
│   │   ├── pages/                        # one file per route
│   │   ├── utils/                        # formatting + form validation
│   │   ├── styles/main.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── database/
│   ├── schema.sql
│   └── seed.sql
├── README.md
└── .gitignore
```

## Database design

One table, `employees`, with a **self-referencing foreign key**:

```
employees.manager_id  ──▶  employees.id
```

A manager is just another employee, so reporting lines are stored directly as rows. No JSON, no separate hierarchy table.

- `id` is the internal auto-increment key. Only the database and backend use it.
- `employee_id` (e.g. `EMP001`) is the unique, user-facing identifier. The API never exposes `id`; the frontend sends `manager_employee_id` and the backend looks up the internal id.
- The CEO has `manager_id = NULL`. Everyone else points at their manager's `id`.
- `ON DELETE RESTRICT` means MySQL itself also refuses to delete someone who still has reports (a safety net behind the backend check).
- **Level**: a lower number means more senior (CEO = 1). `manager_id` is the source of truth for reporting; level is only used to sanity check that a manager is above their report.

## Prerequisites

- Node.js 18 or newer (`node -v`)
- MySQL 8 running locally, with the `mysql` command-line client available

## Setup

### 1. Create the database

From the project root (you will be asked for your MySQL password):

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

`schema.sql` drops and recreates the `employees` table, so running it again resets your data.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set `DB_PASSWORD` (and `DB_USER` if you do not use `root`):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=employee_management
CORS_ORIGIN=http://localhost:5173
```

### 3. Run it locally

Terminal 1 (API at http://localhost:5000):

```bash
cd backend
npm install
npm run dev
```

You should see `MySQL connection OK.` in the output.

Terminal 2 (app at http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## API reference

Base path: `/api/employees`

| Method | Endpoint                    | Description                                   | Success | Errors        |
| ------ | --------------------------- | --------------------------------------------- | ------- | ------------- |
| GET    | `/api/employees`            | List employees. Optional `?search=` (ID, name, role). Ordered by level, then name | 200 | 500/503 |
| GET    | `/api/employees/hierarchy`  | Nested org tree (`children` arrays)           | 200     | 500/503       |
| GET    | `/api/employees/:employeeId`| One employee by user-facing ID                | 200     | 404           |
| POST   | `/api/employees`            | Create an employee                            | 201     | 400, 409      |
| DELETE | `/api/employees/:employeeId`| Delete an employee with no direct reports     | 200     | 404, 409      |

`/hierarchy` is declared before `/:employeeId` in the router. Otherwise Express would treat the word "hierarchy" as an employee ID.

**Create request**

```json
{
  "employee_id": "EMP018",
  "name": "Neha Sharma",
  "role": "Software Engineer",
  "level": 5,
  "salary": 850000,
  "joining_date": "2026-10-01",
  "manager_employee_id": "EMP008"
}
```

**Responses** always have `success`, plus `data` and/or `message`:

```json
{ "success": true, "data": [] }
{ "success": true, "message": "Employee added successfully.", "data": {} }
{ "success": false, "message": "Employee not found." }
```

Validation errors (400/409) also include an `errors` object keyed by field name, which the form uses to highlight inputs.

### Validation rules (enforced in the backend)

- `employee_id`: required, trimmed, upper-cased, max 20 chars, letters/numbers/`-`/`_`, unique (duplicate → 409)
- `name`, `role`: required, trimmed, max 100 chars
- `level`: whole number 1–99
- `salary`: number greater than 0, at most 2 decimals (stored as `DECIMAL(12,2)`)
- `joining_date`: real calendar date, not before 1950, not more than a year ahead
- `manager_employee_id`: optional; if given, the manager must exist, cannot be the employee themselves, and must have a **lower level number** than the employee

All SQL uses parameterized queries (`?` placeholders), so input is never concatenated into SQL.

## How the hierarchy works

`GET /api/employees/hierarchy` runs **one** query for all employees and builds the tree in memory:

1. Create a node (`{ employee_id, name, role, level, children: [] }`) for every row and store it in a `Map` keyed by internal id.
2. Loop once more: push each node into its manager's `children`. Nodes with no manager become roots.

That is O(n), with no recursive SQL and no N+1 queries. The API allows several roots so odd data never crashes the UI.

On the frontend, `HierarchyNode` renders one employee and then renders itself for each item in `employee.children`. Nothing about CEO/VP/Manager is hardcoded, so any depth works.

## Deletion business rule

**An employee who has direct reports cannot be deleted.**

The service first queries the employee's direct reports. If there are any, it responds with `409 Conflict`:

```json
{
  "success": false,
  "message": "Employee cannot be removed because they have direct reports.",
  "directReports": [{ "employee_id": "EMP008", "name": "Arjun Mehta" }]
}
```

Subordinates are never deleted or reassigned automatically, and there is no cascading delete. The Remove Employee page shows the list of reports and explains that reassignment will come in a future version. Try it with `EMP002` (has reports) versus `EMP017` (no reports).

## Screenshots

Add your own screenshots here after running the app.

| Page | Screenshot |
| ---- | ---------- |
| Home | _placeholder_ |
| All Employees | _placeholder_ |
| Add Employee | _placeholder_ |
| Remove Employee | _placeholder_ |
| Hierarchy | _placeholder_ |

## Future work

- Edit employee details
- Reassign direct reports (which would unlock removing managers)
- Pagination for large employee lists
- Automated tests
