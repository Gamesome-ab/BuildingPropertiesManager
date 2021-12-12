import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import * as interactive from './commands/interactive/interactive.js';

yargs(hideBin(process.argv))
	.command(interactive.command, interactive.describe, interactive.builder, interactive.handler)
// Enable strict mode.
	.strict()
// Useful aliases.
	// .alias({h: 'help'})
	.argv;
