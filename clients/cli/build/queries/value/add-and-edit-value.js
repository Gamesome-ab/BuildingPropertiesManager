import E from 'enquirer';
import colors from 'ansi-colors';
import { SimpleValueExtension, } from '@building-properties-manager/core';
import { ValueExtension } from '@building-properties-manager/core';
const { Select, Input, NumberPrompt } = E;
const selectValueExtensionPrompt = async (old) => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'Select the type of Value to use:',
        choices: Object.keys(ValueExtension)
            .map((key) => ({
            name: old === key ? colors.yellow(key) : key,
            value: key,
            hint: key,
        })),
        required: true,
        result(res) {
            const choiceNameToValueDict = this.map(res);
            const name = choiceNameToValueDict[res];
            return name;
        },
    });
    return await prompt.run();
};
const selectSimpleValueExtensionPrompt = async (old) => {
    const prompt = new Select({
        type: 'select',
        name: 'name',
        message: 'Select the type of SimpleValue to use:',
        choices: Object.keys(SimpleValueExtension)
            .map((key) => ({
            name: old === key ? colors.yellow(key) : key,
            value: key,
            hint: key,
        })),
        required: true,
        result(res) {
            const choiceNameToValueDict = this.map(res);
            const name = choiceNameToValueDict[res];
            return name;
        },
    });
    return await prompt.run();
};
const stringValuePrompt = async (old, limitLength) => {
    const prompt = new Input({
        message: 'Value to store:',
        name: 'string',
        initial: old && old.toString(),
        validate: (value) => {
            if (limitLength && value.length < 1) {
                return prompt.styles.danger('you must enter a value');
            }
            if (limitLength && value.length >= 255) {
                return prompt.styles.danger('value must be less than 255 characters');
            }
            return true;
        },
    });
    return prompt.run();
};
const numericValuePrompt = async (old) => {
    const prompt = new NumberPrompt({
        message: 'Value to store:',
        name: 'number',
        initial: old && Number(old),
    });
    return prompt.run();
};
const booleanValuePrompt = async (old) => {
    const prompt = new Select({
        message: 'Value to store:',
        choices: [true.toString(), false.toString()],
        name: 'boolean',
        initial: old ? old.selectedBoolean.toString() : '',
        result: (res) => {
            return res === true.toString() ? { selectedBoolean: true } : { selectedBoolean: false };
        },
    });
    return prompt.run();
};
export const handleAddAndEditValue = async (withValuePrompt = false, oldValue = null, currentPromptData = {}, currentPromptStep = 0) => {
    if (oldValue) {
        if (!currentPromptData.mainValueType) {
            currentPromptData.mainValueType = Object.keys(SimpleValueExtension).includes(oldValue.type) ?
                'SimpleValue' :
                'SimpleValue'; // i.e not implemented
        }
        if (!currentPromptData.subValueType) {
            currentPromptData.subValueType = oldValue.type; // TODO: Implement other types!
            if (!currentPromptData.value) {
                currentPromptData.value = oldValue.value; // TODO: Implement other types!
            }
        }
    }
    if (currentPromptStep === 0) {
        const mainValueType = await selectValueExtensionPrompt(currentPromptData.mainValueType);
        if (!mainValueType) {
            return null; // cancel
        }
        currentPromptData.mainValueType = mainValueType;
        currentPromptStep++;
    }
    if (currentPromptStep === 1) {
        if (currentPromptData.mainValueType === 'SimpleValue') {
            const simpleValueExtension = await selectSimpleValueExtensionPrompt(currentPromptData.subValueType);
            if (!simpleValueExtension) {
                handleAddAndEditValue(withValuePrompt, oldValue, currentPromptData, currentPromptStep - 1);
            }
            currentPromptData.subValueType = simpleValueExtension;
        }
        else {
            throw new Error('not implemented');
        }
        currentPromptStep++;
    }
    if (currentPromptStep === 2) {
        if (withValuePrompt) {
            if (currentPromptData.mainValueType === 'SimpleValue') {
                switch (currentPromptData.subValueType) {
                    case 'Label':
                    case 'Identifier':
                        currentPromptData.value = await stringValuePrompt(currentPromptData.value, true);
                        break;
                    case 'Text':
                        currentPromptData.value = await stringValuePrompt(currentPromptData.value, false);
                        break;
                    case 'Binary':
                        currentPromptData.value = await numericValuePrompt(currentPromptData.value);
                        break;
                    case 'Boolean':
                        currentPromptData.value = await (await booleanValuePrompt({ selectedBoolean: currentPromptData.value })).selectedBoolean;
                        break;
                    default:
                        throw new Error(`Unhandled SimpleValueExtensionType: ${currentPromptData.subValueType}`);
                }
            }
        }
        const value = Reflect.construct(SimpleValueExtension[currentPromptData.subValueType], [currentPromptData.value]);
        return value;
    }
    // TODO: add optional step to set a value (for enumerations)
};
//# sourceMappingURL=add-and-edit-value.js.map