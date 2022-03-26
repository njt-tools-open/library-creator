import * as fs from 'fs';
import * as path from 'path';
import openTerminal from 'open-terminal';

/** 判断是否为文件夹 */
const isFolder = (name: string): boolean => {
  try {
    const stats = fs.statSync(name);
    return stats.isDirectory();
  } catch (_error) {
    return false;
  }
};

/** 获取 package 列表 */
function getPackages(folder: string): { name: string; value: string }[] {
  const files = fs.readdirSync(folder);
  const packages: { name: string; value: string }[] = [];
  files.forEach((filename: string) => {
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

interface AnswersModel {
  packages: string[];
}

export function batchExec(script: string) {
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
  ]).then((answers: AnswersModel) => {
    (answers.packages as string[]).map(temp => {
      const command = `cd ${path.join(folder, temp)} && npm run ${script}`;
      return openTerminal(command);
    });
  });
}
