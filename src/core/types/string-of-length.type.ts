// https://stackoverflow.com/questions/51813272/declaring-string-type-with-min-max-length-in-typescript

// eslint-disable-next-line no-unused-vars
export type StringOfLength<Min, Max> = string & {
  readonly StringOfLength: unique symbol // this is a phantom type
};

/**
 * This is a type guard function which can be used to assert that a string is of type StringOfLength<Min,Max>
 * @param {string} str The string to check
 * @param {number} min The minimum length of the string
 * @param {number} max The maximum length of the string
 * @return {boolean} True if the string is of type StringOfLength<Min,Max>
 */
const isStringOfLength = <Min extends number, Max extends number>(
	str: string,
	min: Min,
	max: Max,
): str is StringOfLength<Min, Max> => str.length >= min && str.length <= max;

/**
 * type constructor function
 * @param {string} input The string to check
 * @param {number} min The minimum length of the string
 * @param {number} max The maximum length of the string
 * @return {StringOfLength} a string of type StringOfLength<Min,Max>
 */
export const stringOfLength = <Min extends number, Max extends number>(
	input: unknown,
	min: Min = 1 as Min,
	max: Max = 255 as Max,
): StringOfLength<Min, Max> => {
	if (typeof input !== 'string') {
		throw new Error(`Invalid input (not recognized as string): ${input}`);
	}

	if (!isStringOfLength(input, min, max)) {
		throw new Error('Input is not between specified min and max');
	}

	return input;
};
