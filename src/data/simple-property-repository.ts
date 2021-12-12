import {join} from 'path';
import {Low, JSONFile} from 'lowdb';
import {ISimpleProperty, SimpleProperty} from './models/property/simple-property/simple-property.js';
import {
	IPropertySingleValue,
} from './models/property/simple-property/property-single-value';
import {
	SimplePropertyExtension,
	SimplePropertyExtensionType,
	simplePropertyFromData,
} from './models/property/simple-property/simple-property-extension.js';
import {
	IPropertyEnumeratedValue,
} from './models/property/simple-property/property-enumerated-value.js';
import {PropertySet} from './models/property-set/property-set.js';
import {IProperty, Property} from './models/property/property.js';
import {PropertySetRepository} from './property-set-repository.js';

interface DbModel {
	PropertySingleValue: IPropertySingleValue[]
	PropertyEnumeratedValue: IPropertyEnumeratedValue[]
}

/**
 * Dummy types. Typescript will throw errors on Missing and Extra
 * if Data is not valid. This to make sure that any refactoring will
 * still keep data structured accordingly in the database.
 * (https://stackoverflow.com/a/51832623/4820091)
*/
type KeysMissingFromData = Exclude<keyof typeof SimplePropertyExtension, keyof DbModel>;
type ExtraKeysInData = {
	[K in keyof DbModel]: Extract<keyof typeof SimplePropertyExtension, K> extends never ? K : never
}[keyof DbModel];
/* eslint-disable no-unused-vars */
type VerifyData<
	Missing extends never = KeysMissingFromData,
	Extra extends never = ExtraKeysInData
	> = 0;
/* eslint-enable */

/**
 * Repository for property sets.
*/
export class SimplePropertyRepository {
	private adapter: JSONFile<DbModel>;
	private db: Low<DbModel>;
	private store: string = join('./store', 'properties', 'simple-properties.json'); ;

	/**
     * Initiated with a connection to the property set database.
    */
	constructor() {
		this.adapter = new JSONFile(this.store);
		this.db = new Low(this.adapter);
	}

	/**
     * list all Properties of one of the subtypes of SimpleProperty
	 * @param  {string} subType
	 * @return {Promise<T[]>} a list of SimpleProperty extending types
	 */
	public async getAllOfSubType<T extends SimpleProperty>(subType: SimplePropertyExtensionType): Promise<T[]> {
		await this.db.read();
		this.db.data[subType] = this.db.data[subType] || [];
		return this.db.data[subType].map((property) => {
			return simplePropertyFromData(property) as T;
		});
	}

	/**
     * list all SimpleProperties
	 * @return {Promise<SimpleProperty[]>} a list of SimpleProperty extending types
	 */
	public async getAll(): Promise<SimpleProperty[]> {
		await this.db.read();
		const properties: SimpleProperty[] = [];
		Object.keys(SimplePropertyExtension).forEach((simplePropertyType) => {
			this.db.data[simplePropertyType] && properties.push(...this.db.data[simplePropertyType]);
		});
		return properties.map((property) => {
			return simplePropertyFromData(property);
		});
	}

	/**
     * list names of all subtypes of SimpleProperty
	 * @return {Promise<string[]>} a list of SimpleProperty extending types
	 */
	public async getAllNames(): Promise<string[]> {
		const properties = await this.getAll();
		const propertyNames = properties.map((property) => property.name.value);

		return propertyNames;
	}

	/**
	 * get one PropertySet (even though all is fetched)
	 * @param  {T} simplePropertyData
	 * @return {Promise<T>} a property of the given type
	 */
	public async get<T extends SimpleProperty>(simplePropertyData: T): Promise<T> {
		const properties = await this.getAllOfSubType(simplePropertyData.type as SimplePropertyExtensionType);

		return properties.find((p) => p.name.value === simplePropertyData.name.value) as T;
	}
	/**
	 * store a Property
	 * @param  {SimpleProperty} property
	 * @return {Promise<SimpleProperty>} the stored property
	 */
	public async add<T extends SimpleProperty>(property: T): Promise<T> {
		await this.db.read();
		if (this.db.data[property.type as SimplePropertyExtensionType]) {
			this.db.data[property.type as SimplePropertyExtensionType].push(property);
		} else {
			this.db.data[property.type as SimplePropertyExtensionType] = [property];
		}

		await this.db.write();
		return property;
	}

	/**
     * update (name and description of) a SimpleProperty
	 * @param  {SimpleProperty} oldProperty
	 * @param  {SimpleProperty} newProperty
	 * @return {Promise<SimpleProperty>} the updated SimpleProperty
	 */
	public async update<T extends SimpleProperty | ISimpleProperty>(
		oldProperty: T,
		newProperty: T,
	): Promise<T> {
		await this.db.read();

		if (
			(await this.getAllNames()).includes(newProperty.name.value) &&
			newProperty.name.value !== oldProperty.name.value
		) {
			throw new Error(`Property with name ${newProperty.name.value} already exists`);
		}
		const type = oldProperty.type as SimplePropertyExtensionType;

		let updated: T;
		this.db.data[type].forEach((p: T) => {
			if (p.name.value === oldProperty.name.value) {
				p.name = newProperty.name;
				p.description = newProperty.description;
				updated = p;
			}
		});

		const propertySetRepository = new PropertySetRepository();
		await propertySetRepository.onPropertyRename(
			oldProperty.name.value,
			newProperty.name.value,
		);

		await this.db.write();

		return this.get(updated); // TODO: get this again...
	}

	/**
     * delete a SimpleProperty
	 * @param  {SimpleProperty} property
	 * @return {Promise<SimpleProperty>} the deleted SimpleProperty
	 */
	public async remove<T extends SimpleProperty | ISimpleProperty>(
		property: T,
	): Promise<T> {
		await this.db.read();

		const type = property.type as SimplePropertyExtensionType;

		// let removed: T;
		this.db.data[type].forEach((p: T, index, object) => {
			if (p.name.value === property.name.value) {
				object.splice(index, 1);
				// removed = p;
			}
		});

		const propertySetRepository = new PropertySetRepository();
		await propertySetRepository.onPropertyDelete(
			property.name.value,
		);

		await this.db.write();

		return property; // TODO: return removed entity instead of inputted one
	}

	/**
     * update connections for a property.
	 * essentially, remove the property from all property sets and add it to the new ones.
	 * @param  {Property} property
	 * @param  {PropertySet[]} propertySetsToBeConnectedTo
	 * @return {Promise<void>} the PropertySets that the property is now part of
	 */
	public async updatePropertySetConnections(
		property: Property | IProperty,
		propertySetsToBeConnectedTo: PropertySet[],
	): Promise<PropertySet[]> {
		const propertySetReferences = propertySetsToBeConnectedTo.map((pSet) => pSet.asPropertySetReference());
		await this.db.read();

		// add to the new property sets
		this.db.data[property.type].map((p: IProperty) => {
			if (p.name.value === property.name.value) {
				p.partOfPset = propertySetReferences;
			}
		});

		await this.db.write();
		return;
	}

	/**
     * Handle renaming of related entity (propertySet of complexProperty)
	 * NOTE: this uses the fact that name.value and name.value are same type for both Property and PropertySet
	 * even though they use Label and Identifier respectively.
	 * @param {string} relatedEntityType
	 * @param {string} oldName
	 * @param {string} newName
	 * @return {Promise<void>} a list of SimpleProperty extending types
	 */
	public async onRelatedEntityRename(
		relatedEntityType: 'PropertySet' | 'ComplexProperty',
		oldName: string,
		newName: string,
	): Promise<void> {
		await this.db.read();

		Object.keys(SimplePropertyExtension).forEach((simplePropertyType) => {
			this.db.data[simplePropertyType] && this.db.data[simplePropertyType].forEach((property) => {
				if (relatedEntityType === 'PropertySet') {
					property.partOfPset.forEach((pSetReference) => {
						if (pSetReference.name.value === oldName) {
							pSetReference.name.value = newName;
						}
					});
				} else if (relatedEntityType === 'ComplexProperty') {
					property.partOfComplex.forEach((complexPropertyReference) => {
						if (complexPropertyReference.name.value === oldName) {
							complexPropertyReference.name.value = newName;
						}
					});
				}
			});
		});

		await this.db.write();
		return;
	}

	/**
     * Handle removal of related entity (propertySet of complexProperty)
	 * NOTE: this uses the fact that name.value and name.value are same type for both Property and PropertySet
	 * even though they use Label and Identifier respectively.
	 * @param {string} relatedEntityType
	 * @param {string} name
	 * @return {Promise<void>} a list of SimpleProperty extending types
	 */
	public async onRelatedEntityDelete(
		relatedEntityType: 'PropertySet' | 'ComplexProperty',
		name: string,
	): Promise<void> {
		await this.db.read();

		Object.keys(SimplePropertyExtension).forEach((simplePropertyType) => {
			this.db.data[simplePropertyType] &&
				this.db.data[simplePropertyType].forEach((property: ISimpleProperty) => {
					if (relatedEntityType === 'PropertySet') {
						property.partOfPset.forEach((pSetReference, index, object) => {
							if (pSetReference.name.value === name) {
								object.splice(index, 1);
							}
						});
					} else if (relatedEntityType === 'ComplexProperty') {
						property.partOfComplex.forEach((complexPropertyReference, index, object) => {
							if (complexPropertyReference.name.value === name) {
								object.splice(index, 1);
							}
						});
					}
				});
		});

		await this.db.write();
		return;
	}
}
