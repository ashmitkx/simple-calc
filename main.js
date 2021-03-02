"use strict";

/*
	Precedence table for operators.
	Higher the number, greater the precedence.
	The reason for "(" having least precedence is explained further along.
*/
const PRECEDENCE = {
	"^": 3,
	"/": 2,
	"*": 2,
	"+": 1,
	"-": 1
};

/* 
	Association table for operators.
	For explaination: https://en.wikipedia.org/wiki/Operator_associativity	
*/
const LEFT_ASSOCIATION = -1,
	RIGHT_ASSOCIATION = 1;
const ASSOCIATION = {
	"^": RIGHT_ASSOCIATION,
	"/": LEFT_ASSOCIATION,
	"*": LEFT_ASSOCIATION,
	"+": LEFT_ASSOCIATION,
	"-": LEFT_ASSOCIATION
};

const tokenIsDigit = (token) => /\d+/.test(token);
const tokenIsOp = (token) => /[\+\-\*\/\^]/.test(token);

/* 
	Compares the precedence of two operators op1 and op2.
	Returns: 
		1 if op1 has higher precedence
		-1 if op2 has higher precedence
		0 if op1 and op2 have same precedence
*/
const comparePrecedence = (token, opStackTop) => {
	const comparison = PRECEDENCE[token] - PRECEDENCE[opStackTop];
	return Math.sign(comparison);
};

const input = "3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3";
const infix = input.split(" ");

// Stack format: [0] (bottom) -----> [length - 1] (top)
let outStack = [],
	opStack = [];

let i = 0;
while (i < infix.length) {
	let token = infix[i];
	i++;

	if (tokenIsDigit(token)) {
		/* Digits are directly pushed into outStack. */
		outStack.push(token);
	} else if (token === "(") {
		/* ")" is directly pushed into opStack. */
		opStack.push(token);
	} else if (token === ")") {
		/* 
			")" is not added to opStack.
			Pop all operators from opStack into outStack, until a "(" is found.
			"(" is to be discarded.
		*/
		let opStackTop = opStack.pop();
		while (opStackTop !== "(") {
			outStack.push(opStackTop);
			opStackTop = opStack.pop();
		}
	} else if (tokenIsOp(token)) {
		/* Compare the precedence of the operator token (token) and opStackTop */
		let opStackTop = opStack[opStack.length - 1],
			precComparison = comparePrecedence(token, opStackTop);

		/* 
			Continously pop opStackTop into outStack only while:
				1. opStack has elements.
				2. opStackTop is not "(".
				3. opStackTop has higher precedence compared to token OR opStackTop and token have equal precedence, and token is left associative.
		*/
		while (
			opStack.length > 0 &&
			opStackTop !== "(" &&
			(precComparison === -1 ||
				(precComparison === 0 &&
					ASSOCIATION[token] === LEFT_ASSOCIATION))
		) {
			outStack.push(opStack.pop());

			opStackTop = opStack[opStack.length - 1];
			precComparison = comparePrecedence(token, opStackTop);
		}

		opStack.push(token);
	}
}

/* Generate the final postfix by popping the contents of opStack into outStack */
while (opStack.length > 0) {
	outStack.push(opStack.pop());
}

console.log(outStack);
