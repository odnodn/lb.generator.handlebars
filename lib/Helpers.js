const camelCase = function(value) {
    return value.substring(0, 1).toLowerCase() + value.substring(1);
};

const ifEquals = function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
};

const ifNotEquals = function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
};

const getType = function (value) {
    return value.IsEnum ? value.Enum : value.Type;
};

const existsIn = function(collection, property, value) {
    const result = collection.find(function(item) {
        return item[property] == value;
    });
    return result ? true : false;
};

const findIn = function(collection, property, value) {
    return collection.find(function(item) {
        return item[property] == value;
    });
};

const first = function(collection, filter) {
    const result = where(collection, filter);
    return result.length > 0 ? result[0] : null;
};

const any = function(collection, filter) {
    const result = where(collection, filter);
    return result.length > 0;
};

const where = function(collection, filter) {
    const result = [];
    const filters = [];
    const expressions = filter.split(';');

    for (let index = 0; index < expressions.length; index++) {
        const expression = expressions[index];
        const expressionElements = expression.split(' ');
        filters.push({ property: expressionElements[0], comparison: expressionElements[1], value: expressionElements[2] == "true" ? true : expressionElements[2] });
    }

    for (let index = 0; index < filters.length; index++) {
        const filterExpression = filters[index];
        switch (filterExpression.comparison) {
            case 'eq':
                filterExpression.test = function(item) {
                    const value = item[this.property];
                    return value == this.value;
                };
                break;
            case 'ne':
                filterExpression.test = function(item) {
                    const value = item[this.property];
                    return value != this.value;
                };
                break;
            default:
                filterExpression.test = function(item) {
                    const value = item[this.property];
                    return value == this.value;
                };
                break;
        }
    }

    for (let index = 0; index < collection.length; index++) {
        const item = collection[index];

        var match = true;

        for (let index = 0; index < filters.length; index++) {
            const filterExpression = filters[index];
            if (match && filterExpression.test(item)) {
                match = true;
            } else {
                match = false;
            }
        }

        if (match) {
            result.push(item);
        }
    }
    return result;
};

const defaultFormatter = function(property, leftDelimiter, rightDelimiter) {
    return `${leftDelimiter}${this.type}${rightDelimiter}`;
};

const mappedTypes = {
    'Guid': { type: 'uniqueidentifier', formatter: defaultFormatter },
    'DateTime': { type: 'datetime', formatter: defaultFormatter },
    'bool': { type: 'bit', formatter: defaultFormatter },
    'int': { type: 'int', formatter: defaultFormatter },
    'long': { type: 'bigint', formatter: defaultFormatter },
    'short': { type: 'tinyint', formatter: defaultFormatter },
    'string': { 
        type: 'nvarchar', 
        formatter: function(property, leftDelimiter, rightDelimiter) {
            var length = 50;

            if (property.Length && property.Length > 0) {
                length = property.Length;
            }

            return `${leftDelimiter}${this.type}${rightDelimiter}(${length})`;
        }
    },
    'double': { type: 'float', formatter: defaultFormatter },
    'float': { type: 'float', formatter: defaultFormatter },
    'decimal': { 
        type: 'decimal', 
        formatter: function(property, leftDelimiter, rightDelimiter) {
            var precision = 18;
            var scale = 5;

            if (property.Precision && property.Precision > 0) {
                precision = property.Precision;
            }

            if (property.Scale && property.Scale > 0) {
                scale = property.Scale;
            }

            return `${leftDelimiter}${this.type}${rightDelimiter}(${precision}, ${scale})`;
        }
    }
};

const getSqlType = function (value) {
    const type = value.IsEnum ? 'int' : (value.BaseType || value.Type);
    //console.log(`Getting SQL Type for ${type}`);
    return mappedTypes[type].formatter(value, '[', ']');
};

const isNumber = function(value) {
    return !isNaN(value) && (value !== null);
};

const isEmpty = function(value) {
    return (!value || 0 === value.length);
};

module.exports = {
    ifEquals: ifEquals,
    ifNotEquals: ifNotEquals,
    camelCase: camelCase,
    getType: getType,
    findIn: findIn,
    existsIn: existsIn,
    any: any,
    first: first,
    where: where,
    getSqlType: getSqlType,
    isNumber: isNumber,
    isEmpty: isEmpty
};