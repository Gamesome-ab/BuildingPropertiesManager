import E from 'enquirer';
import { enquirerPromptWrapper as promptWrapper, NicerConfirm, } from '../../helpers/prompt-helpers.js';
import { handleMainMenu } from '../main.js';
import { handleAddPropertyToPropertySet } from '../relations/connect-property-and-property-set.js';
import { handleAddComplexProperty } from './add-and-edit-complex-property.js';
import { handleAddPropertyEnumeration, handleEditPropertyEnumeration } from './add-and-edit-property-enumeration.js';
import { handleAddSimpleProperty, handleEditSimpleProperty } from './add-and-edit-simple-property.js';
import { selectPropertyEnumerationPrompt } from './select-property-enumeration.js';
import { handleSelectSimpleProperty } from './select-simple-property.js';
const { Select } = E;
export var PropertyAction;
(function (PropertyAction) {
    /* eslint-disable */
    PropertyAction["EDIT_SIMPLE"] = "See / edit existing simple properties";
    PropertyAction["EDIT_COMPLEX"] = "See / edit existing complex properties";
    PropertyAction["EDIT_ENUMERATION"] = "See / edit existing property enumerations";
    PropertyAction["ADD_SIMPLE"] = "Create a simple property";
    PropertyAction["ADD_COMPLEX"] = "Create a complex property";
    PropertyAction["ADD_ENUMERATION"] = "Create an property enumeration to reference in enumerated properties";
    PropertyAction["REMOVE"] = "Delete an existing property";
    PropertyAction["BACK"] = "Back to main menu";
    /* eslint-enable */
})(PropertyAction || (PropertyAction = {}));
const addPropertyToPsetPrompt = async (message) => {
    const prompt = new NicerConfirm({
        message: message,
        name: 'propertyToPropertySet',
    });
    return prompt.run();
};
const managePropertiesPrompt = async () => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'What do you want to do with properties?',
        choices: Object.keys(PropertyAction)
            .map((key) => ({
            name: PropertyAction[key],
            value: key,
            hint: key,
        })),
        required: true,
    });
    return prompt.run();
};
export const handleManageProperties = async () => {
    const action = await promptWrapper(managePropertiesPrompt(), null, handleMainMenu);
    switch (action) {
        case PropertyAction.EDIT_SIMPLE:
            const propertyToUpdate = await handleSelectSimpleProperty();
            if (propertyToUpdate) {
                const updatedProp = await handleEditSimpleProperty(propertyToUpdate);
                if (updatedProp) {
                    await promptWrapper(addPropertyToPsetPrompt('Do you want to edit the property set(s) the property belongs to?'), async (shouldAdd) => {
                        if (shouldAdd.selectedBoolean)
                            await handleAddPropertyToPropertySet(updatedProp);
                    }, handleManageProperties);
                }
            }
            await handleManageProperties();
            break;
        case PropertyAction.EDIT_ENUMERATION:
            await promptWrapper(selectPropertyEnumerationPrompt(), handleEditPropertyEnumeration, handleManageProperties);
            await handleManageProperties();
        case PropertyAction.ADD_SIMPLE:
            const createdSimpleProperty = await handleAddSimpleProperty();
            if (createdSimpleProperty) {
                await promptWrapper(addPropertyToPsetPrompt('Do you want to add this property to a property set?'), async (shouldAdd) => {
                    if (shouldAdd && shouldAdd.selectedBoolean) {
                        await handleAddPropertyToPropertySet(createdSimpleProperty);
                    }
                }, handleManageProperties);
            }
            await handleManageProperties();
            break;
        case PropertyAction.ADD_COMPLEX:
            const createdComplexProperty = await handleAddComplexProperty();
            if (createdComplexProperty) {
                await promptWrapper(addPropertyToPsetPrompt('Do you want to add this property to a property set?'), async (shouldAdd) => {
                    if (shouldAdd && shouldAdd.selectedBoolean) {
                        await handleAddPropertyToPropertySet(createdComplexProperty);
                    }
                }, handleManageProperties);
            }
            await handleManageProperties();
            break;
        case PropertyAction.ADD_ENUMERATION:
            await promptWrapper(handleAddPropertyEnumeration());
            await handleManageProperties();
            break;
        case PropertyAction.BACK:
            await handleMainMenu();
            break;
        default:
            break;
    }
    return;
};
//# sourceMappingURL=manage-properties.js.map