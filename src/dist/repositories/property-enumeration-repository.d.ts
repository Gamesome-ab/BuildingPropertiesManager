import { IPropertyEnumeration, PropertyEnumeration } from '../models/property/property-enumeration.js';
/**
 * Repository for property enumerations.
 */
export declare class PropertyEnumerationRepository {
    private adapter;
    private db;
    private store;
    /**
     * Initiated with a connection to the property set database.
    */
    constructor();
    /**
     * list all PropertyEnumerations
     * @return {Promise<PropertyEnumeration[]>} a list of PropertyEnumerations
     */
    getAll(): Promise<PropertyEnumeration[]>;
    /**
     * get one PropertyEnumeration (even though all is fetched)
     * @param  {PropertyEnumeration} propertyEnumeration
     * @return {Promise<PropertyEnumeration>} a PropertyEnumeration
     */
    get(propertyEnumeration: PropertyEnumeration | IPropertyEnumeration): Promise<PropertyEnumeration>;
    /**
     * store a PropertyEnumeration
     * @param  {PropertyEnumeration} propertyEnumeration
     * @return {Promise<PropertyEnumeration>} a PropertyEnumeration
     */
    add(propertyEnumeration: PropertyEnumeration): Promise<PropertyEnumeration>;
    /**
     * update (name and description of) a PropertyEnumeration
     * @param  {PropertyEnumeration} oldPropertyEnumeration
     * @param  {PropertyEnumeration} newPropertyEnumeration
     * @return {Promise<PropertyEnumeration>} the updated PropertyEnumeration
     */
    update(oldPropertyEnumeration: PropertyEnumeration, newPropertyEnumeration: PropertyEnumeration): Promise<PropertyEnumeration>;
    /**
     * delete a PropertyEnumeration
     * @param  {PropertyEnumeration} propertyEnumeration
     * @return {Promise<PropertyEnumeration[]>} the deleted PropertyEnumerations
     */
    remove(propertyEnumeration: PropertyEnumeration): Promise<PropertyEnumeration>;
}
