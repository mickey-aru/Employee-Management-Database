-- Employee Management System: database schema
-- Run with:  mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS employee_management;

USE employee_management;

-- Re-running this file gives you a clean table (this DELETES existing employees).
DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,                 -- internal key, never shown to users
    employee_id VARCHAR(20) NOT NULL UNIQUE,           -- user-facing ID, e.g. EMP001
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    level INT NOT NULL,                                -- lower number = more senior
    salary DECIMAL(12,2) NOT NULL,
    joining_date DATE NOT NULL,
    manager_id INT NULL,                               -- NULL for the root employee (CEO)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Self-referencing foreign key: a manager is just another row in this table.
    -- RESTRICT means MySQL refuses to delete a manager who still has direct reports.
    CONSTRAINT fk_employee_manager
        FOREIGN KEY (manager_id)
        REFERENCES employees(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
