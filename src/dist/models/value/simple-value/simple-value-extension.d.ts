import { Binary } from './binary.js';
import { Boolean } from './boolean.js';
import { Identifier } from './identifier.js';
import { Label } from './label.js';
import { Text } from './text.js';
/**
 * helper constant to allow creating value-entities with new SimpleValueExtension\[simpleValueExtensionType\]()
 *
 * or with value as Reflect.construct(SimpleValueExtension\[simpleValueExtensionType\], [value])
 */
export declare const SimpleValueExtension: {
    Binary: typeof Binary;
    Boolean: typeof Boolean;
    Identifier: typeof Identifier;
    Label: typeof Label;
    Text: typeof Text;
};
export declare type SimpleValueExtensionType = keyof typeof SimpleValueExtension;
