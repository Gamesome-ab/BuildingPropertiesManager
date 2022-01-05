// https://spin.atomicobject.com/2018/11/05/using-an-int-type-in-typescript/
const roundToInt = (num) => Math.round(num);
const toInt = (value) => {
    return Number.parseInt(value);
};
const checkIsInt = (num) => num % 1 === 0;
const assertAsInt = (num) => {
    try {
        if (checkIsInt(num)) {
            return num;
        }
    }
    catch (err) {
        throw new Error(`Invalid Int value (error): ${num}`);
    }
    throw new Error(`Invalid Int value: ${num}`);
};
export const int = assertAsInt;
export const parse = {
    checkIsInt,
    toInt,
    roundToInt,
};
//# sourceMappingURL=int.type.js.map