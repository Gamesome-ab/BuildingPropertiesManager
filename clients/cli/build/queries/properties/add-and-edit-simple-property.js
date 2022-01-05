import E from 'enquirer';
import colors from 'ansi-colors';
import _ from 'lodash';
import { SimplePropertyRepository, PropertySingleValue, SimplePropertyExtension, PropertyEnumeratedValue, } from '@building-properties-manager/core';
import { enquirerPromptWrapper as promptWrapper, NicerConfirm, } from '../../helpers/prompt-helpers.js';
import { handleManageProperties } from './manage-properties.js';
import { handleAddPropertyNameAndDescription, handleEditPropertyNameAndDescription } from './add-and-edit-property.js';
import { handleAddAndEditValue } from '../value/add-and-edit-value.js';
import { selectPropertyEnumerationPrompt } from './select-property-enumeration.js';
const { Select } = E;
export const selectSimplePropertyExtensionPrompt = async (old) => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'What type of SimpleProperty do you want to add?',
        choices: Object.keys(SimplePropertyExtension)
            .map((key) => ({
            name: old === key ? colors.yellow(key) : key,
            value: key,
            hint: key,
        })),
        required: true,
    });
    return await prompt.run();
};
const confirmSimplePropertyPrompt = async (simpleProperty) => {
    const messageLines = [
        `Property will be saved with this data:`,
        `   ${simpleProperty.type}: ${simpleProperty.name.value}`,
        `   Description: ${simpleProperty.description.value}`,
        `   ${simpleProperty.asLegibleString}`,
        `   Is this correct?`,
    ];
    const prompt = new NicerConfirm({
        message: messageLines.join('\n'),
        name: 'propertyConfirmation',
    });
    return prompt.run();
};
export const handleAddSimpleProperty = async (simplePropertyExtensionType = null, name = null, description = null, simpleProperty = null, currentPromptStep = 0) => {
    const reset = () => {
        return handleAddSimpleProperty();
    };
    const back = () => {
        return handleAddSimpleProperty(simplePropertyExtensionType, name, description, simpleProperty, currentPromptStep - 1);
    };
    const next = () => {
        return handleAddSimpleProperty(simplePropertyExtensionType, name, description, simpleProperty, currentPromptStep + 1);
    };
    if (currentPromptStep === 0) {
        simplePropertyExtensionType = await promptWrapper(selectSimplePropertyExtensionPrompt(simplePropertyExtensionType));
        if (!(simplePropertyExtensionType &&
            Object.keys(SimplePropertyExtension).includes(simplePropertyExtensionType))) {
            return handleManageProperties();
        }
        currentPromptStep++;
    }
    if (currentPromptStep === 1) {
        return await handleAddPropertyNameAndDescription({
            type: simplePropertyExtensionType,
            name: name,
            description: description,
        }, () => handleManageProperties(), (nameAndDescription) => {
            name = nameAndDescription.name;
            description = nameAndDescription.description;
            return next();
        });
    }
    if (currentPromptStep === 2) {
        if (simplePropertyExtensionType === 'PropertySingleValue') {
            const value = await promptWrapper(handleAddAndEditValue(false, simpleProperty?.type === 'PropertySingleValue' ?
                simpleProperty.nominalValue :
                null), null, back);
            // TODO: allow to set unit
            if (value) {
                simpleProperty = new PropertySingleValue(name, description, value, null);
            }
        }
        else if (simplePropertyExtensionType === 'PropertyEnumeratedValue') {
            // NOTE: we don't use a connector since this is just a pointer and not reflected to the enumeration
            const enumeration = await promptWrapper(selectPropertyEnumerationPrompt(simpleProperty?.type === 'PropertyEnumeratedValue' ?
                simpleProperty.enumerationReference :
                null), null, back);
            // happens when there where no enumerations. reset, not back, because we want to reuse name
            if (enumeration === null)
                return reset();
            if (enumeration) {
                simpleProperty = new PropertyEnumeratedValue(name, description, enumeration.asPropertyEnumerationReference);
            }
        }
        else {
            throw new Error('not implemented');
        }
        if (!simpleProperty) {
            // request was cancelled or we got a bad value, go back to the previous step
            return back();
        }
        currentPromptStep++;
    }
    if (currentPromptStep === 3) {
        const confirm = await promptWrapper(confirmSimplePropertyPrompt(simpleProperty));
        if (confirm && confirm.selectedBoolean)
            return next();
        else
            return back();
    }
    const repo = new SimplePropertyRepository();
    await repo.add(simpleProperty);
    return simpleProperty;
};
export const handleEditSimpleProperty = async (oldSimpleProperty, // TODO: just property!
currentlyEditing = null) => {
    currentlyEditing = currentlyEditing ? currentlyEditing : _.cloneDeep(oldSimpleProperty);
    const editedProp = await handleEditPropertyNameAndDescription(currentlyEditing, handleManageProperties);
    if (!editedProp)
        return handleManageProperties();
    // TODO: Add steps to edit variables on the property
    // no need to confirm changing name and description. they can easily be changed again.
    currentlyEditing = editedProp;
    const repo = new SimplePropertyRepository();
    const storedProperty = await repo.update(oldSimpleProperty, currentlyEditing);
    return storedProperty;
};
//# sourceMappingURL=add-and-edit-simple-property.js.map