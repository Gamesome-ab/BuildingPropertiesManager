import { ISimpleProperty, SimpleProperty } from '../models/property/simple-property/simple-property.js';
import { SimplePropertyExtensionType } from '../models/property/simple-property/simple-property-extension.js';
import { PropertySet } from '../models/property-set/property-set.js';
import { ComplexProperty } from '../models/property/complex-property.js';
/**
 * Repository for all extensions of SimpleProperty.
*/
export declare class SimplePropertyRepository {
    private adapter;
    private db;
    private store;
    /**
     * Initiated with a connection to the SimpleProperty database.
    */
    constructor();
    /**
     * list all Properties of one of the subtypes of SimpleProperty
     * @param  {string} subType
     * @return {Promise<T[]>} a list of SimpleProperty extending types
     */
    getAllOfSubType<T extends SimpleProperty>(subType: SimplePropertyExtensionType): Promise<T[]>;
    /**
     * list all SimpleProperties
     * @return {Promise<SimpleProperty[]>} a list of SimpleProperty extending types
     */
    getAll(): Promise<SimpleProperty[]>;
    /**
     * list names of all subtypes of SimpleProperty
     * @return {Promise<string[]>} a list of SimpleProperty extending types
     */
    getAllNames(): Promise<string[]>;
    /**
     * get one PropertySet (even though all is fetched)
     * @param  {T} simplePropertyData
     * @return {Promise<T>} a property of the given type
     */
    get<T extends SimpleProperty>(simplePropertyData: T): Promise<T>;
    /**
     * store a Property
     * @param  {SimpleProperty} property
     * @return {Promise<SimpleProperty>} the stored property
     */
    add<T extends SimpleProperty>(property: T): Promise<T>;
    /**
     * update (name and description of) a SimpleProperty
     * @param  {SimpleProperty} oldProperty
     * @param  {SimpleProperty} newProperty
     * @return {Promise<SimpleProperty>} the updated SimpleProperty
     */
    update<T extends SimpleProperty | ISimpleProperty>(oldProperty: T, newProperty: T): Promise<T>;
    /**
     * delete a SimpleProperty
     * @param  {SimpleProperty} property
     * @return {Promise<SimpleProperty>} the deleted SimpleProperty
     */
    remove<T extends SimpleProperty | ISimpleProperty>(property: T): Promise<T>;
    /**
     * handle updated propertySet-connections for a property.
     * essentially, remove the property from all property sets and add it to the new ones.
     * @param  {SimpleProperty} property
     * @param  {PropertySet[]} propertySetsToBeConnectedTo
     * @return {Promise<void>}
     */
    onUpdatedPropertySetConnections(property: SimpleProperty | ISimpleProperty, propertySetsToBeConnectedTo: PropertySet[]): Promise<void>;
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
     * @return {Promise<void>}
     */
    onRelatedEntityRename(relatedEntityType: 'PropertySet' | 'ComplexProperty', oldName: ComplexProperty['name']['value'] | PropertySet['name']['value'], newName: ComplexProperty['name']['value'] | PropertySet['name']['value']): Promise<void>;
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
    onRelatedEntityDelete(relatedEntityType: 'PropertySet' | 'ComplexProperty', name: ComplexProperty['name']['value'] | PropertySet['name']['value']): Promise<void>;
    /**
     * Update all references to a related entity (complex property or property set) across the repository.
     * @param {string} relatedEntityType
     * @param {StringOfLength<1,255>} name - name of the related entity to remove
     * @param {'rename' | 'delete'} action - action to perform on the reference
     * @param {StringOfLength<1,255>} nameToRenameTo - name of the related entity to replace
     *
     */
    private updateReferencesToRelatedEntity;
}
