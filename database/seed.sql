-- Employee Management System: sample data
-- Run AFTER schema.sql:  mysql -u root -p < database/seed.sql
--
-- Ids are written explicitly so manager_id values are easy to read.
-- manager_id refers to the internal `id` of the manager's row.
--
-- Resulting hierarchy:
--
-- Amit Sharma (CEO)
-- ├── Rahul Verma (VP Engineering)
-- │   ├── Neha Kapoor (GM Product Engineering)
-- │   │   ├── Arjun Mehta (Engineering Manager)
-- │   │   │   ├── Karthik Reddy
-- │   │   │   └── Divya Pillai
-- │   │   └── Kavya Iyer (Engineering Manager)
-- │   │       ├── Siddharth Joshi
-- │   │       └── Meera Banerjee
-- │   └── Vikram Rao (GM Infrastructure)
-- │       └── Rohan Gupta (DevOps Manager)
-- │           └── Farhan Qureshi
-- └── Priya Nair (VP Operations)
--     ├── Sunita Menon (GM Human Resources)
--     │   └── Anita Desai (HR Manager)
--     │       └── Pooja Singh
--     └── Manish Tiwari (Operations Manager)

USE employee_management;

INSERT INTO employees (id, employee_id, name, role, level, salary, joining_date, manager_id) VALUES
(1,  'EMP001', 'Amit Sharma',      'CEO',                      1, 9500000.00, '2015-04-01', NULL),

(2,  'EMP002', 'Rahul Verma',      'Vice President',           2, 6200000.00, '2016-08-15', 1),
(3,  'EMP003', 'Priya Nair',       'Vice President',           2, 5900000.00, '2017-01-10', 1),

(4,  'EMP004', 'Neha Kapoor',      'General Manager',          3, 3800000.00, '2018-03-05', 2),
(5,  'EMP005', 'Vikram Rao',       'General Manager',          3, 3700000.00, '2018-06-18', 2),
(6,  'EMP006', 'Sunita Menon',     'General Manager',          3, 3500000.00, '2018-09-24', 3),
(7,  'EMP007', 'Manish Tiwari',    'Operations Manager',       4, 2400000.00, '2019-02-11', 3),

(8,  'EMP008', 'Arjun Mehta',      'Engineering Manager',      4, 2600000.00, '2019-07-01', 4),
(9,  'EMP009', 'Kavya Iyer',       'Engineering Manager',      4, 2550000.00, '2019-10-14', 4),
(10, 'EMP010', 'Rohan Gupta',      'DevOps Manager',           4, 2450000.00, '2020-01-20', 5),
(11, 'EMP011', 'Anita Desai',      'HR Manager',               4, 2200000.00, '2020-05-04', 6),

(12, 'EMP012', 'Karthik Reddy',    'Senior Software Engineer', 5, 1800000.00, '2021-03-15', 8),
(13, 'EMP013', 'Divya Pillai',     'Software Engineer',        6, 1200000.00, '2022-06-27', 8),
(14, 'EMP014', 'Siddharth Joshi',  'Software Engineer',        6, 1150000.00, '2023-01-09', 9),
(15, 'EMP015', 'Meera Banerjee',   'QA Engineer',              6, 1000000.00, '2023-08-21', 9),
(16, 'EMP016', 'Farhan Qureshi',   'DevOps Engineer',          5, 1650000.00, '2022-02-14', 10),
(17, 'EMP017', 'Pooja Singh',      'HR Executive',             5,  900000.00, '2023-11-06', 11);
