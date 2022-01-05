import { SimpleValueExtensionType } from '@building-properties-manager/core';
import { ValueExtensionType } from '@building-properties-manager/core';
import { SimpleValue } from '@building-properties-manager/core';
export declare const handleAddAndEditValue: (withValuePrompt?: boolean, oldValue?: SimpleValue<any>, currentPromptData?: {
    mainValueType?: ValueExtensionType;
    subValueType?: SimpleValueExtensionType;
    value?: any;
}, currentPromptStep?: number) => Promise<SimpleValue<any>>;
