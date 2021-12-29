import {PropertyEnumerationRepository} from '../../build/data/repositories/property-enumeration-repository.js';
import {PropertySetRepository} from '../../build/data/repositories/property-set-repository.js';
import {Label} from '../../build/data/models/value/simple-value/label.js';
import {Text} from '../../build/data/models/value/simple-value/text.js';
import {Identifier} from '../../build/data/models/value/simple-value/identifier.js';
import {PropertyEnumeration} from '../../build/data/models/property/property-enumeration.js';
import {PropertyEnumeratedValue} from '../../build/data/models/property/simple-property/property-enumerated-value.js';
import {SimplePropertyRepository} from '../../build/data/repositories/simple-property-repository.js';
import {ComplexPropertyRepository} from '../../build/data/repositories/complex-property-repository.js';
import {ComplexProperty} from '../../build/data/models/property/complex-property.js';
import {PropertySet} from '../../build/data/models/property-set/property-set.js';
import data from './data.js';

const propertyEnumerationRepository = new PropertyEnumerationRepository();
const simplePropertyRepository = new SimplePropertyRepository();
const complexPropertyRepository = new ComplexPropertyRepository();
const propertySetRepository = new PropertySetRepository();

const purposes = {};
data.map((purposeRow) => {
	if (!purposes[purposeRow[0]]) purposes[purposeRow[0]] = [];
	if (!purposes[purposeRow[0]][purposeRow[1]]) purposes[purposeRow[0]][purposeRow[1]] = [];
	purposes[purposeRow[0]][purposeRow[1]].push(
		new Label(purposeRow[2]),
	);
});

const complexPropertyNamesWithPropertyReferences = [];

// #region setup and store all property enumerations and the properties pointing to them as well as prepping for complex
const propertyEnumerationsWithProperties = [];

const enumerationPrefix = 'PEnum_Purpose';

Object.keys(purposes).forEach((pZero) => {
	const propertyReferencesForComplex = [];
	Object.keys(purposes[pZero]).forEach((pOne) => {
		const propertyEnumeration = new PropertyEnumeration(
			new Label(
				enumerationPrefix +
					properPropertyName(pOne),
			),
			null, // unit
			purposes[pZero][pOne],
			// .map((pTwo) => {
			//    console.log(pTwo);
			// }),
		);

		const propertyEnumeratedValue = new PropertyEnumeratedValue(
			new Identifier(properPropertyName(pOne)),
			new Text('Allows selecting purposes in the sub-level of: ' + pOne),
			propertyEnumeration.asPropertyEnumerationReference,
		);

		const duplicate = propertyEnumerationsWithProperties.find((pe) => {
			if (pe.propertyEnumeration.name.value === propertyEnumeration.name.value) {
				console.log(
					'duplicate found. first/second contains values:',
					pe.propertyEnumeration.enumerationValues,
					propertyEnumeration.enumerationValues,
				);
				return true;
			};
		});

		if (!duplicate) {
			propertyEnumerationsWithProperties.push({
				propertyEnumeration,
				propertyEnumeratedValue,
			});
		}
		propertyReferencesForComplex.push(
			propertyEnumeratedValue.asPropertyReference,
		);
	});

	complexPropertyNamesWithPropertyReferences.push({
		name: pZero,
		propertyReferences: propertyReferencesForComplex,
	});
});

const createPropertyEnumerationsAndPropertyEnumerationValues = async () => {
	await asyncForEach(propertyEnumerationsWithProperties, async (p) => {
		await propertyEnumerationRepository.add(p.propertyEnumeration);
		await simplePropertyRepository.add(p.propertyEnumeratedValue);
	});
};

await createPropertyEnumerationsAndPropertyEnumerationValues();
// #endregion

// #region add complex properties for levelOne (i.e. Nivå 2)
const complexProperties = [];
const storeComplexProperties = async () => {
	await asyncForEach(complexPropertyNamesWithPropertyReferences, async (c) => {
		const complexProperty = new ComplexProperty(
			new Identifier(properPropertyName(c.name)),
			new Identifier(properPropertyName(c.name)), // usage name
			new Text('Allows selecting purposes in the sub-level of: ' + c.name),
			c.propertyReferences,
		);
		complexProperties.push(complexProperty);
		await complexPropertyRepository.add(complexProperty);
	});
};
await storeComplexProperties();
// #endregion

// #region add all properties from levelOne to levelZero (i.e. Nivå 1)
const mainComplexProperty = new ComplexProperty(
	new Identifier('MainPurpose'),
	new Identifier('MainPurpose'),
	new Text(
		'Contains all purposes in the property catalogue.' +
		'This property has references to all sub-purposes, which in turn holds an enum of the last level.',
	),
	complexProperties.map((p) => p.asPropertyReference),
);
await complexPropertyRepository.add(mainComplexProperty);
// #endregion


// #region add a property set and connect it to the mainComplexProperty
const pSet = new PropertySet(
	// name
	new Label('SweMapAuthPset_PurposeCatalogue'),
	// description
	new Text(
		'The purpose catalogue is a collection of properties that describe ' +
		'the purpose of a building or part of a building.',
	),
);

await propertySetRepository.add(pSet);
await propertySetRepository.updatePropertyConnections(
	mainComplexProperty,
	[pSet],
);
// #endregion

// #region helper functions
/**
 * repositories handles multiple open connections badly. we need a way to close them before opening a new one
 * @param {any} array the array to wait for each to be done
 * @param {function} callback the stuff to wait for
 */
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

/**
 * Ändamålskatalogen describes purposes in swedish as human readable text. This is not great for properties.
 * Ideally we would also translate them here.
 * @param {string} p - the string to properlize
 * @return {string}
 */
function properPropertyName(p) {
	return p
		.replace(/,/g, '') // remove all commas
		.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase()))) // capitalize first letter of each word
		.replace(/\s/g, ''); // remove all spaces
};

// #endregion
