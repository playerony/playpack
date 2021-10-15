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

  const { types: t } = babel;
  const content = readFile(filePath);
  const ast = babel.parseSync(content);
  const dependencies = findModuleDependencies(ast, filePath);

  const transformed = babel.transformFromAstSync(ast, content, {
    ast: true,
    plugins: [
      function () {
        return {
          visitor: {
            ImportDeclaration(path) {
              const properties = path.get('specifiers').map((specifier) => {
                const imported = specifier.isImportDefaultSpecifier()
                  ? t.identifier('default')
                  : specifier.get('imported').node;
                const local = specifier.get('local').node;

                return t.objectProperty(imported, local, false, false);
              });
              path.replaceWith(
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.objectPattern(properties),
                    t.callExpression(t.identifier('require'), [
                      t.stringLiteral(resolveImport(filePath)(path.get('source.value').node)),
                    ]),
                  ),
                ]),
              );
            },
            ExportDefaultDeclaration(path) {
              path.replaceWith(
                t.expressionStatement(
                  t.assignmentExpression(
                    '=',
                    t.memberExpression(t.identifier('exports'), t.identifier('default'), false),
                    t.toExpression(path.get('declaration').node),
                  ),
                ),
              );
            },
            ExportNamedDeclaration(path) {
              const declarations = [];
              if (path.has('declaration')) {
                if (path.get('declaration').isFunctionDeclaration()) {
                  declarations.push({
                    name: path.get('declaration.id').node,
                    value: t.toExpression(path.get('declaration').node),
                  });
                } else {
                  path.get('declaration.declarations').forEach((declaration) => {
                    declarations.push({
                      name: declaration.get('id').node,
                      value: declaration.get('init').node,
                    });
                  });
                }
              } else {
                path.get('specifiers').forEach((specifier) => {
                  declarations.push({
                    name: specifier.get('exported').node,
                    value: specifier.get('local').node,
                  });
                });
              }
              path.replaceWithMultiple(
                declarations.map((decl) =>
                  t.expressionStatement(
                    t.assignmentExpression(
                      '=',
                      t.memberExpression(t.identifier('exports'), decl.name, false),
                      decl.value,
                    ),
                  ),
                ),
              );
            },
          },
        };
      },
    ],
  });

  return { ast: transformed.ast, content: transformed.code, filePath, dependencies };
}

export const buildDependencyGraph = createModule;
