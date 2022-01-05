import { ComplexProperty, IComplexProperty } from '../models/property/complex-property.js';
import { PropertySet } from '../models/property-set/property-set.js';
import { Property } from '../models/property/property.js';
import { SimpleProperty } from '../models/property/simple-property/simple-property.js';
/**
 * Repository for complex properties.
 */
export declare class ComplexPropertyRepository {
    private adapter;
    private db;
    private store;
    /**
     * Initiated with a connection to the property set database.
    */
    constructor();
    /**
     * list all ComplexProperties
     * @return {Promise<ComplexProperty[]>} a list of ComplexProperties
     */
    getAll(): Promise<ComplexProperty[]>;
    /**
     * list names of all ComplexProperties
     * @return {Promise<string[]>} a list of ComplexProperties
     */
    getAllNames(): Promise<string[]>;
    /**
     * get one ComplexProperty (even though all is fetched)
     * @param  {ComplexProperty} complexProperty
     * @return {Promise<ComplexProperty>} a ComplexProperty
     */
    get(complexProperty: ComplexProperty | IComplexProperty): Promise<ComplexProperty>;
    /**
     * store a ComplexProperty
     * @param  {ComplexProperty} complexProperty
     * @return {Promise<ComplexProperty>} a ComplexProperty
     */
    add(complexProperty: ComplexProperty): Promise<ComplexProperty>;
    /**
     * update (name and description of) a ComplexProperty
     * @param  {ComplexProperty} oldComplexProperty
     * @param  {ComplexProperty} newComplexProperty
     * @return {Promise<ComplexProperty>} the updated ComplexProperty
     */
    update(oldComplexProperty: ComplexProperty, newComplexProperty: ComplexProperty): Promise<ComplexProperty>;
    /**
     * delete a ComplexProperty
     * @param  {ComplexProperty} complexProperty
     * @return {Promise<ComplexProperty[]>} the deleted ComplexProperties
     */
    remove(complexProperty: ComplexProperty): Promise<ComplexProperty>;
    /**
     * update connections for a property.
     * essentially, remove the property from all property sets and add it to the new ones.
     * @param  {ComplexProperty} property
     * @param  {PropertySet[]} propertySetsToBeConnectedTo
     * @return {Promise<void>} the PropertySets that the property is now part of
     */
    onUpdatedPropertySetConnections(property: ComplexProperty | IComplexProperty, propertySetsToBeConnectedTo: PropertySet[]): Promise<PropertySet[]>;
    /**
     * handle updated complex property-connections for a property.
     * essentially, remove the property from all property sets and add it to the new ones.
     *
     * NOTE: if renaming at the same time, make sure to do that first.
     * @param  {ComplexProperty} complexPropertyEditConnectionsTo
     * @return {Promise<void>}
     */
    onUpdatedComplexPropertyConnections(complexPropertyEditConnectionsTo: ComplexProperty): Promise<void>;
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
    onRelatedEntityRename(relatedEntityType: 'PropertySet' | 'ComplexProperty', oldName: ComplexProperty['name']['value'] | PropertySet['name']['value'], newName: ComplexProperty['name']['value'] | PropertySet['name']['value']): Promise<void>;
    /**
     * Update all references to a related entity (complex property or property set) across the repository.
     * @param {string} relatedEntityType
     * @param {StringOfLength<1,255>} name - name of the related entity to remove
     * @param {'rename' | 'delete'} action - action to perform on the reference
     * @param {StringOfLength<1,255>} nameToRenameTo - name of the related entity to replace
     *
     */
    private updateReferencesToRelatedEntity;
    /**
     * Handle rename of (simple) property
     * @param {StringOfLength<1,255>} oldName
     * @param {StringOfLength<1,255>} newName
     * @return {Promise<void>} a list of SimpleProperty extending types
     */
    onSimplePropertyRename(oldName: SimpleProperty['name']['value'], newName: SimpleProperty['name']['value']): Promise<void>;
    /**
     * Handle removal of property, i.e also remove it from all complex properties
     * @param {StringOfLength<1,255>} name
     * @return {Promise<void>} a list of SimpleProperty extending types
     */
    onPropertyDelete(name: Property['name']['value']): Promise<void>;
}
