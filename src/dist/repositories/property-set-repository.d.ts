import { IPropertySet, PropertySet } from '../models/property-set/property-set.js';
import { Property } from '../models/property/property.js';
/**
 * Repository for property sets.
*/
export declare class PropertySetRepository {
    private adapter;
    private db;
    private store;
    /**
     * Initiated with a connection to the property set database.
    */
    constructor();
    /**
     * list all PropertySets
     * @return {Promise<PropertySet[]>} a list of PropertySet
     */
    getAll(): Promise<PropertySet[]>;
    /**
     * get one PropertySet (even though all is fetched)
     * @param  {PropertySet | IPropertySet} propertySet
     * @return {Promise<PropertySet>} a PropertySet
     */
    get(propertySet: PropertySet | IPropertySet): Promise<PropertySet>;
    /**
     * store a PropertySet
     * @param  {PropertySet} propertySet
     * @return {Promise<PropertySet>} a PropertySet
     */
    add(propertySet: PropertySet): Promise<PropertySet>;
    /**
     * update (name and description of) a PropertySet
     * @param  {PropertySet} oldPropertySet
     * @param  {PropertySet} newPropertySet
     * @return {Promise<PropertySet>} the updated PropertySet
     */
    update(oldPropertySet: PropertySet, newPropertySet: PropertySet): Promise<PropertySet>;
    /**
     * update connections for a property.
     * essentially, remove the property from all property sets and add it to the new ones.
     * @param  {Property} property
     * @param  {PropertySet[]} propertySetsToBeConnectedTo
     * @return {Promise<PropertySet[]>} the PropertySets that the property is now part of
     */
    updatePropertyConnections(property: Property, propertySetsToBeConnectedTo: PropertySet[]): Promise<void>;
    /**
     * delete a PropertySet
     * @param  {PropertySet} propertySet - the PropertySet to delete
     * @param {boolean} removeReferencedEntities - whether to delete the referenced entities
     * @return {Promise<PropertySet>} the deleted PropertySet
     */
    remove(propertySet: PropertySet, removeReferencedEntities?: boolean): Promise<PropertySet>;
    /**
     * Handle rename of (simple or complex)property
     * @param {StringOfLength<1,255>} oldName
     * @param {StringOfLength<1,255>} newName
     * @return {Promise<void>} a list of SimpleProperty extending types
     */
    onPropertyRename(oldName: Property['name']['value'], newName: Property['name']['value']): Promise<void>;
    /**
     * Handle removal of property, i.e also remove it from all property sets
     * @param {StringOfLength<1,255>} name
     * @return {Promise<void>} a list of SimpleProperty extending types
     */
    onPropertyDelete(name: Property['name']['value']): Promise<void>;
}
