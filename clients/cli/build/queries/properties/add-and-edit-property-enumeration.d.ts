import { PropertyEnumeration } from '@building-properties-manager/core';
export declare enum PropertyEnumerationValueAction {
    ADD = "Add new value to the enumeration",
    EDIT = "See / edit existing value on the enumeration",
    REMOVE = "Remove value from the enumeration",
    SAVE = "Store all edits and go back",
    CANCEL = "Discard all edits and go back"
}
export declare const handleAddPropertyEnumeration: (oldPropertyEnumeration?: PropertyEnumeration, currentlyEditing?: PropertyEnumeration, currentPromptStep?: number) => Promise<void>;
export declare const handleEditPropertyEnumeration: (oldPropertyEnumeration?: PropertyEnumeration, currentlyEditing?: PropertyEnumeration, currentPromptStep?: number) => Promise<void>;
