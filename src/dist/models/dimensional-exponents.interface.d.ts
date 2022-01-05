import { Int } from '../types/int.type';
/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcdimensionalexponents.htm}
 */
export interface DimensionalExponents {
    lengthExponent: Int;
    massExponent: Int;
    timeExponent: Int;
    electricCurrentExponent: Int;
    thermodynamicTemperatureExponent: Int;
    amountOfSubstanceExponent: Int;
    luminousIntensityExponent: Int;
}
