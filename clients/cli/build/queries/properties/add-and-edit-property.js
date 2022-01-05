import E from 'enquirer';
import { Identifier, Text, PropertyRepositoriesWrapper, } from '@building-properties-manager/core';
import { enquirerPromptWrapper as promptWrapper, } from '../../helpers/prompt-helpers.js';
const { Input } = E;
const namePropertyPrompt = async (propertySubType, old) => {
    const repo = new PropertyRepositoriesWrapper();
    const propertyNames = await repo.getAllNames();
    const firstMessageLine = `What do you want to name the ${propertySubType}?`;
    const prompt = new Input({
        message: firstMessageLine +
            '\n' +
            'It can (probably should) be something human-interpretable, but without spaces and special characters.',
        name: 'propertyName',
        initial: old?.value || 'FireResistance',
        validate: (value) => {
            if (value.length < 1) {
                return prompt.styles.danger('you must submit a name for the property');
            }
            if (value.length >= 255) {
                return prompt.styles.danger('name can\'t be more than 255 characters long');
            }
            if (value.includes('Pset_') || value.includes('pset_')) {
                return prompt.styles.danger('the name should not contain Pset_ or pset_ (that is for property sets)');
            }
            if (propertyNames.includes(value) && old?.value !== value) {
                return prompt.styles.danger('a property with that name already exists');
            }
            return true;
        },
        result: (res) => {
            return new Identifier(res);
        },
    });
    return prompt.run();
};
const describeSimplePropertyPrompt = async (propertyName) => {
    const firstMessageLine = `Describe the property ${propertyName.value}:`;
    const prompt = new Input({
        message: firstMessageLine +
            '\n' +
            'This should be explicit since this and the name should be sufficient ' +
            'to distinguish this from all other properties',
        name: 'propertyDescription',
        initial: 'Some explicit description',
        validate: (value) => {
            if (value.length < 1) {
                return prompt.styles.danger('you must submit a description for the property');
            }
            return true;
        },
        result: (res) => {
            return new Text(res);
        },
    });
    return prompt.run();
};
/**
 * Generic function to add a property of any subtype.
 * @param {PropertyBaseData} data - The data to use for the property.
 * @param {function} superBack - the function to go back to the previous menu
 * @param {function} superNext - the function to go to the next menu
 * @param {number} currentPromptStep - The current prompt step (used only locally)
 * @return {Promise<PropertyBaseData>}
 */
export const handleAddPropertyNameAndDescription = async (data = {}, superBack, superNext, currentPromptStep = 0) => {
    const back = () => {
        return handleAddPropertyNameAndDescription(data, superBack, superNext, currentPromptStep - 1);
    };
    const next = () => {
        return handleAddPropertyNameAndDescription(data, superBack, superNext, currentPromptStep + 1);
    };
    if (currentPromptStep === 0) {
        data.name = await promptWrapper(namePropertyPrompt(data.type, data.name));
        if (!(data.name && data.name.value))
            return superBack();
        else
            return next();
    }
    if (currentPromptStep === 1) {
        data.description = await promptWrapper(describeSimplePropertyPrompt(data.name));
        if (!(data.description && data.description.value))
            return back();
        else
            return superNext(data);
    }
};
/**
 * Generic function to edit base parameters of a property of any subtype.
 * @param {Property} property - the property to edit. Note that this will be modified in place!
 * @param {function} superBack
 * @return {Promise<Property>}
 */
export const handleEditPropertyNameAndDescription = async (property, superBack) => {
    let data = {
        type: property.type,
        name: property.name,
        description: property.description,
    };
    await handleAddPropertyNameAndDescription(data, superBack, (updatedData) => {
        data = updatedData;
    });
    return { ...property, ...data };
};
//# sourceMappingURL=add-and-edit-property.js.map