"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchExec = void 0;
const fs = require("fs");
const path = require("path");
const open_terminal_1 = require("open-terminal");
/** 判断是否为文件夹 */
const isFolder = (name) => {
    try {
        const stats = fs.statSync(name);
        return stats.isDirectory();
    }
    catch (_error) {
        return false;
    }
};
/** 获取 package 列表 */
function getPackages(folder) {
    const files = fs.readdirSync(folder);
    const packages = [];
    files.forEach((filename) => {
        if (isFolder(path.join(folder, filename))) {
            packages.push({
                name: filename,
                value: filename,
            });
        }
    });
    return packages;
}
const inquirer = require('inquirer');
function batchExec(script) {
    const folder = path.resolve('../packages');
    const packages = getPackages(folder);
    const prompt = inquirer.createPromptModule();
    prompt([
        {
            type: 'checkbox',
            name: 'packages',
            message: 'Packages',
            pageSize: 15,
            choices: packages,
        },
    ]).then((answers) => {
        answers.packages.map(temp => {
            const command = `cd ${path.join(folder, temp)} && npm run ${script}`;
            return (0, open_terminal_1.default)(command);
        });
    });
}
exports.batchExec = batchExec;
