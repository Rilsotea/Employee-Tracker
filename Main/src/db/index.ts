import inquirer from 'inquirer';
import { db } from './connection';


export async function mainMenu(): Promise<void> {
  while (true) {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      }
    ]);

    if (choice === 'Exit') {
      await db.end();
      console.log('Goodbye!');
      break;
    }

    switch (choice) {
      case 'View all departments':
        await viewDepartments();
        break;
      case 'View all roles':
        await viewRoles();
        break;
      case 'View all employees':
        await viewEmployees();
        break;
      case 'Add a department':
        await addDepartment();
        break;
      case 'Add a role':
        await addRole();
        break;
      case 'Add an employee':
        await addEmployee();
        break;
      case 'Update an employee role':
        await updateEmployeeRole();
        break;
    }
  }
}

async function viewDepartments(): Promise<void> {
    const [rows] = await db.query('SELECT * FROM department');
    console.table(rows);
}

async function viewRoles(): Promise<void> {
    const [rows] = await db.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    JOIN department ON role.department_id = department.id`);
    console.table(rows);
}

async function viewEmployees(): Promise<void> {
    const [rows] = await db.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title, 
    department.name AS department, role.salary,
    COALESCE(CONCAT(manager.first_name, ' ', manager.last_name), 'None') AS manager 
    FROM employee 
    JOIN role ON employee.role_id = role.id 
    JOIN department ON role.department_id = department.id 
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`);
    console.table(rows);
}