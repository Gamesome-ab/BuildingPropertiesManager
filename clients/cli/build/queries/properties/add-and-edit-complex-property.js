import E from 'enquirer';
import colors from 'ansi-colors';
import _ from 'lodash';
import { enquirerPromptWrapper as promptWrapper, NicerConfirm, } from '../../helpers/prompt-helpers.js';
import { handleManageProperties } from './manage-properties.js';
import { Identifier } from '@building-properties-manager/core';
import { handleAddPropertyNameAndDescription, handleEditPropertyNameAndDescription } from './add-and-edit-property.js';
import { PropertyExtension } from '@building-properties-manager/core';
import { ComplexProperty } from '@building-properties-manager/core';
import { handleSelectSimpleProperty } from './select-simple-property.js';
import { ComplexPropertyRepository } from '@building-properties-manager/core';
import { selectComplexPropertyPrompt } from './select-complex-property.js';
const { Select, Input } = E;
const setUsageNamePrompt = async (old) => {
    const firstMessageLine = `What do you want the usage name for the complex property to be?`;
    const prompt = new Input({
        message: firstMessageLine +
            '\n' +
            'Usage description of the IfcComplexProperty within the property set' +
            'which references the IfcComplexProperty.',
        name: 'propertyUsageName',
        initial: old?.value || 'FireResistanceComplex',
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
            return true;
        },
        result: (res) => {
            return new Identifier(res);
        },
    });
    return prompt.run();
};
const selectPropertyExtensionPrompt = async (old) => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'What type of Property do you want to add?',
        choices: Object.keys(PropertyExtension)
            .map((key) => ({
            name: old === key ? colors.yellow(key) : key,
            value: key,
            hint: key,
        })),
        required: true,
    });
    return await prompt.run();
};
const confirmComplexPropertyPrompt = async (complexProperty) => {
    const messageLines = [
        `Property will be saved with this data:`,
        `   ${complexProperty.type}: ${complexProperty.name.value}`,
        `   Description: ${complexProperty.description.value}`,
        `   ${complexProperty.asLegibleString}`,
        `   Is this correct?`,
    ];
    const prompt = new NicerConfirm({
        message: messageLines.join('\n'),
        name: 'propertyConfirmation',
    });
    return prompt.run();
};
const complexPropertyHasPropertiesActionPrompt = async (complexProperty) => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'What do you want to do with the property enumeration?' +
            '\n' +
            `It has ${complexProperty.hasProperties.length} values`,
        choices: Object.keys(ComplexPropertyHasPropertiesAction)
            .map((key) => ({
            name: ComplexPropertyHasPropertiesAction[key],
            value: key,
            hint: key,
        })),
        required: true,
    });
    return prompt.run();
};
export var ComplexPropertyHasPropertiesAction;
(function (ComplexPropertyHasPropertiesAction) {
    /* eslint-disable */
    ComplexPropertyHasPropertiesAction["ADD"] = "Add new property reference to the complex property";
    ComplexPropertyHasPropertiesAction["REMOVE"] = "Remove property reference from the complex property, go back by Ctrl+C";
    ComplexPropertyHasPropertiesAction["CONTINUE"] = "Continue to validating the property and possibly adding it to a property set";
    ComplexPropertyHasPropertiesAction["CANCEL"] = "Discard all edits and go back";
    /* eslint-enable */
})(ComplexPropertyHasPropertiesAction || (ComplexPropertyHasPropertiesAction = {}));
export const handleAddComplexProperty = async (complexProperty = new ComplexProperty(null, null), currentPromptStep = 0) => {
    const back = () => {
        return handleAddComplexProperty(complexProperty, currentPromptStep - 1);
    };
    const next = () => {
        return handleAddComplexProperty(complexProperty, currentPromptStep + 1);
    };
    const loop = () => {
        return handleAddComplexProperty(complexProperty, currentPromptStep);
    };
    if (currentPromptStep === 0) {
        return handleAddPropertyNameAndDescription({
            type: 'ComplexProperty',
            name: complexProperty.name,
            description: complexProperty.description,
        }, () => handleManageProperties(), (nameAndDescription) => {
            complexProperty.name = nameAndDescription.name;
            complexProperty.description = nameAndDescription.description;
            return next();
        });
    }
    if (currentPromptStep === 1) {
        complexProperty.usageName = await promptWrapper(setUsageNamePrompt(complexProperty.usageName || complexProperty.name), null, back);
        if (complexProperty.usageName === null)
            return back();
        else
            return next();
    }
    if (currentPromptStep === 2) {
        const action = await promptWrapper(complexPropertyHasPropertiesActionPrompt(complexProperty), null, back);
        switch (action) {
            case ComplexPropertyHasPropertiesAction.ADD:
                const propertyExtension = await promptWrapper(selectPropertyExtensionPrompt(), null, loop);
                if (propertyExtension === null)
                    return loop();
                if (propertyExtension === 'ComplexProperty') {
                    const selectedComplexProperty = await promptWrapper(selectComplexPropertyPrompt());
                    if (selectedComplexProperty === null)
                        return loop();
                    complexProperty.hasProperties.push(selectedComplexProperty.asPropertyReference);
                    console.log(colors.green('Added complex property reference to the complex property'));
                }
                if (propertyExtension === 'SimpleProperty') {
                    const simpleProperty = await handleSelectSimpleProperty();
                    if (simpleProperty === null)
                        return loop();
                    complexProperty.hasProperties.push(simpleProperty.asPropertyReference);
                    console.log(colors.green('Added simple property reference to the complex property'));
                }
                return loop();
            case ComplexPropertyHasPropertiesAction.CONTINUE:
                return next();
        }
    }
    if (currentPromptStep === 3) {
        const confirm = await promptWrapper(confirmComplexPropertyPrompt(complexProperty));
        if (confirm && confirm.selectedBoolean)
            return next();
        else
            return back();
    }
    const repo = new ComplexPropertyRepository();
    await repo.add(complexProperty);
    return complexProperty;
};
export const handleEditComplexProperty = async (oldSimpleProperty, // TODO: just property!
currentlyEditing = null) => {
    currentlyEditing = currentlyEditing ? currentlyEditing : _.cloneDeep(oldSimpleProperty);
    const editedProp = await handleEditPropertyNameAndDescription(currentlyEditing, handleManageProperties);
    if (!editedProp)
        return handleManageProperties();
    // TODO: Add steps to edit variables on the property
    // no need to confirm changing name and description. they can easily be changed again.
    currentlyEditing = editedProp;
    const repo = new ComplexPropertyRepository();
    const storedProperty = await repo.update(oldSimpleProperty, currentlyEditing);
    return storedProperty;
};
//# sourceMappingURL=add-and-edit-complex-property.js.map