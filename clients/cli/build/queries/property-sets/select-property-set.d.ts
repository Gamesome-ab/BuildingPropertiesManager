import { PropertySet } from '@building-properties-manager/core';
export declare const selectPropertySetPrompt: (message: string, multiSelect?: boolean, initiallySelectedPsetNames?: string[]) => Promise<PropertySet | PropertySet[]>;
