import E from 'enquirer';
import { enquirerPromptWrapper as promptWrapper } from '../helpers/prompt-helpers.js';
import { handleManageProperties } from './properties/manage-properties.js';
import { managePropertySetsPrompt } from './property-sets/manage-property-set.js';
const { Select } = E;
export var MainAction;
(function (MainAction) {
    /* eslint-disable */
    MainAction["PROPERTY_SETS"] = "Property sets";
    MainAction["PROPERTIES"] = "Properties";
    // ENTITIES = "Entities",
    MainAction["QUIT"] = "QUIT";
    /* eslint-enable */
})(MainAction || (MainAction = {}));
export const mainMenu = async () => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'What do you want to manage?',
        choices: Object.keys(MainAction)
            .map((key) => ({
            name: MainAction[key],
            value: key,
            hint: key,
        })),
        required: true,
    });
    return await prompt.run();
};
export const handleMainMenu = async (onCancel) => {
    const main = await promptWrapper(mainMenu(), null, onCancel ? onCancel : () => handleMainMenu(process.exit));
    switch (main) {
        case MainAction.PROPERTY_SETS:
            await managePropertySetsPrompt();
            break;
        case MainAction.PROPERTIES:
            await handleManageProperties();
            break;
        case MainAction.QUIT:
            process.exit(0);
        default:
            break;
    }
};
//# sourceMappingURL=main.js.map