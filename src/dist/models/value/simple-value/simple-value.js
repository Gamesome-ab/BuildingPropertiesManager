import { Value } from '../value.js';
/**
 * @property {string} value
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcsimplevalue.htm}
 */
export class SimpleValue extends Value {
    /**
     * @param {ValueType} value
     */
    constructor(value = null) {
        super();
        this.value = value;
    }
}
;
//# sourceMappingURL=simple-value.js.map