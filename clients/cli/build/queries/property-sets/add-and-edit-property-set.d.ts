import { PropertySet } from '@building-properties-manager/core';
export declare const handleAddPropertySet: (currentlyEditing?: PropertySet, currentPromptStep?: number) => Promise<PropertySet | void>;
export declare const handleEditPropertySet: (oldPropertySet: PropertySet, currentlyEditing?: PropertySet, currentPromptStep?: number) => Promise<PropertySet | void>;
