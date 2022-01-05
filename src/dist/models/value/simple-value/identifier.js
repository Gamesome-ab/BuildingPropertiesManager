import { SimpleValue } from './simple-value.js';
import { stringOfLength } from '../../../types/string-of-length.type.js';
/**
 * @property {string} value a string of length 1 to 255.
 * An identifier is an alphanumeric string which allows an individual thing to be identified.
 * It may not provide natural-language meaning.
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcidentifier.htm}
 */
export class Identifier extends SimpleValue {
    /**
     * @param {string} value that will be converted to a string of length 1 to 255.
     */
    constructor(value = null) {
        if (value === null)
            super(null);
        else
            super(stringOfLength(value));
    }
}
//# sourceMappingURL=identifier.js.map