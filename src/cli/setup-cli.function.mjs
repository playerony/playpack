import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const setupCli = () =>
  yargs(hideBin(process.argv))
    .option('entry', {
      alias: 'e',
      type: 'string',
      requiresArg: true,
      describe: 'entry file to start bundling',
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      requiresArg: true,
      describe: 'output file where the code will be bundled',
    })
    .option('extension', {
      alias: 'ex',
      type: 'string',
      requiresArg: true,
      describe: 'file extensions to process',
    })
    .demandOption(['e', 'o', 'ex'])
    .help();
