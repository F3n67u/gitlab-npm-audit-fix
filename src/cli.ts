#!/usr/bin/env node
import { runFromArgs } from './index';

runFromArgs(process.argv.slice(2)).catch(error => {
  console.error('gitlab-npm-audit-fix failed with an error:');
  console.error(error);
  process.exit(1);
});
