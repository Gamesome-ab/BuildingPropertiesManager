import { Identifier, Text, SimplePropertyExtensionType, PropertyExtensionType, Property } from '@building-properties-manager/core';
export declare type PropertyBaseData = {
    type: SimplePropertyExtensionType | Exclude<PropertyExtensionType, 'SimpleProperty'>;
    name: Identifier;
    description: Text;
};
/**
 * Generic function to add a property of any subtype.
 * @param {PropertyBaseData} data - The data to use for the property.
 * @param {function} superBack - the function to go back to the previous menu
 * @param {function} superNext - the function to go to the next menu
 * @param {number} currentPromptStep - The current prompt step (used only locally)
 * @return {Promise<PropertyBaseData>}
 */
export declare const handleAddPropertyNameAndDescription: <T extends Property>(data: PropertyBaseData, superBack: () => any, superNext: (data: PropertyBaseData) => any, currentPromptStep?: number) => Promise<void | T>;
/**
 * Generic function to edit base parameters of a property of any subtype.
 * @param {Property} property - the property to edit. Note that this will be modified in place!
 * @param {function} superBack
 * @return {Promise<Property>}
 */
export declare const handleEditPropertyNameAndDescription: <T extends Property>(property: T, superBack: () => Promise<any>) => Promise<void | T>;
