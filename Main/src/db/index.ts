import inquirer from 'inquirer';

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

async function addDepartment(): Promise<void> {
    const { name } = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Enter the name of the department:' }
    ]);
    await db.query('INSERT INTO department (name) VALUES (?)', [name]);
    console.log('Department added!');
  }
  
  async function addRole(): Promise<void> {
    const [departments] = await db.query('SELECT * FROM department');
    const { title, salary, department_id } = await inquirer.prompt([
      { type: 'input', name: 'title', message: 'Enter the role title:' },
      { type: 'input', name: 'salary', message: 'Enter the role salary:' },
      { type: 'list', name: 'department_id', message: 'Select the department:',
        choices: (departments as any[]).map(dept => ({ name: dept.name, value: dept.id })) }
    ]);
    await db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, department_id]);
    console.log('Role added!');
  }

  async function addEmployee(): Promise<void> {
    const [roles] = await db.query('SELECT * FROM role');
    const [employees] = await db.query('SELECT * FROM employee');
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
      { type: 'input', name: 'first_name', message: 'Enter the employee first name:' },
      { type: 'input', name: 'last_name', message: 'Enter the employee last name:' },
      { type: 'list', name: 'role_id', message: 'Select the role:', choices: (roles as any[]).map(role => ({ name: role.title, value: role.id })) },
      { type: 'list', name: 'manager_id', message: 'Select the manager:',
        choices: [{ name: 'None', value: null }, ... (employees as any[]).map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })) ] }
    ]);
    await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', 
      [first_name, last_name, role_id, manager_id]);
    console.log('Employee added!');
  }
  
  async function updateEmployeeRole(): Promise<void> {
    const [employees] = await db.query('SELECT * FROM employee');
    const [roles] = await db.query('SELECT * FROM role');
    const { employee_id, role_id } = await inquirer.prompt([
      { type: 'list', name: 'employee_id', message: 'Select an employee:',
        choices: (employees as any[]).map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })) },
      { type: 'list', name: 'role_id', message: 'Select the new role:',
        choices: (roles as any[]).map(role => ({ name: role.title, value: role.id })) }
    ]);
    await db.query('UPDATE employee SET role_id = ? WHERE id = ?', [role_id, employee_id]);
    console.log('Employee role updated!');
  }