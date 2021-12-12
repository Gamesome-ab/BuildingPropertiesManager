import type {Argv} from 'yargs';
import {handleMainMenu} from '../../queries/main.js';


export const command: string = 'interactive';
export const describe: string = 'Manage properties interactively';

export const builder: {[key:string]: any} = (yargs: Argv) =>
	yargs;

export const handler = async (): Promise<void> => {
	await handleMainMenu();

	// process.exit(0);
};
