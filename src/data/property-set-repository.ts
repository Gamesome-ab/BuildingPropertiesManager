import {join} from 'path';
import {Low, JSONFile} from 'lowdb';
import _ from 'lodash';
import {IPropertySet, PropertySet} from './models/property-set/property-set.js';
import {Property} from './models/property/property.js';
import {SimplePropertyRepository} from './simple-property-repository.js';
import {SimplePropertyExtension} from './models/property/simple-property/simple-property-extension.js';

/**
 * Repository for property sets.
*/
export class PropertySetRepository {
	private adapter: JSONFile<IPropertySet[]>;
	private db: Low<IPropertySet[]>;
	private store: string = join('./store', 'property-sets.json');

	/**
     * Initiated with a connection to the property set database.
    */
	constructor() {
		this.adapter = new JSONFile<PropertySet[]>(this.store);
		this.db = new Low(this.adapter);
	}

	/**
     * list all PropertySets
	 * @return {Promise<PropertySet[]>} a list of PropertySet
	 */
	public async getAll(): Promise<PropertySet[]> {
		await this.db.read();
		return this.db.data.map((propertySetData) => {
			return PropertySet.fromData(propertySetData);
		});
	}

	/**
     * get one PropertySet (even though all is fetched)
	 * @param  {PropertySet | IPropertySet} propertySet
	 * @return {Promise<PropertySet>} a PropertySet
	 */
	public async get(propertySet: PropertySet | IPropertySet): Promise<PropertySet> {
		await this.db.read();
		const chain = _.chain(this.db.data);

		return PropertySet.fromData(chain.find({name: propertySet.name}).value());
	}

	/**
     * store a PropertySet
	 * @param  {PropertySet} propertySet
	 * @return {Promise<PropertySet>} a PropertySet
	 */
	public async add(propertySet: PropertySet): Promise<PropertySet> {
		await this.db.read();
		// TODO: verify that the name is unique

		this.db.data.push(propertySet);
		await this.db.write();

		return propertySet;
	}

	/**
     * update (name and description of) a PropertySet
	 * @param  {PropertySet} oldPropertySet
	 * @param  {PropertySet} newPropertySet
	 * @return {Promise<PropertySet>} the updated PropertySet
	 */
	public async update(
		oldPropertySet: PropertySet,
		newPropertySet: PropertySet,
	): Promise<PropertySet> {
		await this.db.read();

		const chain = _.chain(this.db.data);
		const updated: IPropertySet = chain.find( // this will return the first one
			{name: oldPropertySet.name},
		).assign(
			{name: newPropertySet.name},
			{description: newPropertySet.description},
		).value();

		const simplePropertyRepository = new SimplePropertyRepository();
		if (oldPropertySet.name.value.toString() !== newPropertySet.name.value.toString()) {
			await simplePropertyRepository.onRelatedEntityRename(
				'PropertySet',
				oldPropertySet.name.value.toString(),
				newPropertySet.name.value.toString(),
			);
		}

		await this.db.write();

		return this.get(updated);
	}

	/**
     * update connections for a property.
	 * essentially, remove the property from all property sets and add it to the new ones.
	 * @param  {Property} property
	 * @param  {PropertySet[]} propertySetsToBeConnectedTo
	 * @return {Promise<PropertySet[]>} the PropertySets that the property is now part of
	 */
	public async updatePropertyConnections(
		property: Property,
		propertySetsToBeConnectedTo: PropertySet[],
	): Promise<void> {
		const propertyReference = property.asPropertyReference();
		await this.db.read();

		// remove from everywhere
		this.db.data.map((propertySet) => {
			propertySet.hasProperties = propertySet.hasProperties.filter((p) => {
				return p.name.value !== propertyReference.name.value;
			});
		});

		// add to the new property sets
		this.db.data.map((propertySet) => {
			if (propertySetsToBeConnectedTo.find((ps) => ps.name.value === propertySet.name.value)) {
				propertySet.hasProperties.push(propertyReference);
			}
		});

		const propertyRepository = Object.keys(SimplePropertyExtension).includes(property.type) ?
			SimplePropertyRepository :
			null; // add complex property support later, or generalize the repository
		if (!propertyRepository) throw new Error('not implemented');

		const simplePropertyRepository = new SimplePropertyRepository();
		await simplePropertyRepository.updatePropertySetConnections(property, propertySetsToBeConnectedTo);

		await this.db.write();
		return;
	}

	/**
     * delete a PropertySet
	 * @param  {PropertySet} propertySet
	 * @return {Promise<PropertySet[]>} the deleted PropertySets
	 */
	public async remove(propertySet: PropertySet): Promise<PropertySet> {
		await this.db.read();

		const chain = _.chain(this.db.data);
		const removed = chain.remove({
			name: {
				value: propertySet.name.value,
			},
		}).value();

		// TODO: be smarter when checking for success
		if (removed.length === 1) {
			const simplePropertyRepository = new SimplePropertyRepository();
			await simplePropertyRepository.onRelatedEntityDelete(
				'PropertySet',
				propertySet.name.value.toString(),
			);

			await this.db.write();

			return PropertySet.fromData(removed[0]);
		} else {
			console.error('nothing removed since multiple where found:', removed);
			return null;
		}
	}

	/**
     * Handle rename of property
	 * @param {string} oldName
	 * @param {string} newName
	 * @return {Promise<void>} a list of SimpleProperty extending types
	 */
	public async onPropertyRename(
		oldName: string,
		newName: string,
	): Promise<void> {
		await this.db.read();

		this.db.data.forEach((pSet) => {
			pSet.hasProperties = pSet.hasProperties.map((p: any) => { // NOTE: any since not element if from DB and not mapped to class
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
     * Handle removal of property (also remove from all property sets)
	 * @param {string} name
	 * @return {Promise<void>} a list of SimpleProperty extending types
	 */
	public async onPropertyDelete(
		name: string,
	): Promise<void> {
		await this.db.read();

		this.db.data.forEach((pSet) => {
			pSet.hasProperties = pSet.hasProperties.filter((p: any) => { // NOTE: any since not element if from DB and not mapped to class
				return p.name.value !== name;
			});
		});

		await this.db.write();
		return;
	}
}