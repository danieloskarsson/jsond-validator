var JSOND_BOOLEAN = 'boolean',
	JSOND_STRING = 'string',
	JSOND_NUMBER = 'number',
	JSOND_INTEGER = 'integer',
	JSON_NUMBER = '\\-?(?:0|[1-9]\\d*)(?:\\.\\d+)?',
	JSOND_SET_PATTERN = new RegExp('^\{(' + JSON_NUMBER + '(,' + JSON_NUMBER + ')*)\}$'),
	JSOND_INTERVAL_PATTERN = new RegExp(
		'^(\\[|\\()(' + JSON_NUMBER + ')?,(' + JSON_NUMBER + ')?(\\]|\\))$'
	);

/**
 * Validates a given data object according to a given schema
 *
 * @param  {Mixed} data   An arbitrary data object
 * @param  {Mixed} schema An arbitrary JSOND text
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateRoot(data, schema) {
	var err;

	// console.log('validateRoot', data, schema);
	if (Array.isArray(schema)) {
		err = validateArray(data, schema);
	}
	else {
		if (schema === JSOND_BOOLEAN) {
			err = validateBoolean(data);
		}
		else if (schema === JSOND_NUMBER) {
			err = validateNumber(data);
		}
		else if (schema === JSOND_INTEGER) {
			err = validateInteger(data);
		}
		else if (schema === JSOND_STRING) {
			err = validateString(data);
		}
		else {
			err = validateSpecial(data, schema);
		}
	}
	// console.log('err', err);

	return err;
}

/**
 * Validates whether a given data object is a valid boolean value
 *
 * @param  {Mixed} data   An arbitrary data object
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateBoolean(data) {
	// console.log('validateBoolean', data, schema);
	if (typeof data !== 'boolean') {
		return {
			code: 'BOOLEAN_REQUIRED',
			path: '.' // TODO
		};
	}
}

/**
 * Validates whether a given data object is a valid string value
 *
 * @param  {Mixed} data   An arbitrary data object
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateString(data) {
	// console.log('validateString', data, schema);
	if (typeof data !== 'string') {
		return {
			code: 'STRING_REQUIRED',
			path: '.' // TODO
		};
	}
}

/**
 * Validates whether a given data object is a valid number value
 *
 * @param  {Mixed} data   An arbitrary data object
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateNumber(data) {
	// console.log('validateNumber', data, typeof data);
	if (typeof data !== 'number') {
		return {
			code: 'NUMBER_REQUIRED',
			path: '.' // TODO
		};
	}
}

/**
 * Validates whether a given data object is a valid integer value
 *
 * @param  {Mixed} data   An arbitrary data object
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateInteger(data) {
	// console.log('validateInteger', data, typeof data);
	if (typeof data !== 'number' || data < 0 || data % 1 !== 0) {
		return {
			code: 'INTEGER_REQUIRED',
			path: '.' // TODO
		};
	}
}

/**
 * Validates whether a given data object is a valid special value,
 * which can be a set, an interval or a regular expression.
 *
 * @param  {Mixed} data   An arbitrary data object
 * @param  {Mixed} schema An arbitrary JSOND text
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateSpecial(data, schema) {
	var parsed;
	// console.log('validateSpecial', data, schema);

	parsed = schema.match(JSOND_SET_PATTERN);
	if (parsed) {
		return validateSet(data, schema, parsed);
	}
	else {
		parsed = schema.match(JSOND_INTERVAL_PATTERN);
		if (parsed) {
			return validateInterval(data, schema, parsed);
		}
		else {
			return validateRegularExpression(data, schema);
		}
	}
}

/**
 * Validates whether a given data object is a valid set value
 *
 * @param  {Mixed} data   An arbitrary data object
 * @param  {Mixed} schema An arbitrary JSOND text
 * @param  {Mixed} parsed The result of the schema parsing by regex
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateSet(data, schema, parsed) {
	var values = parsed[1].split(','),
		dataStringified = String(data),
		err;

	err = validateNumber(data);

	// console.log('validateSet', dataStringified, schema, values);
	if (!err && values.indexOf(dataStringified) === -1) {
		err = {
			code: 'NOT_IN_SET',
			path: '.' // TOOD
		};
	}

	return err;
}

/**
 * Validates whether a given data object is a valid interval value
 *
 * @param  {Mixed} data   An arbitrary data object
 * @param  {Mixed} schema An arbitrary JSOND text
 * @param  {Mixed} parsed The result of the schema parsing by regex
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateInterval(data, schema, parsed) {
	var startInclusive = (parsed[1] === '['),
		endInclusive = (parsed[4] === ']'),
		start,
		end,
		valid,
		err;

	// console.log('validateInterval', data, schema, parsed, startInclusive, endInclusive);

	err = validateNumber(data);

	// interval start
	if (!err && parsed[2] && parsed[2].length) {
		start = Number(parsed[2]);
		valid = false;

		if (startInclusive) {
			valid = (data >= start);
		}
		else {
			valid = (data > start);
		}

		if (!valid) {
			err = {
				code: 'INTERVAL_START',
				path: '.' // TODO
			};
		}
	}

	// interval end
	if (!err && parsed[3] && parsed[3].length) {
		end = Number(parsed[3]);
		valid = false;

		if (endInclusive) {
			valid = (data <= end);
		}
		else {
			valid = (data < end);
		}

		if (!valid) {
			err = {
				code: 'INTERVAL_END',
				path: '.' // TODO
			};
		}
	}

	return err;
}

/**
 * Validates whether a given data object is a valid regular expression value
 *
 * @param  {Mixed} data   An arbitrary data object
 * @param  {Mixed} schema An arbitrary JSOND text
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateRegularExpression(data, schema) {
	var pattern;

	if (schema[0] !== '^') {
		schema = '^' + schema;
	}
	if (schema[schema.length - 1] !== '$') {
		schema = schema + '$';
	}
	pattern = new RegExp(schema);
	// console.log('validateRegularExpression', data, pattern);

	if (!pattern.test(data)) {
		return {
			code: 'STRING_PATTERN',
			path: '.' // TODO
		};
	}
}

/**
 * Validates whether a given data object is a valid array value
 *
 * @param  {Mixed} data   An arbitrary data object
 * @param  {Mixed} schema An arbitrary JSOND text
 *
 * @return {Object}       An error object, if the validation failed
 */
function validateArray(data, schema) {
	var di, dl,
		si, sl,
		valid,
		err;

	// console.log('validateArray', data, schema);

	if (!Array.isArray(data)) {
		return {
			code: 'ARRAY_REQUIRED',
			path: '.' // TODO
		};
	}

	sl = schema.length;

	// Using `for` due to speed over native `forEach` or `reduce`
	for (di = 0, dl = data.length; di < dl; di++) {
		valid = false;

		for (si = 0; si < sl; si++) {
			err = validateRoot(data[di], schema[si]);
			if (!err) {
				valid = true;
				break;
			}
		}

		if (!valid) {
			return {
				code: 'ARRAY_ITEM',
				path: '.' // TODO
			};
		}
	}
}

/**
 * The main validator class
 *
 * @constructor
 */
function Validator() {
}

module.exports = Validator;

Validator.prototype = {
	validate: function(data, schema) {
		var result = {
				valid: true,
				errors: []
			},
			errors;

		errors = validateRoot(data, schema);

		if (errors) {
			result.valid = false;
			result.errors = errors;
		}
		return result;
	}
};
