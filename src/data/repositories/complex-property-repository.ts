import {join} from 'path';
import {Low, JSONFile} from 'lowdb';
import _ from 'lodash';
import {ComplexProperty, IComplexProperty} from '../models/property/complex-property.js';
import {PropertySet} from '../models/property-set/property-set.js';
import {Property} from '../models/property/property.js';
import {SimpleProperty} from '../models/property/simple-property/simple-property.js';
import {PropertyRepositoriesWrapper} from './repositories-wrappers/property-repositories-wrapper.js';
import {PropertySetRepository} from './property-set-repository.js';
import {SimplePropertyRepository} from './simple-property-repository.js';

/**
 * Repository for complex properties.
 */
export class ComplexPropertyRepository {
	private adapter: JSONFile<IComplexProperty[]>;
	private db: Low<IComplexProperty[]>;
	private store: string = join('./store', 'properties', 'complex-properties.json');

	/**
     * Initiated with a connection to the property set database.
    */
	constructor() {
		this.adapter = new JSONFile<IComplexProperty[]>(this.store);
		this.db = new Low(this.adapter);
	}

	/**
     * list all ComplexProperties
	 * @return {Promise<ComplexProperty[]>} a list of ComplexProperties
	 */
	public async getAll(): Promise<ComplexProperty[]> {
		await this.db.read();
		return this.db.data.map((ComplexPropertyData) => {
			return ComplexProperty.fromData(ComplexPropertyData);
		});
	}


	/**
     * list names of all ComplexProperties
	 * @return {Promise<string[]>} a list of ComplexProperties
	 */
	public async getAllNames(): Promise<string[]> {
		const properties = await this.getAll();
		const propertyNames = properties.map((property) => property.name.value);

		return propertyNames;
	}

	/**
     * get one ComplexProperty (even though all is fetched)
	 * @param  {ComplexProperty} complexProperty
	 * @return {Promise<ComplexProperty>} a ComplexProperty
	 */
	public async get(complexProperty: ComplexProperty | IComplexProperty): Promise<ComplexProperty> {
		await this.db.read();
		const chain = _.chain(this.db.data);

		return ComplexProperty.fromData(chain.find({name: complexProperty.name}).value());
	}

	/**
     * store a ComplexProperty
	 * @param  {ComplexProperty} complexProperty
	 * @return {Promise<ComplexProperty>} a ComplexProperty
	 */
	public async add(complexProperty: ComplexProperty): Promise<ComplexProperty> {
		// validate the request
		const propertyRepository = new PropertyRepositoriesWrapper();
		if (
			(await propertyRepository.getAllNames()).includes(complexProperty.name.value)
		) {
			throw new Error(`Property with name ${complexProperty.name.value} already exists`);
		}

		await this.db.read();

		this.db.data.push(complexProperty);
		await this.db.write();

		const propertyRepositoryWrapper = new PropertyRepositoriesWrapper();
		await propertyRepositoryWrapper.onUpdatedComplexPropertyConnections(
			complexProperty,
		);

		return complexProperty;
	}

	/**
     * update (name and description of) a ComplexProperty
	 * @param  {ComplexProperty} oldComplexProperty
	 * @param  {ComplexProperty} newComplexProperty
	 * @return {Promise<ComplexProperty>} the updated ComplexProperty
	 */
	public async update(
		oldComplexProperty: ComplexProperty,
		newComplexProperty: ComplexProperty,
	): Promise<ComplexProperty> {
		// validate the update request
		const propertyRepository = new PropertyRepositoriesWrapper();
		if (
			(await propertyRepository.getAllNames()).includes(newComplexProperty.name.value) &&
			newComplexProperty.name.value !== oldComplexProperty.name.value
		) {
			throw new Error(`Property with name ${newComplexProperty.name.value} already exists`);
		}

		await this.db.read();

		const index = this.db.data.findIndex((complexProp) => complexProp.name.value === oldComplexProperty.name.value);
		if (index === -1) throw new Error('ComplexProperty not found');

		// make sure we are not editing the old property
		const oldComplexPropertyCopy = _.cloneDeep(this.db.data[index]);

		this.db.data[index] = newComplexProperty;

		// check if renamed and not just changed description. if so, rename the references to the property set
		if (oldComplexProperty.name.value.toString() !== newComplexProperty.name.value.toString()) {
			const propertyRepositoryWrapper = new PropertyRepositoriesWrapper();
			await propertyRepositoryWrapper.onRelatedEntityRename(
				'PropertySet',
				oldComplexProperty.name.value,
				newComplexProperty.name.value,
			);

			const propertySetRepository = new PropertySetRepository();
			await propertySetRepository.onPropertyRename(
				oldComplexProperty.name.value,
				newComplexProperty.name.value,
			);
		}

		// Write the changes to the database before changing the references,
		// since there are references in this repository (changed below) that need a predictable name
		await this.db.write();

		// compare old and new property references and verify if they have changed.
		const removedReferences = oldComplexPropertyCopy.hasProperties.filter((property) => {
			return !newComplexProperty.hasProperties.find((p) => p.name.value === property.name.value);
		});
		const addedReferences = newComplexProperty.hasProperties.filter((property) => {
			return !oldComplexPropertyCopy.hasProperties.find((p) => p.name.value === property.name.value);
		});

		console.log('update includes removals and additions: ', removedReferences, addedReferences);
		// if so, update the references
		if (removedReferences.length > 0 || addedReferences.length > 0) {
			const propertyRepositoryWrapper = new PropertyRepositoriesWrapper();
			await propertyRepositoryWrapper.onUpdatedComplexPropertyConnections(
				newComplexProperty,
			);
		}

		return this.get(newComplexProperty);
	}

	/**
     * delete a ComplexProperty
	 * @param  {ComplexProperty} complexProperty
	 * @return {Promise<ComplexProperty[]>} the deleted ComplexProperties
	 */
	public async remove(complexProperty: ComplexProperty): Promise<ComplexProperty> {
		await this.db.read();

		const chain = _.chain(this.db.data);
		const removed = chain.remove({
			name: {
				value: complexProperty.name.value,
			},
		}).value();

		// TODO: be smarter when checking for success
		if (removed.length === 1) {
			// TODO: maybe also remove referenced entities. probably need a helper to find what is referenced

			await this.db.write();

			return ComplexProperty.fromData(removed[0]);
		} else {
			console.error('nothing removed since multiple or none where found:', removed);
			return null;
		}
	}

	/**
     * update connections for a property.
	 * essentially, remove the property from all property sets and add it to the new ones.
	 * @param  {ComplexProperty} property
	 * @param  {PropertySet[]} propertySetsToBeConnectedTo
	 * @return {Promise<void>} the PropertySets that the property is now part of
	 */
	public async onUpdatedPropertySetConnections(
		property: ComplexProperty | IComplexProperty,
		propertySetsToBeConnectedTo: PropertySet[],
	): Promise<PropertySet[]> {
		const propertySetReferences = propertySetsToBeConnectedTo.map((pSet) => pSet.asPropertySetReference());
		await this.db.read();

		// add to the new property sets
		this.db.data.map((p: IComplexProperty) => {
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
			.filter((p) => p.type === 'ComplexProperty')
			.map((property) => {
				this.db.data.map((p: IComplexProperty) => {
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
	 * @return {Promise<void>} a list of SimpleProperty extending types
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

		this.db.data && this.db.data.forEach((property: IComplexProperty) => {
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

		await this.db.write();
		return;
	}

	/**
     * Handle rename of (simple) property
	 * @param {StringOfLength<1,255>} oldName
	 * @param {StringOfLength<1,255>} newName
	 * @return {Promise<void>} a list of SimpleProperty extending types
	 */
	public async onSimplePropertyRename(
		oldName: SimpleProperty['name']['value'],
		newName: SimpleProperty['name']['value'],
	): Promise<void> {
		await this.db.read();

		this.db.data.forEach((complexProperty) => {
			complexProperty.hasProperties = complexProperty.hasProperties.map((p) => {
				if (p.name.value === oldName) {
					p.name.value = newName;
				}
				return p;
			});
		});

		await this.db.write();
		return;
	}

	/**
     * Handle removal of property, i.e also remove it from all complex properties
	 * @param {StringOfLength<1,255>} name
	 * @return {Promise<void>} a list of SimpleProperty extending types
	 */
	public async onPropertyDelete(
		name: Property['name']['value'],
	): Promise<void> {
		await this.db.read();

		this.db.data.forEach((property) => {
			property.hasProperties = property.hasProperties.filter((p) => {
				return p.name.value !== name;
			});
		});

		await this.db.write();
		return;
	}
}
