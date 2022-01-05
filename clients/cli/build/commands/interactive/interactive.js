import { handleMainMenu } from '../../queries/main.js';
export const command = 'interactive';
export const describe = 'Manage properties interactively';
export const builder = (yargs) => yargs;
export const handler = async () => {
    await handleMainMenu();
    // process.exit(0);
};
//# sourceMappingURL=interactive.js.map