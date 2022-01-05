import { ComplexProperty } from '@building-properties-manager/core';
export declare enum ComplexPropertyHasPropertiesAction {
    ADD = "Add new property reference to the complex property",
    REMOVE = "Remove property reference from the complex property, go back by Ctrl+C",
    CONTINUE = "Continue to validating the property and possibly adding it to a property set",
    CANCEL = "Discard all edits and go back"
}
export declare const handleAddComplexProperty: (complexProperty?: ComplexProperty, currentPromptStep?: number) => Promise<ComplexProperty | void>;
export declare const handleEditComplexProperty: (oldSimpleProperty: ComplexProperty, currentlyEditing?: ComplexProperty) => Promise<ComplexProperty | void>;
