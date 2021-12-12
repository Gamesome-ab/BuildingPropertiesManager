import E from 'enquirer';
import colors from 'ansi-colors';
import {enquirerPromptWrapper as promptWrapper} from '../../helpers/prompt-helpers.js';
import {handleManageProperties} from './manage-properties.js';
import {SimplePropertyRepository} from '../../data/simple-property-repository.js';
import {Identifier} from '../../data/models/value/simple-value/identifier.js';
import {Text} from '../../data/models/value/simple-value/text.js';
import {
	SimpleValueExtension,
	SimpleValueExtensionType,
} from '../../data/models/value/simple-value/simple-value-extension.js';
import {PropertySingleValue} from '../../data/models/property/simple-property/property-single-value.js';
import {
	SimplePropertyExtension,
	SimplePropertyExtensionType,
} from '../../data/models/property/simple-property/simple-property-extension.js';
import {SimpleProperty} from '../../data/models/property/simple-property/simple-property.js';
import _ from 'lodash';

const {Select, Input, Confirm} = E as any;


const selectSimplePropertyExtensionPrompt = async (
	old?: SimplePropertyExtensionType,
): Promise<SimplePropertyExtensionType> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What type of SimpleProperty do you want to add?',
		choices: Object.keys(SimplePropertyExtension)
			.map( (key) => ({
				name: old === key ? colors.yellow(key) : key,
				value: key,
				hint: key,
			})),
		required: true,

	});

	return await prompt.run();
};

const selectSingleValueExtensionPrompt = async (old?: string): Promise<SimpleValueExtensionType> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What type of SimpleValue should the property hold?',
		choices: Object.keys(SimpleValueExtension)
			.map( (key) => ({
				name: old === key ? colors.yellow(key) : key,
				value: key,
				hint: key,
			})),
		required: true,

	});

	return await prompt.run();
};

const nameSimplePropertyPrompt = async (
	simplePropertySubType: SimplePropertyExtensionType,
	old?: Identifier,
): Promise<Identifier> => {
	const repo = new SimplePropertyRepository();
	const simpleProperties = await repo.getAllOfSubType(simplePropertySubType);
	const simplePropertyNames = simpleProperties.map((p) => p.name.value.toString()); // TODO: search all types of properties

	const firstMessageLine = `What do you want to name the ${simplePropertySubType}?`;

	const prompt = new Input({
		message:
            firstMessageLine +
            '\n' +
            'It can (probably should) be something human-interpretable, but without spaces and special characters.',
		name: 'propertyName',
		initial: old?.value || 'FireResistance',
		validate: (value: string) => {
			if (value.length < 1) {
				return prompt.styles.danger('you must submit a name for the property');
			}
			if (value.length >= 255) {
				return prompt.styles.danger('name can\'t be more than 255 characters long');
			}
			if (value.includes('Pset_') || value.includes('pset_')) {
				return prompt.styles.danger('the name should not contain Pset_ or pset_ (that is for property sets)');
			}
			if (simplePropertyNames.includes(value) && old?.value !== value) {
				return prompt.styles.danger('a property set with that name already exists');
			}
			return true;
		},
		result: (res: string): Identifier => {
			return new Identifier(res);
		},
	});

	return prompt.run();
};

const describeSimplePropertyPrompt = async (
	simplePropertySubType: SimplePropertyExtensionType,
	propertyName: Identifier,
): Promise<Text> => {
	const firstMessageLine = `Describe the ${simplePropertySubType} ${propertyName.value}:`;

	const prompt = new Input({
		message:
            firstMessageLine +
            '\n' +
            'This should be explicit since this and the name should be sufficient' +
            'to distinguish this from all other properties',
		name: 'propertyDescription',
		initial: 'Some explicit description',
		validate: (value) => {
			if (value.length < 1) {
				return prompt.styles.danger('you must submit a description for the property');
			}
			return true;
		},
		result: (res: string): Text => {
			return new Text(res);
		},
	});

	return prompt.run();
};

const confirmSimplePropertyPrompt = async (
	simplePropertySubType: SimplePropertyExtensionType,
	propertyName: Identifier,
	description: Text,
): Promise<boolean> => {
	const firstMessageLine = `Property will be saved with this data:`;
	const secondMessageLine = `${simplePropertySubType}: ${propertyName.value}`;
	const thirdMessageLine = `Description: ${description.value}`;
	const fourthMessageLine = `Is this correct?`;

	const prompt = new Confirm({
		message: [firstMessageLine, secondMessageLine, thirdMessageLine, fourthMessageLine].join('\n'),
		name: 'propertyDescription',
		initial: 'y',
	});

	return prompt.run();
};

export const handleAddSimpleProperty = async (
	simplePropertyExtensionType: SimplePropertyExtensionType = null,
	simpleValueExtensionType: SimpleValueExtensionType = null,
	propertyName : Identifier = null,
	description : Text = null,
	currentPromptStep: number = 0,
): Promise<SimpleProperty | void> => {
	if (currentPromptStep === 0) {
		simplePropertyExtensionType = await promptWrapper(
			selectSimplePropertyExtensionPrompt(simplePropertyExtensionType),
		);
		if (!(
			simplePropertyExtensionType &&
			Object.keys(SimplePropertyExtension).includes(simplePropertyExtensionType)
		)) {
			// request was probably cancelled. go back to the previous menu
			return handleManageProperties();
		}
		currentPromptStep ++;
	}
	if (currentPromptStep === 1) {
		simpleValueExtensionType = await promptWrapper(
			selectSingleValueExtensionPrompt(simpleValueExtensionType),
		);
		if (!(simpleValueExtensionType && Object.keys(SimpleValueExtension).includes(simpleValueExtensionType))) {
			// request was probably cancelled, go back to the previous step
			return handleAddSimpleProperty(
				simplePropertyExtensionType,
				simpleValueExtensionType,
				propertyName,
				description,
				currentPromptStep - 1,
			);
		}
		currentPromptStep ++;
	}
	if (currentPromptStep === 2) {
		propertyName = await promptWrapper(
			nameSimplePropertyPrompt(simplePropertyExtensionType, propertyName),
		);
		if (!(propertyName && propertyName.value)) {
			// request was probably cancelled. go back to the previous prompt.
			return handleAddSimpleProperty(
				simplePropertyExtensionType,
				simpleValueExtensionType,
				propertyName,
				description,
				currentPromptStep - 1,
			);
		}
		currentPromptStep ++;
	}
	if (currentPromptStep === 3) {
		description = await promptWrapper(
			describeSimplePropertyPrompt(simplePropertyExtensionType, propertyName),
		);
		if (!(description && description.value)) {
			// request was probably cancelled. go back to the previous prompt.
			return handleAddSimpleProperty(
				simplePropertyExtensionType,
				simpleValueExtensionType,
				propertyName,
				description,
				currentPromptStep - 1,
			);
		}
		currentPromptStep ++;
	}
	if (currentPromptStep === 4) {
		const confirm = await promptWrapper(
			confirmSimplePropertyPrompt(simplePropertyExtensionType, propertyName, description),
		);
		if (!confirm) {
			// request was probably cancelled. go back to the previous prompt.
			return handleAddSimpleProperty(
				simplePropertyExtensionType,
				simpleValueExtensionType,
				propertyName,
				description,
				currentPromptStep - 1,
			);
		}
	}

	const newProperty = new PropertySingleValue(
		propertyName,
		description,
		new SimpleValueExtension[simpleValueExtensionType](),
		null,
	);

	const repo = new SimplePropertyRepository();

	await repo.add(newProperty);

	return newProperty;
};

export const handleEditSimpleProperty = async (
	oldSimpleProperty: SimpleProperty,
	currentlyEditing: SimpleProperty = null,
	currentPromptStep: number = 0,
): Promise<SimpleProperty | void> => {
	currentlyEditing = currentlyEditing ? currentlyEditing : _.cloneDeep(oldSimpleProperty);
	if (currentPromptStep === 0) {
		const name: Identifier = await promptWrapper(
			nameSimplePropertyPrompt(currentlyEditing.type as SimplePropertyExtensionType, currentlyEditing.name),
		);
		if (!(name && name.value)) {
			// request was probably cancelled. go back to the previous prompt.
			return handleEditSimpleProperty(
				oldSimpleProperty,
				currentlyEditing,
				currentPromptStep - 1,
			);
		}
		currentlyEditing.name = name;
		currentPromptStep ++;
	}
	if (currentPromptStep === 1) {
		const description: Text = await promptWrapper(
			describeSimplePropertyPrompt(currentlyEditing.type as SimplePropertyExtensionType, currentlyEditing.name),
		);
		if (!(description && description.value)) {
			// request was probably cancelled. go back to the previous prompt.
			return handleEditSimpleProperty(
				oldSimpleProperty,
				currentlyEditing,
				currentPromptStep - 1,
			);
		}
		currentlyEditing.description = description;
	}
	// no need to confirm changing name and description. they can easily be changed again.

	const repo = new SimplePropertyRepository();

	const storedProperty = await repo.update(oldSimpleProperty, currentlyEditing);

	return storedProperty;
};
