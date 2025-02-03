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
exports.mainMenu = mainMenu;
const inquirer_1 = __importDefault(require("inquirer"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = require("./db/index");
const connections_1 = require("./db/connections");
dotenv_1.default.config();
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});
function mainMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const { choice } = yield inquirer_1.default.prompt([
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
                yield pool.end();
                console.log('Goodbye!');
                break;
            }
            switch (choice) {
                case 'View all departments':
                    yield (0, index_1.viewDepartments)();
                    break;
                case 'View all roles':
                    yield (0, index_1.viewRoles)();
                    break;
                case 'View all employees':
                    yield (0, index_1.viewEmployees)();
                    break;
                case 'Add a department':
                    yield (0, index_1.addDepartment)();
                    break;
                case 'Add a role':
                    yield (0, index_1.addRole)();
                    break;
                case 'Add an employee':
                    yield (0, index_1.addEmployee)();
                    break;
                case 'Update an employee role':
                    yield (0, index_1.updateEmployeeRole)();
                    break;
            }
        }
    });
}
const startApp = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, connections_1.connectToDb)();
    mainMenu();
});
startApp();
