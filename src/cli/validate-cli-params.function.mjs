import fs from 'fs';

const validateExtension = (extension) => {
  if (extension !== 'js') {
    throw new Error('this plugin only accepts *.js extension.');
  }
};

const getFileExtension = (filename) => filename.split('.').pop();

const validateEntry = (entry, { extension }) => {
  const projectPath = process.cwd();
  const fullPath = `${projectPath}/${entry}`;

  if (getFileExtension(entry) !== extension) {
    throw new Error('The entry file does not have a *.js extension.');
  }

  try {
    fs.statSync(fullPath);
  } catch {
    throw new Error(`Entry file "${entry}" with fullpath "${fullPath}" was not found.`);
  }
};

const validateOutput = (output) => {
  if (getFileExtension(output) !== 'js') {
    throw new Error(`The output filename does not have a *.js extension.`);
  }
};

const validatorByKey = {
  extension: validateExtension,
  entry: validateEntry,
  output: validateOutput,
};

export const validateCliParams = (params) =>
  Object.keys(validatorByKey).forEach((_key) => validatorByKey[_key](params[_key], params));
