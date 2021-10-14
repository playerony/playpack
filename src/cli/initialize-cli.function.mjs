import { setupCli } from './setup-cli.function.mjs';
import { validateCliParams } from './validate-cli-params.function.mjs';

export const initializeCli = () => {
  const { argv } = setupCli();
  validateCliParams(argv);

  return { entry: argv.entry, output: argv.output, extension: argv.extension };
};
