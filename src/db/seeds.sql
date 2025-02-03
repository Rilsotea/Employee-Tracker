INSERT INTO department (name) VALUES
('Engineering'),
('Finance'),
('Human Resources'),
('Marketing');

INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 80000, 1),
('Senior Engineer', 120000, 1),
('Accountant', 70000, 2),
('HR Manager', 90000, 3),
('Marketing Specialist', 75000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Joe', 'Jim', 1, NULL),
('Bob', 'Hunter', 2, 1),
('Steve', 'Will', 3, NULL),
('Charles', 'Jones', 4, NULL),
('Trevor', 'Sam', 5, NULL);