#!/usr/bin/env ts-node-esm

/* eslint-disable no-console */

import fs from 'fs/promises';
import shell from './helpers/shell.ts';
import fileExists from './helpers/fileExists.ts';
import projectPath from './helpers/projectPath.ts';

const demoConfigNeeded = !(await fileExists('demo/config.ts'));

if (demoConfigNeeded) {
  await fs.copyFile(
    projectPath('demo/config.template.ts'),
    projectPath('demo/config.ts'),
  );
}

await shell('yarn', ['--cwd', projectPath('hardhat')]);
await shell('yarn', ['--cwd', projectPath('hardhat'), 'hardhat', 'compile']);

console.log('Setup success 🔥');

if (demoConfigNeeded) {
  console.log('demo/config.ts can be edited to suit your needs');
}

console.log('Use `yarn dev` to start the dev server');
