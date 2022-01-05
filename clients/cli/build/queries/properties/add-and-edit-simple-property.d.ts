import { Identifier, Text, SimplePropertyExtensionType, SimpleProperty } from '@building-properties-manager/core';
export declare const selectSimplePropertyExtensionPrompt: (old?: SimplePropertyExtensionType) => Promise<SimplePropertyExtensionType>;
export declare const handleAddSimpleProperty: (simplePropertyExtensionType?: SimplePropertyExtensionType, name?: Identifier, description?: Text, simpleProperty?: SimpleProperty, currentPromptStep?: number) => Promise<SimpleProperty | void>;
export declare const handleEditSimpleProperty: (oldSimpleProperty: SimpleProperty, currentlyEditing?: SimpleProperty) => Promise<SimpleProperty | void>;
