import { join } from 'path';
import { Low, JSONFile } from 'lowdb';
import _ from 'lodash';
import { PropertyEnumeration } from '../models/property/property-enumeration.js';
/**
 * Repository for property enumerations.
 */
export class PropertyEnumerationRepository {
    /**
     * Initiated with a connection to the property set database.
    */
    constructor() {
        this.store = join('./store', 'properties', 'property-enumerations.json');
        this.adapter = new JSONFile(this.store);
        this.db = new Low(this.adapter);
    }
    /**
     * list all PropertyEnumerations
     * @return {Promise<PropertyEnumeration[]>} a list of PropertyEnumerations
     */
    async getAll() {
        await this.db.read();
        return this.db.data.map((propertyEnumerationData) => {
            return PropertyEnumeration.fromData(propertyEnumerationData);
        });
    }
    /**
     * get one PropertyEnumeration (even though all is fetched)
     * @param  {PropertyEnumeration} propertyEnumeration
     * @return {Promise<PropertyEnumeration>} a PropertyEnumeration
     */
    async get(propertyEnumeration) {
        await this.db.read();
        const chain = _.chain(this.db.data);
        return PropertyEnumeration.fromData(chain.find({ name: propertyEnumeration.name }).value());
    }
    /**
     * store a PropertyEnumeration
     * @param  {PropertyEnumeration} propertyEnumeration
     * @return {Promise<PropertyEnumeration>} a PropertyEnumeration
     */
    async add(propertyEnumeration) {
        await this.db.read();
        // TODO: verify that the name is unique
        this.db.data.push(propertyEnumeration);
        await this.db.write();
        return propertyEnumeration;
    }
    /**
     * update (name and description of) a PropertyEnumeration
     * @param  {PropertyEnumeration} oldPropertyEnumeration
     * @param  {PropertyEnumeration} newPropertyEnumeration
     * @return {Promise<PropertyEnumeration>} the updated PropertyEnumeration
     */
    async update(oldPropertyEnumeration, newPropertyEnumeration) {
        await this.db.read();
        const index = this.db.data.findIndex((pSet) => pSet.name.value === oldPropertyEnumeration.name.value);
        if (index === -1)
            throw new Error('PropertyEnumeration not found');
        this.db.data[index] = newPropertyEnumeration;
        // TODO: rename all references in properties
        await this.db.write();
        return this.get(newPropertyEnumeration);
    }
    /**
     * delete a PropertyEnumeration
     * @param  {PropertyEnumeration} propertyEnumeration
     * @return {Promise<PropertyEnumeration[]>} the deleted PropertyEnumerations
     */
    async remove(propertyEnumeration) {
        await this.db.read();
        const chain = _.chain(this.db.data);
        const removed = chain.remove({
            name: {
                value: propertyEnumeration.name.value,
            },
        }).value();
        // TODO: be smarter when checking for success
        if (removed.length === 1) {
            // TODO: also remove referenced entities. probably need a helper to find what is referenced
            await this.db.write();
            return PropertyEnumeration.fromData(removed[0]);
        }
        else {
            console.error('nothing removed since multiple where found:', removed);
            return null;
        }
    }
}
//# sourceMappingURL=property-enumeration-repository.js.map