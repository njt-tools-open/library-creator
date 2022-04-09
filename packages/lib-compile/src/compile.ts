import path from 'path';
import fs from 'fs';

import * as rollup from 'rollup';
import rollupTypescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { sync as delSync } from 'del';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

import logger from '@njt-tools-open/logger';

import { ENVS } from './constants';
import { getModules } from './utils';

interface Options {
  env: ENVS;
  multiple: boolean;
  sourcemap: boolean;
}

interface InputOptions {
  input: string | string[];
  plugins: any[];
}

/** 读取 package 信息 */
function getPkg(): Record<string, any> {
  return JSON.parse(
    fs.readFileSync(path.resolve('./package.json'), {
      encoding: 'utf8',
    })
  );
}
/** 获取环境变量 */
const getEnv = () => {
  try {
    const env = require(path.resolve('lib-cli.env'));
    return env;
  } catch (error) {
    return {};
  }
};

/** 获取当前目录 inputOptions */
const getInputOptions = ({ entry }: { entry: string }) => {
  let compilerOptions = {};
  const typesFile = getPkg().types;
  if (typesFile) {
    compilerOptions = {
      declaration: true,
      declarationDir: path.resolve(typesFile, '..'),
    };
  }
  return {
    input: path.resolve(entry),
    cache: false,
    plugins: [
      nodeResolve({
        preferBuiltins: true,
        browser: true,
      }),
      commonjs({
        include: ['node_modules/**', '../../node_modules/.pnpm/**'],
      }),
      babel({
        babelHelpers: 'bundled',
        include: ['**.js', 'node_modules/**', '../../node_modules/.pnpm/**'],
        presets: ['@babel/preset-env'],
      }),
      rollupTypescript({
        tsconfig: path.resolve('tsconfig.json'),
        compilerOptions,
      }),
      json({
        compact: true,
      }),
      injectProcessEnv(getEnv()),
    ],
  };
};

/** 根据输出个数配置 inputOpitons */
const transformInputPotions = (
  format: string,
  inputOptions: InputOptions,
  treeShking: boolean
) => {
  const newInputOptions = { ...inputOptions };
  if (format === 'esm' && treeShking) {
    newInputOptions.input = [newInputOptions.input as string, ...getModules()];
  }
  return newInputOptions;
};

/** 生成 bannber */
function getBanner(pkg) {
  return [
    '/*!',
    ` * ${pkg.name} - v${pkg.version}`,
    ` * ${pkg.name} is licensed under the MIT License.`,
    ' * http://www.opensource.org/licenses/mit-license',
    ' */',
  ].join('\n');
}

/** 格式化 iife 输出全局命名 */
function formatIIFEName(name) {
  return name
    .replace(/[^\w][a-zA-Z]/g, (s: string) => s[1].toUpperCase())
    .replace(/[^\w]/, '')
    .replace(/^\d+/, '');
}

interface Format {
  key: string;
  format: rollup.ModuleFormat;
  name?: string;
  dir?: string;
}

/** 获取输出任务列表 */
function getTasks({ multiple, sourcemap }) {
  const pkg = getPkg();
  const banner = getBanner(pkg);

  const formats: Format[] = [
    {
      key: 'main',
      format: 'cjs',
    },
    {
      key: 'bundle',
      format: 'iife',
      name: formatIIFEName(pkg.name),
    },
    {
      key: 'module',
      format: 'esm',
    },
  ];
  // multiple 目录处理
  if (multiple) {
    const outputDir = path.resolve(pkg.module, '..');
    const esmFormat = formats.find(({ format }) => format === 'esm') as Format;
    esmFormat.dir = outputDir;
  }
  const tasks = formats
    .filter(({ key }) => typeof pkg[key] !== 'undefined')
    .map(item => {
      if (item.dir) {
        delSync([item.dir]);
      } else {
        delSync([path.resolve(pkg[item.key], '..')]);
      }
      const outputOptions: rollup.OutputOptions = {
        banner,
        name: item.name,
        dir: item.dir,
        file: item.dir ? undefined : path.resolve(pkg[item.key]),
        format: item.format,
        exports: 'auto',
        sourcemap,
      };
      return outputOptions;
    });
  return tasks;
}

let buildingFormats: string[] = [];

const appendBuilding = (format: string) => buildingFormats.push(format);
const removeBuilding = (_format: string) =>
  buildingFormats.splice(
    buildingFormats.findIndex(format => format === _format),
    1
  );
const cleanBuilding = (): void => {
  buildingFormats = [];
};

function buildDev(tasks, inputOptions, treeShking) {
  tasks.forEach(outoutOptions => {
    const watcher = rollup.watch({
      ...transformInputPotions(outoutOptions.format, inputOptions, treeShking),
      output: [outoutOptions],
    });
    watcher.on('event', event => {
      switch (event.code) {
        case 'START':
          appendBuilding(outoutOptions.format);
          buildingFormats.length === 1 && logger.info('Building . . .');
          break;
        case 'END':
          removeBuilding(outoutOptions.format);
          if (buildingFormats.length === 0) {
            logger.success('Build complete.');
            buildingFormats = [];
          }
          break;
        case 'ERROR':
          cleanBuilding();
          logger.error(
            `Build ${outoutOptions.format} fail.\n${JSON.stringify(
              event,
              null,
              2
            )}`
          );
          break;
        default:
      }
    });
  });
}

function buildProd(tasks, inputOptions, treeShking) {
  logger.info('Building . . .');
  async function build(inputOptions, outputOptions) {
    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(outputOptions);
  }

  tasks.forEach(outoutOptions => {
    appendBuilding(outoutOptions.format);
    build(
      transformInputPotions(outoutOptions.format, inputOptions, treeShking),
      outoutOptions
    ).then(() => {
      removeBuilding(outoutOptions.format);
      if (buildingFormats.length === 0) {
        logger.success('Build complete.');
      }
    });
  });
}

function compile(options: Options): void {
  const { env, multiple, sourcemap } = options;
  const entry = './src/index.ts';
  const run = env === ENVS.DEVELOPMENT ? buildDev : buildProd;
  const inputOptions = getInputOptions({ entry });
  const tasks = getTasks({ multiple, sourcemap });
  run(tasks, inputOptions, multiple);
}

export default compile;
