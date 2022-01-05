import E from 'enquirer';
import { SimplePropertyRepository, SimplePropertyExtension, } from '@building-properties-manager/core';
import { Logger } from '../../helpers/prompt-helpers.js';
const { Select } = E;
const SelectSimplePropertyExtensionAction = Object.keys(SimplePropertyExtension);
SelectSimplePropertyExtensionAction.push('All');
SelectSimplePropertyExtensionAction.push('Back');
const selectSimplePropertyTypeExtensionPrompt = async () => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'Select the SimpleProperty extension type:',
        choices: SelectSimplePropertyExtensionAction
            .map((key) => ({
            name: key,
            value: key,
            hint: key,
        })),
        required: true,
    });
    return prompt.run();
};
const selectSimplePropertyPrompt = async (extensionType) => {
    const simplePropertyRepository = new SimplePropertyRepository();
    const properties = extensionType === 'All' ?
        await simplePropertyRepository.getAll() :
        await simplePropertyRepository.getAllOfSubType(extensionType);
    if (properties.length === 0) {
        Logger.warn(`No simple properties of type ${extensionType} found`);
        return null;
    }
    if (properties.length >= 1) {
        const prompt = new Select({
            name: 'name',
            message: 'Select a property:',
            // NOTE: Resulting type cast as any due to a bug in
            // type definitions (name is required although it should not be).
            choices: properties.map((p) => ({
                name: `${p.name.value}`,
                value: p.name.value,
                hint: `${extensionType === 'All' ? p.type + ' ' : ''}[${p.asLegibleString}]`,
            })),
            result(res) {
                // NOTE: See https://github.com/enquirer/enquirer/blob/8d626c206733420637660ac7c2098d7de45e8590/examples/multiselect/option-result.js
                // for relevant example. Had to dig in to get to the bottom of this.
                // If we do not do this, it's pretty much impossible to maintain
                // user-friendly display names in options and confirms.
                const choiceNameToValueDict = this.map(res);
                const name = choiceNameToValueDict[res];
                const property = properties.find((p) => p.name.value === name);
                // TODO: Error handling
                return property;
            },
            required: true,
        });
        return prompt.run();
        // const [name] = Object.values(result);
        // return name;
    }
    throw new Error('unexpected result');
};
export const handleSelectSimpleProperty = async () => {
    const extensionType = await selectSimplePropertyTypeExtensionPrompt();
    if (extensionType === 'Back') {
        return null;
    }
    try {
        const property = await selectSimplePropertyPrompt(extensionType);
        return property;
    }
    catch (e) {
        Logger.warn('e', e);
        return null;
    }
};
//# sourceMappingURL=select-simple-property.js.map