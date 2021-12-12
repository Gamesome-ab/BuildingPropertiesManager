// https://spin.atomicobject.com/2018/11/05/using-an-int-type-in-typescript/

export type Int = number & { __int__: void };

export const roundToInt = (num: number): Int => Math.round(num) as Int;

export const toInt = (value: string): Int => {
	return Number.parseInt(value) as Int;
};

export const checkIsInt = (num: number): num is Int => num % 1 === 0;

const assertAsInt = (num: number): Int => {
	try {
		if (checkIsInt(num)) {
			return num;
		}
	} catch (err) {
		throw new Error(`Invalid Int value (error): ${num}`);
	}

	throw new Error(`Invalid Int value: ${num}`);
};

export const int = assertAsInt;
