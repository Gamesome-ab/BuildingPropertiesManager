import E from 'enquirer';
import _ from 'lodash';
import { PropertyEnumeration, Label, PropertyEnumerationRepository, } from '@building-properties-manager/core';
import { enquirerPromptWrapper as promptWrapper } from '../../helpers/prompt-helpers.js';
import { handleAddAndEditValue } from '../value/add-and-edit-value.js';
const { Select, Input } = E;
const namePropertyEnumerationPrompt = async (editablePropertyEnumeration) => {
    const propertyEnumerationRepository = new PropertyEnumerationRepository();
    const pEnums = await propertyEnumerationRepository.getAll();
    const pEnumNames = pEnums.map((pEnum) => pEnum.name.value.toString());
    const prompt = new Input({
        message: 'What should the property enumeration be called?' +
            '\n' +
            'It should begin with PEnum_',
        name: 'pset_name',
        initial: editablePropertyEnumeration?.name?.value,
        validate: (value) => {
            if (value.length < 1) {
                return prompt.styles.danger('you must submit a name for the property enumeration');
            }
            if (value.length >= 255) {
                return prompt.styles.danger('name can\'t be more than 255 characters long');
            }
            if (value === 'PEnum_SomeEnumerationName') {
                return prompt.styles.danger('you should be more specific than using the default name');
            }
            if (!value.includes('PEnum_')) {
                return prompt.styles.danger('the name must contain PEnum_');
            }
            if (value.split('_').length > 2) {
                return prompt.styles.danger('you can only use one prefix in the name (use only one underscore)');
            }
            if (pEnumNames.includes(value) && value !== editablePropertyEnumeration.name.value) {
                return prompt.styles.danger('a property enumeration with that name already exists');
            }
            return true;
        },
        result: (res) => {
            return new Label(res);
        },
    });
    return prompt.run();
};
const propertyEnumerationValueActionPrompt = async (propertyEnumeration) => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'What do you want to do with the property enumeration?' +
            '\n' +
            `It has ${propertyEnumeration.enumerationValues.length} values`,
        choices: Object.keys(PropertyEnumerationValueAction)
            .map((key) => ({
            name: PropertyEnumerationValueAction[key],
            value: key,
            hint: key,
        })),
        required: true,
    });
    return prompt.run();
};
const selectPropertyEnumerationPrompt = async (propertyEnumeration) => {
    const prompt = new Select({
        type: 'select',
        name: 'value',
        message: 'Select the value you want to edit:',
        choices: propertyEnumeration.enumerationValues
            .map((simpleValue, index) => ({
            name: simpleValue.type,
            value: { index },
            hint: `Type: ${simpleValue.type}, value: ${simpleValue.value}`,
        })),
        required: true,
        result(res) {
            const choiceNameToValueDict = this.map(res);
            const index = choiceNameToValueDict[res];
            return index;
        },
    });
    return prompt.run();
};
export var PropertyEnumerationValueAction;
(function (PropertyEnumerationValueAction) {
    /* eslint-disable */
    PropertyEnumerationValueAction["ADD"] = "Add new value to the enumeration";
    PropertyEnumerationValueAction["EDIT"] = "See / edit existing value on the enumeration";
    PropertyEnumerationValueAction["REMOVE"] = "Remove value from the enumeration";
    PropertyEnumerationValueAction["SAVE"] = "Store all edits and go back";
    PropertyEnumerationValueAction["CANCEL"] = "Discard all edits and go back";
    /* eslint-enable */
})(PropertyEnumerationValueAction || (PropertyEnumerationValueAction = {}));
export const handleAddPropertyEnumeration = async (oldPropertyEnumeration = null, currentlyEditing, currentPromptStep = 0) => {
    const propertyEnumerationRepository = new PropertyEnumerationRepository();
    return await handleAddAndEditPropertyEnumeration(oldPropertyEnumeration, currentlyEditing, currentPromptStep, async (created) => await propertyEnumerationRepository.add(created));
};
export const handleEditPropertyEnumeration = async (oldPropertyEnumeration = null, currentlyEditing, currentPromptStep = 0) => {
    const propertyEnumerationRepository = new PropertyEnumerationRepository();
    return await handleAddAndEditPropertyEnumeration(oldPropertyEnumeration, currentlyEditing, currentPromptStep, async (updated) => await propertyEnumerationRepository.update(oldPropertyEnumeration, updated));
};
const handleAddAndEditPropertyEnumeration = async (oldPropertyEnumeration = null, currentlyEditing = null, currentPromptStep = 0, onSave) => {
    if (oldPropertyEnumeration) {
        currentlyEditing = currentlyEditing || _.cloneDeep(oldPropertyEnumeration);
    }
    if (!currentlyEditing) {
        currentlyEditing = new PropertyEnumeration(new Label('PEnum_SomeEnumerationName'));
    }
    if (currentPromptStep === 0) {
        const name = await namePropertyEnumerationPrompt(currentlyEditing);
        if (!name) {
            return null; // cancel
        }
        currentlyEditing.name = name;
        currentPromptStep++;
    }
    // TODO: add step to allow a Unit to be set
    if (currentPromptStep === 1) {
        const action = await promptWrapper(propertyEnumerationValueActionPrompt(currentlyEditing), null, async () => await handleAddAndEditPropertyEnumeration(oldPropertyEnumeration, currentlyEditing, currentPromptStep - 1, onSave));
        switch (action) {
            case PropertyEnumerationValueAction.ADD:
                const value = await promptWrapper(handleAddAndEditValue(true));
                if (value) {
                    currentlyEditing.enumerationValues.push(value);
                }
                await handleAddAndEditPropertyEnumeration(oldPropertyEnumeration, currentlyEditing, currentPromptStep, onSave);
                break;
            case PropertyEnumerationValueAction.EDIT:
                const valueIndexToEdit = await promptWrapper(selectPropertyEnumerationPrompt(currentlyEditing));
                if (valueIndexToEdit) {
                    const updatedValue = await promptWrapper(handleAddAndEditValue(true, currentlyEditing.enumerationValues[valueIndexToEdit.index]));
                    if (updatedValue) {
                        currentlyEditing.enumerationValues[valueIndexToEdit.index] = updatedValue;
                    }
                }
                await handleAddAndEditPropertyEnumeration(oldPropertyEnumeration, currentlyEditing, currentPromptStep, onSave);
                break;
            case PropertyEnumerationValueAction.REMOVE:
                break;
            case PropertyEnumerationValueAction.SAVE:
                await onSave(currentlyEditing);
                return;
            case PropertyEnumerationValueAction.CANCEL:
                return;
            default:
                return;
        }
    }
};
//# sourceMappingURL=add-and-edit-property-enumeration.js.map