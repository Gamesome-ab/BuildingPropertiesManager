import {join} from 'path';
import {Low, JSONFile} from 'lowdb';
import {ISimpleProperty, SimpleProperty} from '../models/property/simple-property/simple-property.js';
import {
	IPropertySingleValue,
} from '../models/property/simple-property/property-single-value';
import {
	SimplePropertyExtension,
	SimplePropertyExtensionType,
	someSimplePropertyFromData,
} from '../models/property/simple-property/simple-property-extension.js';
import {
	IPropertyEnumeratedValue,
} from '../models/property/simple-property/property-enumerated-value.js';
import {PropertySet} from '../models/property-set/property-set.js';
import {PropertySetRepository} from './property-set-repository.js';
import {PropertyRepositoriesWrapper} from './repositories-wrappers/property-repositories-wrapper.js';
import {ComplexPropertyRepository} from './complex-property-repository.js';
import {ComplexProperty} from '../models/property/complex-property.js';

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
 * Repository for all extensions of SimpleProperty.
*/
export class SimplePropertyRepository {
	private adapter: JSONFile<DbModel>;
	private db: Low<DbModel>;
	private store: string = join('./store', 'properties', 'simple-properties.json'); ;

	/**
     * Initiated with a connection to the SimpleProperty database.
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
			return someSimplePropertyFromData(property) as T;
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
			return someSimplePropertyFromData(property);
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
		// validate the request
		const propertyRepository = new PropertyRepositoriesWrapper();
		if (
			(await propertyRepository.getAllNames()).includes(property.name.value)
		) {
			throw new Error(`Property with name ${property.name.value} already exists`);
		}

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
		// validate the update request
		const propertyRepository = new PropertyRepositoriesWrapper();
		if (
			(await propertyRepository.getAllNames()).includes(newProperty.name.value) &&
			newProperty.name.value !== oldProperty.name.value
		) {
			throw new Error(`Property with name ${newProperty.name.value} already exists`);
		}

		await this.db.read();

		const type = oldProperty.type as SimplePropertyExtensionType;

		// update the property
		let updated: T;
		this.db.data[type].forEach((p: T) => {
			if (p.name.value === oldProperty.name.value) {
				p.name = newProperty.name;
				p.description = newProperty.description;
				updated = p;
			}
		});

		// update references to this updated property
		const propertySetRepository = new PropertySetRepository();
		await propertySetRepository.onPropertyRename(
			oldProperty.name.value,
			newProperty.name.value,
		);

		const complexPropertyRepository = new ComplexPropertyRepository();
		await complexPropertyRepository.onSimplePropertyRename(
			oldProperty.name.value,
			newProperty.name.value,
		);

		await this.db.write();

		return this.get(updated);
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
		this.db.data[type].forEach((p: T, index: number, object: ISimpleProperty[]) => {
			if (p.name.value === property.name.value) {
				object.splice(index, 1);
				// removed = p;
			}
		});

		const propertySetRepository = new PropertySetRepository();
		await propertySetRepository.onPropertyDelete(
			property.name.value,
		);

		const complexPropertyRepository = new ComplexPropertyRepository();
		await complexPropertyRepository.onPropertyDelete(
			property.name.value,
		);

		await this.db.write();

		return property; // TODO: return removed entity instead of inputted one
	}

	/**
	 * handle updated propertySet-connections for a property.
	 * essentially, remove the property from all property sets and add it to the new ones.
	 * @param  {SimpleProperty} property
	 * @param  {PropertySet[]} propertySetsToBeConnectedTo
	 * @return {Promise<void>}
	 */
	public async onUpdatedPropertySetConnections(
		property: SimpleProperty | ISimpleProperty,
		propertySetsToBeConnectedTo: PropertySet[],
	): Promise<void> {
		const propertySetReferences = propertySetsToBeConnectedTo.map((pSet) => pSet.asPropertySetReference());
		await this.db.read();

		this.db.data[property.type].map((p: ISimpleProperty) => {
			if (p.name.value === property.name.value) {
				p.partOfPset = propertySetReferences;
			}
		});

		await this.db.write();
		return;
	}

	/**
	 * handle updated complex property-connections for a property.
	 * essentially, remove the property from all property sets and add it to the new ones.
	 *
	 * NOTE: if renaming at the same time, make sure to do that first.
	 * @param  {ComplexProperty} complexPropertyEditConnectionsTo
	 * @return {Promise<void>}
	 */
	public async onUpdatedComplexPropertyConnections(
		complexPropertyEditConnectionsTo: ComplexProperty,
	): Promise<void> {
		const propertyReference = complexPropertyEditConnectionsTo.asPropertyReference;
		await this.db.read();

		await this.updateReferencesToRelatedEntity(
			'ComplexProperty',
			complexPropertyEditConnectionsTo.name.value,
			'delete',
		);

		complexPropertyEditConnectionsTo.hasProperties
			.filter((p) => Object.keys(SimplePropertyExtension).includes(p.type))
			.map((property) => {
				this.db.data[property.type].map((p: ISimpleProperty) => {
					if (p.name.value === property.name.value) {
						p.partOfComplex.push(propertyReference);
					}
				});
			});

		await this.db.write();
		return;
	}

	/**
     * Handle renaming of related entity (propertySet or complexProperty)
	 *
	 * NOTE: this uses the fact that name.value and name.value are same type for both Property and PropertySet
	 * (i.e StringOfLength<1, 255>) even though they use Label and Identifier respectively. I.e. just replacing
	 * value is possible.
	 *
	 * @param {string} relatedEntityType
	 * @param {StringOfLength<1,255>} oldName
	 * @param {StringOfLength<1,255>} newName
	 * @return {Promise<void>}
	 */
	public async onRelatedEntityRename(
		relatedEntityType: 'PropertySet' | 'ComplexProperty',
		oldName: ComplexProperty['name']['value'] | PropertySet['name']['value'],
		newName: ComplexProperty['name']['value'] | PropertySet['name']['value'],
	): Promise<void> {
		await this.updateReferencesToRelatedEntity(
			relatedEntityType,
			oldName,
			'rename',
			newName,
		);

		return;
	}

	/**
     * Handle removal of related entity (propertySet or complexProperty)
	 *
	 * NOTE: this uses the fact that name.value and name.value are same type for both Property and PropertySet
	 * (i.e StringOfLength<1, 255>) even though they use Label and Identifier respectively. I.e. just replacing
	 * value is possible.
	 *
	 * NOTE: make sure that the user actually wants to remove the property when a referenced entity is removed.
	 * @param {string} relatedEntityType
	 * @param {StringOfLength<1,255>} name - name of the related entity to remove
	 * @return {Promise<void>}
	 */
	public async onRelatedEntityDelete(
		relatedEntityType: 'PropertySet' | 'ComplexProperty',
		name: ComplexProperty['name']['value'] | PropertySet['name']['value'],
	): Promise<void> {
		await this.updateReferencesToRelatedEntity(
			relatedEntityType,
			name,
			'delete',
		);
		return;
	}

	/**
	 * Update all references to a related entity (complex property or property set) across the repository.
	 * @param {string} relatedEntityType
	 * @param {StringOfLength<1,255>} name - name of the related entity to remove
	 * @param {'rename' | 'delete'} action - action to perform on the reference
	 * @param {StringOfLength<1,255>} nameToRenameTo - name of the related entity to replace
	 *
	 */
	private async updateReferencesToRelatedEntity(
		relatedEntityType: 'PropertySet' | 'ComplexProperty',
		name: ComplexProperty['name']['value'] | PropertySet['name']['value'],
		action: 'rename' | 'delete',
		nameToRenameTo: ComplexProperty['name']['value'] | PropertySet['name']['value'] = null,
	) {
		if (action === 'rename' && !nameToRenameTo) {
			throw new Error('nameToRenameTo is required when action is rename');
		}

		await this.db.read();

		Object.keys(SimplePropertyExtension).forEach((simplePropertyType) => {
			this.db.data[simplePropertyType] &&
				this.db.data[simplePropertyType].forEach((property: ISimpleProperty) => {
					if (relatedEntityType === 'PropertySet') {
						property.partOfPset.forEach((pSetReference, index, object) => {
							if (pSetReference.name.value === name) {
								if (action === 'delete') object.splice(index, 1);
								if (action === 'rename') pSetReference.name.value = nameToRenameTo;
							}
						});
					} else if (relatedEntityType === 'ComplexProperty') {
						property.partOfComplex.forEach((complexPropertyReference, index, object) => {
							if (complexPropertyReference.name.value === name) {
								if (action === 'delete') object.splice(index, 1);
								if (action === 'rename') complexPropertyReference.name.value = nameToRenameTo;
							}
						});
					}
				});
		});

		await this.db.write();
		return;
	}
}
