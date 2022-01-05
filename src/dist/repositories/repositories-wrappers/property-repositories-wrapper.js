import { PropertyExtension } from '../../models/property/property-extension.js';
import { SimplePropertyExtension } from '../../models/property/simple-property/simple-property-extension.js';
import { ComplexPropertyRepository } from '../complex-property-repository.js';
import { SimplePropertyRepository } from '../simple-property-repository.js';
/**
 * Composite repository for getting some data across all extensions of a property,
 * i.e SimplePropertyExtensions and ComplexProperty.
 */
export class PropertyRepositoriesWrapper {
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
    async getAllNames() {
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
    async onUpdatedPropertySetConnections(property, propertySetsToBeConnectedTo) {
        if (Object.keys(SimplePropertyExtension).includes(property.type)) {
            const propertyRepository = new SimplePropertyRepository();
            await propertyRepository.onUpdatedPropertySetConnections(property, propertySetsToBeConnectedTo);
        }
        else if (Object.keys(PropertyExtension).includes(property.type) &&
            property.type !== 'SimpleProperty') {
            const propertyRepository = new ComplexPropertyRepository();
            await propertyRepository.onUpdatedPropertySetConnections(property, propertySetsToBeConnectedTo);
        }
        else {
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
    async onRelatedEntityRename(relatedEntityType, oldName, newName) {
        await this.simplePropertyRepository.onRelatedEntityRename(relatedEntityType, oldName, newName);
        await this.complexPropertyRepository.onRelatedEntityRename(relatedEntityType, oldName, newName);
        return;
    }
    /**
     * wrapper of complex property relation change handler for all subtypes of Property
     * // NOTE: if renaming at the same time, make sure to do that first.
     * @param  {ComplexProperty} complexPropertyToEditConnectionsTo
     * @return {Promise<void>}
     */
    async onUpdatedComplexPropertyConnections(complexPropertyToEditConnectionsTo) {
        await this.simplePropertyRepository.onUpdatedComplexPropertyConnections(complexPropertyToEditConnectionsTo);
        await this.complexPropertyRepository.onUpdatedComplexPropertyConnections(complexPropertyToEditConnectionsTo);
    }
}
//# sourceMappingURL=property-repositories-wrapper.js.map