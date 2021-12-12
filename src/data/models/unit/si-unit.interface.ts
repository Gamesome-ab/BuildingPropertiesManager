import {DimensionalExponents} from '../dimensional-exponents.interface';
import {NamedUnit} from './named-unit';
import {SIPrefix} from './si-prefix.enum';
import {SIUnitName} from './si-unit-name.enum';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcsiunit.htm}
 */
export interface SIUnit extends NamedUnit {
    prefix?: SIPrefix // The SI Prefix for defining decimal multiples and submultiples of the unit.
    name: SIUnitName // NOTE: Even though the SI system's base unit for mass is kilogram, the IfcSIUnit for mass is gram if no Prefix is asserted.
    dimensions: DimensionalExponents // NOTE: The dimensional exponents of SI units are derived by function IfcDimensionsForSiUnit(this.name).
}
