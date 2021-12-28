import {PropertySet} from '../../models/property-set/property-set.js';
import {ComplexProperty, IComplexProperty} from '../../models/property/complex-property.js';
import {IProperty, Property} from '../../models/property/property.js';
import {PropertyExtension, PropertyExtensionType} from '../../models/property/property-extension.js';
import {ISimpleProperty} from '../../models/property/simple-property/simple-property.js';
import {SimplePropertyExtension} from '../../models/property/simple-property/simple-property-extension.js';
import {ComplexPropertyRepository} from '../complex-property-repository.js';
import {SimplePropertyRepository} from '../simple-property-repository.js';

/**
 * Composite repository for getting some data across all extensions of a property,
 * i.e SimplePropertyExtensions and ComplexProperty.
 */
export class PropertyRepositoriesWrapper {
	private simplePropertyRepository: SimplePropertyRepository;
	private complexPropertyRepository: ComplexPropertyRepository;

	/**
	 * Initiated with a connection to the property set database.
	*/
	constructor() {
		this.simplePropertyRepository = new SimplePropertyRepository();
		this.complexPropertyRepository = new ComplexPropertyRepository();
	}

	/**
     * list names of all subtypes of Property
	 * @return {Promise<string[]>} a list of Property names in the databases
	 */
	public async getAllNames(): Promise<string[]> {
		const simplePropertyNames = await this.simplePropertyRepository.getAllNames();
		const complexPropertyNames = await this.complexPropertyRepository.getAllNames();

		return [...simplePropertyNames, ...complexPropertyNames];
	}

	/**
	 * handle updated propertySet-connections for a property.
	 * essentially, remove the property from all property sets and add it to the new ones.
	 * @param  {SimpleProperty} property
	 * @param  {PropertySet[]} propertySetsToBeConnectedTo
	 * @return {Promise<void>} the PropertySets that the property is now part of
	 */
	public async onUpdatedPropertySetConnections<T extends Property | IProperty>(
		property: T,
		propertySetsToBeConnectedTo: PropertySet[],
	): Promise<void> {
		if (Object.keys(SimplePropertyExtension).includes(property.type)) {
			const propertyRepository = new SimplePropertyRepository();
			await propertyRepository.onUpdatedPropertySetConnections(
				property as ISimpleProperty,
				propertySetsToBeConnectedTo,
			);
		} else if (
			Object.keys(PropertyExtension).includes(property.type) &&
			<PropertyExtensionType>property.type !== 'SimpleProperty'
		) {
			const propertyRepository = new ComplexPropertyRepository();
			await propertyRepository.onUpdatedPropertySetConnections(
				property as IComplexProperty,
				propertySetsToBeConnectedTo,
			);
		} else {
			throw new Error('not implemented');
		}

		return;
	}

	/**
     * wrapper of related entity rename handler for all subtypes of Property
	 *
	 * @param {string} relatedEntityType
	 * @param {StringOfLength<1,255>} oldName
	 * @param {StringOfLength<1,255>} newName
	 * @return {Promise<void>} a list of SimpleProperty extending types
	 */
	public async onRelatedEntityRename(
		relatedEntityType: 'PropertySet' | 'ComplexProperty',
		oldName: Property['name']['value'],
		newName: Property['name']['value'],
	): Promise<void> {
		await this.simplePropertyRepository.onRelatedEntityRename(
			relatedEntityType,
			oldName,
			newName,
		);
		await this.complexPropertyRepository.onRelatedEntityRename(
			relatedEntityType,
			oldName,
			newName,
		);

		return;
	}

	/**
	 * wrapper of complex property relation change handler for all subtypes of Property
	 * // NOTE: if renaming at the same time, make sure to do that first.
	 * @param  {ComplexProperty} complexPropertyEditConnectionsTo
	 * @return {Promise<void>}
	 */
	public async onUpdatedComplexPropertyConnections(
		complexPropertyEditConnectionsTo: ComplexProperty,
	): Promise<void> {
		await this.simplePropertyRepository.onUpdatedComplexPropertyConnections(
			complexPropertyEditConnectionsTo,
		);
		await this.complexPropertyRepository.onUpdatedComplexPropertyConnections(
			complexPropertyEditConnectionsTo,
		);
	}
}
