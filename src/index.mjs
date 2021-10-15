import fs from 'fs';
import { bundle } from './bundle/bundle.function.mjs';
import { initializeCli } from './cli/initialize-cli.function.mjs';
import { buildDependencyGraph } from './build-dependency-graph/build-dependency-graph.function.mjs';

const { entry, output } = initializeCli();

const projectPath = process.cwd();
const fullOutputPath = `${projectPath}/${output}`;

const dependencyGraph = buildDependencyGraph(entry);
const bundledStuff = bundle(dependencyGraph);

fs.writeFileSync(fullOutputPath, bundledStuff);
