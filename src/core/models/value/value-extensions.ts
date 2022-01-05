import {SimpleValue} from './simple-value/simple-value.js';

export const ValueExtension = {
	// MeasureValue
	SimpleValue,
	// DerivedMeasureValue
};

export type ValueExtensionType = keyof typeof ValueExtension;
