import fs from 'fs';
import { initializeCli } from './cli/initialize-cli.function.mjs';

const { output } = initializeCli();

const projectPath = process.cwd();
const fullOutputPath = `${projectPath}/${output}`;

fs.writeFileSync(fullOutputPath, 'console.log("it works!");');
