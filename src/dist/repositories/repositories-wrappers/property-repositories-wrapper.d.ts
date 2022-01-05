import { PropertySet } from '../../models/property-set/property-set.js';
import { ComplexProperty } from '../../models/property/complex-property.js';
import { IProperty, Property } from '../../models/property/property.js';
/**
 * Composite repository for getting some data across all extensions of a property,
 * i.e SimplePropertyExtensions and ComplexProperty.
 */
export declare class PropertyRepositoriesWrapper {
    private simplePropertyRepository;
    private complexPropertyRepository;
    /**
     * Initiated with a connection to the property set database.
    */
    constructor();
    /**
     * list names of all subtypes of Property
     * @return {Promise<string[]>} a list of Property names in the databases
     */
    getAllNames(): Promise<string[]>;
    /**
     * handle updated propertySet-connections for a property.
     * essentially, remove the property from all property sets and add it to the new ones.
     * @param  {SimpleProperty} property
     * @param  {PropertySet[]} propertySetsToBeConnectedTo
     * @return {Promise<void>} the PropertySets that the property is now part of
     */
    onUpdatedPropertySetConnections<T extends Property | IProperty>(property: T, propertySetsToBeConnectedTo: PropertySet[]): Promise<void>;
    /**
     * wrapper of related entity rename handler for all subtypes of Property
     *
     * @param {string} relatedEntityType
     * @param {StringOfLength<1,255>} oldName
     * @param {StringOfLength<1,255>} newName
     * @return {Promise<void>} a list of SimpleProperty extending types
     */
    onRelatedEntityRename(relatedEntityType: 'PropertySet' | 'ComplexProperty', oldName: Property['name']['value'], newName: Property['name']['value']): Promise<void>;
    /**
     * wrapper of complex property relation change handler for all subtypes of Property
     * // NOTE: if renaming at the same time, make sure to do that first.
     * @param  {ComplexProperty} complexPropertyToEditConnectionsTo
     * @return {Promise<void>}
     */
    onUpdatedComplexPropertyConnections(complexPropertyToEditConnectionsTo: ComplexProperty): Promise<void>;
}
