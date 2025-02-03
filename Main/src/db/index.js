"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.viewDepartments = viewDepartments;
exports.viewRoles = viewRoles;
exports.viewEmployees = viewEmployees;
exports.addDepartment = addDepartment;
exports.addRole = addRole;
exports.addEmployee = addEmployee;
exports.updateEmployeeRole = updateEmployeeRole;
const inquirer_1 = __importDefault(require("inquirer"));
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});
function viewDepartments() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield exports.pool.query('SELECT * FROM department');
        console.table(rows);
    });
}
function viewRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield exports.pool.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    JOIN department ON role.department_id = department.id`);
        console.table(rows);
    });
}
function viewEmployees() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield exports.pool.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title, 
    department.name AS department, role.salary,
    COALESCE(CONCAT(manager.first_name, ' ', manager.last_name), 'None') AS manager 
    FROM employee 
    JOIN role ON employee.role_id = role.id 
    JOIN department ON role.department_id = department.id 
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`);
        console.table(rows);
    });
}
function addDepartment() {
    return __awaiter(this, void 0, void 0, function* () {
        const { name } = yield inquirer_1.default.prompt([
            { type: 'input', name: 'name', message: 'Enter the name of the department:' }
        ]);
        if (!name) {
            console.log('Department name cannot be empty.');
            return;
        }
        try {
            yield exports.pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
            console.log('Department added!');
        }
        catch (error) {
            console.error('Error adding department:', error);
        }
    });
}
function addRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows: departments } = yield exports.pool.query('SELECT * FROM department');
        const { title, salary, department_id } = yield inquirer_1.default.prompt([
            { type: 'input', name: 'title', message: 'Enter the role title:' },
            { type: 'input', name: 'salary', message: 'Enter the role salary:' },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department:',
                choices: departments.map((dept) => ({ name: dept.name, value: dept.id }))
            }
        ]);
        try {
            yield exports.pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
            console.log('Role added!');
        }
        catch (error) {
            console.error('Error adding role:', error);
        }
    });
}
function addEmployee() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows: roles } = yield exports.pool.query('SELECT * FROM role');
        const { rows: employees } = yield exports.pool.query('SELECT * FROM employee');
        const { first_name, last_name, role_id, manager_id } = yield inquirer_1.default.prompt([
            { type: 'input', name: 'first_name', message: 'Enter the employee first name:' },
            { type: 'input', name: 'last_name', message: 'Enter the employee last name:' },
            { type: 'list', name: 'role_id', message: 'Select the role:', choices: roles.map((role) => ({ name: role.title, value: role.id })) },
            { type: 'list', name: 'manager_id', message: 'Select the manager:',
                choices: [{ name: 'None', value: null }, ...employees.map((emp) => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))] }
        ]);
        yield exports.pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
        console.log('Employee added!');
    });
}
function updateEmployeeRole() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows: employees } = yield exports.pool.query('SELECT * FROM employee');
        const { rows: roles } = yield exports.pool.query('SELECT * FROM role');
        const { employee_id, role_id } = yield inquirer_1.default.prompt([
            { type: 'list', name: 'employee_id', message: 'Select an employee:',
                choices: employees.map((emp) => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })) },
            { type: 'list', name: 'role_id', message: 'Select the new role:',
                choices: roles.map((role) => ({ name: role.title, value: role.id })) }
        ]);
        yield exports.pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
        console.log('Employee role updated!');
    });
}
