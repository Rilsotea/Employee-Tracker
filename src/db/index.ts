import inquirer from 'inquirer';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

interface Department {
    id: number;
    name: string;
}

export async function viewDepartments(): Promise<void> {
    const { rows }: { rows: Department[] } = await pool.query('SELECT * FROM department');
    console.table(rows);
}

export async function viewRoles(): Promise<void> {
    const { rows } = await pool.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    JOIN department ON role.department_id = department.id`);
    console.table(rows);
}

export async function viewEmployees(): Promise<void> {
    const { rows } = await pool.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title, 
    department.name AS department, role.salary,
    COALESCE(CONCAT(manager.first_name, ' ', manager.last_name), 'None') AS manager 
    FROM employee 
    JOIN role ON employee.role_id = role.id 
    JOIN department ON role.department_id = department.id 
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`);
    console.table(rows);
}

export async function addDepartment(): Promise<void> {
    const { name } = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Enter the name of the department:' }
    ]);

    if (!name) {
      console.log('Department name cannot be empty.');
      return;
    }

    try {
      await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
      console.log('Department added!');
    } catch (error) {
      console.error('Error adding department:', error);
    }
}

export async function addRole(): Promise<void> {
  const { rows: departments } = await pool.query('SELECT * FROM department');
  const { title, salary, department_id } = await inquirer.prompt([
      { type: 'input', name: 'title', message: 'Enter the role title:' },
      { type: 'input', name: 'salary', message: 'Enter the role salary:' },
      {
          type: 'list',
          name: 'department_id',
          message: 'Select the department:',
          choices: departments.map((dept: Department) => ({ name: dept.name, value: dept.id }))
      }
  ]);

  try {
      await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
      console.log('Role added!');
  } catch (error) {
      console.error('Error adding role:', error);
  }
}

export async function addEmployee(): Promise<void> {
    const { rows: roles } = await pool.query('SELECT * FROM role');
    const { rows: employees } = await pool.query('SELECT * FROM employee');
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
      { type: 'input', name: 'first_name', message: 'Enter the employee first name:' },
      { type: 'input', name: 'last_name', message: 'Enter the employee last name:' },
      { type: 'list', name: 'role_id', message: 'Select the role:', choices: roles.map((role: any) => ({ name: role.title, value: role.id })) },
      { type: 'list', name: 'manager_id', message: 'Select the manager:',
        choices: [{ name: 'None', value: null }, ...employees.map((emp: any) => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })) ] }
    ]);

    await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
      [first_name, last_name, role_id, manager_id]);
    console.log('Employee added!');
}

export async function updateEmployeeRole(): Promise<void> {
    const { rows: employees } = await pool.query('SELECT * FROM employee');
    const { rows: roles } = await pool.query('SELECT * FROM role');
    const { employee_id, role_id } = await inquirer.prompt([
      { type: 'list', name: 'employee_id', message: 'Select an employee:',
        choices: employees.map((emp: any) => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })) },
      { type: 'list', name: 'role_id', message: 'Select the new role:',
        choices: roles.map((role: any) => ({ name: role.title, value: role.id })) }
    ]);
    
    await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
    console.log('Employee role updated!');
}