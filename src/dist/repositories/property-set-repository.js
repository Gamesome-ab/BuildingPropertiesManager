import { join } from 'path';
import { Low, JSONFile } from 'lowdb';
import _ from 'lodash';
import { PropertySet } from '../models/property-set/property-set.js';
import { SimplePropertyRepository } from './simple-property-repository.js';
import { PropertyRepositoriesWrapper } from './repositories-wrappers/property-repositories-wrapper.js';
/**
 * Repository for property sets.
*/
export class PropertySetRepository {
    /**
     * Initiated with a connection to the property set database.
    */
    constructor() {
        this.store = join('./store', 'property-sets.json');
        this.adapter = new JSONFile(this.store);
        this.db = new Low(this.adapter);
    }
    /**
     * list all PropertySets
     * @return {Promise<PropertySet[]>} a list of PropertySet
     */
    async getAll() {
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
    async get(propertySet) {
        await this.db.read();
        const chain = _.chain(this.db.data);
        return PropertySet.fromData(chain.find({ name: propertySet.name }).value());
    }
    /**
     * store a PropertySet
     * @param  {PropertySet} propertySet
     * @return {Promise<PropertySet>} a PropertySet
     */
    async add(propertySet) {
        await this.db.read();
        // TODO: verify that the name is unique
        this.db.data.push(propertySet);
        await this.db.write();
        // TODO: if propertySet has properties, we need to add references to them also!
        return propertySet;
    }
    /**
     * update (name and description of) a PropertySet
     * @param  {PropertySet} oldPropertySet
     * @param  {PropertySet} newPropertySet
     * @return {Promise<PropertySet>} the updated PropertySet
     */
    async update(oldPropertySet, newPropertySet) {
        await this.db.read();
        const chain = _.chain(this.db.data);
        const updated = chain.find(// this will return the first one
        { name: oldPropertySet.name }).assign({ name: newPropertySet.name }, { description: newPropertySet.description }).value();
        // check if renamed and not just changed description. if so, rename the references to the property set
        if (oldPropertySet.name.value.toString() !== newPropertySet.name.value.toString()) {
            const propertyRepositoryWrapper = new PropertyRepositoriesWrapper();
            await propertyRepositoryWrapper.onRelatedEntityRename('PropertySet', oldPropertySet.name.value, newPropertySet.name.value);
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
    async updatePropertyConnections(property, propertySetsToBeConnectedTo) {
        const propertyReference = property.asPropertyReference;
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
        const propertyRepositoryWrapper = new PropertyRepositoriesWrapper();
        await propertyRepositoryWrapper.onUpdatedPropertySetConnections(property, propertySetsToBeConnectedTo);
        await this.db.write();
        return;
    }
    /**
     * delete a PropertySet
     * @param  {PropertySet} propertySet - the PropertySet to delete
     * @param {boolean} removeReferencedEntities - whether to delete the referenced entities
     * @return {Promise<PropertySet>} the deleted PropertySet
     */
    async remove(propertySet, removeReferencedEntities = false) {
        await this.db.read();
        const chain = _.chain(this.db.data);
        const removed = chain.remove({
            name: {
                value: propertySet.name.value,
            },
        }).value();
        // TODO: be smarter when checking for success
        if (removed.length === 1) {
            if (removeReferencedEntities) {
                const simplePropertyRepository = new SimplePropertyRepository();
                await simplePropertyRepository.onRelatedEntityDelete('PropertySet', propertySet.name.value);
            }
            await this.db.write();
            return PropertySet.fromData(removed[0]);
        }
        else {
            console.error('nothing removed since multiple or none where found:', removed);
            return null;
        }
    }
    /**
     * Handle rename of (simple or complex)property
     * @param {StringOfLength<1,255>} oldName
     * @param {StringOfLength<1,255>} newName
     * @return {Promise<void>} a list of SimpleProperty extending types
     */
    async onPropertyRename(oldName, newName) {
        await this.db.read();
        this.db.data.forEach((pSet) => {
            pSet.hasProperties = pSet.hasProperties.map((p) => {
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
     * Handle removal of property, i.e also remove it from all property sets
     * @param {StringOfLength<1,255>} name
     * @return {Promise<void>} a list of SimpleProperty extending types
     */
    async onPropertyDelete(name) {
        await this.db.read();
        this.db.data.forEach((pSet) => {
            pSet.hasProperties = pSet.hasProperties.filter((p) => {
                return p.name.value !== name;
            });
        });
        await this.db.write();
        return;
    }
}
//# sourceMappingURL=property-set-repository.js.map