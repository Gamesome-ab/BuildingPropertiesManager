import {DimensionalExponents} from '../dimensional-exponents.interface';
import {UnitEnum} from './unit-enum.enum';
import {Unit} from './unit.interface';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcnamedunit.htm}
 */
export interface NamedUnit extends Unit {
    dimensions: DimensionalExponents
    unitType: UnitEnum
}
