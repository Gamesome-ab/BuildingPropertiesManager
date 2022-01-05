export const getEnumTextByValue = (enumToGetFrom, valueOperator) => {
    let operator;
    for (const [key, value] of Object.entries(enumToGetFrom)) {
        value === valueOperator ? operator = key : null;
    }
    return operator;
};
//# sourceMappingURL=enum-helpers.js.map