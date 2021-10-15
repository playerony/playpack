import fs from 'fs';
import path from 'path';
import babel from '@babel/core';

const isString = (value) => typeof value === 'string';

const getStat = (path) => fs.statSync(path);

const doesFileExist = (path) => fs.accessSync(path);

const readFile = (path) => fs.readFileSync(path, 'utf8');

const isDirectory = (path) => getStat(path).isDirectory();

function validateFilePath(filePath) {
  if (!isString(filePath)) {
    throw new Error('filePath must be a string');
  }

  doesFileExist(filePath);

  if (isDirectory(filePath)) {
    throw new Error('filePath is a directory path');
  }
}

const resolveImport = (filePath) => (relativePath) =>
  path.join(path.dirname(filePath), relativePath);

const findModuleDependencies = (ast, filePath) =>
  ast.program.body
    .filter(({ type }) => type === 'ImportDeclaration')
    .map(({ source }) => source.value)
    .map(resolveImport(filePath))
    .map(createModule);

function createModule(filePath) {
  validateFilePath(filePath);

  const content = readFile(filePath);
  const ast = babel.parseSync(content);
  const dependencies = findModuleDependencies(ast, filePath);

  return { ast, content, filePath, dependencies };
}

export const buildDependencyGraph = createModule;
