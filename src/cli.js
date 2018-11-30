import yParser from 'yargs-parser';
import chalk from 'chalk';
import convertor from './index';

const source = process.argv[2];
const target = process.argv[3];
let opts = yParser(process.argv.slice(2));

if (!source || !target) {
  console.log(chalk.yellow(`Source and target path is required.`));
  console.log(chalk.green(`    Usage   : umi-block-convertor [block entry js path] [block target folder path]`));
  console.log(chalk.green(`    Example : umi-block-convertor test/pages/test/index.js ../myblock`));
} else {
  console.log(chalk.green(`start conver ${source} to ${target} ...`));
  if (opts.config) {
    opts = require(opts.config);
  }
  console.log(`options:\n${JSON.stringify(opts, null, 2)}`);
  convertor({
    source,
    target,
    ...opts,
  });
}
