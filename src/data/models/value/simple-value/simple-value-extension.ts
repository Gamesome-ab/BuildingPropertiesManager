import {Binary} from './binary.js';
import {Boolean} from './boolean.js';
import {Identifier} from './identifier.js';
import {Label} from './label.js';
import {Text} from './text.js';


/**
 * helper constant to allow creating value-entities with new SimpleValueExtension\[simpleValueExtensionType\]()
 */
export const SimpleValueExtension = {
	Binary,
	Boolean,
	Identifier,
	Label,
	Text,
};


export type SimpleValueExtensionType = keyof typeof SimpleValueExtension;
