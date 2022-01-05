export const getEnumTextByValue = ( enumToGetFrom: any, valueOperator: string ): string => {
	let operator: string;
	for ( const [key, value] of Object.entries( enumToGetFrom ) ) {
		value === valueOperator ? operator = key : null;
	}
	return operator;
};
