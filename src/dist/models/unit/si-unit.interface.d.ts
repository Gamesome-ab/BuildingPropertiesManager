import { DimensionalExponents } from '../dimensional-exponents.interface';
import { NamedUnit } from './named-unit';
import { SIPrefix } from './si-prefix.enum';
import { SIUnitName } from './si-unit-name.enum';
/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcsiunit.htm}
 */
export interface SIUnit extends NamedUnit {
    prefix?: SIPrefix;
    name: SIUnitName;
    dimensions: DimensionalExponents;
}
