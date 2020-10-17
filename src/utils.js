exports.capitalize = function(val) {
    return val[0].toUpperCase() + val.substr(1);
}

/**
 * 
 * @param {any} obj 
 * @param {string[]} keyPath 
 */
exports.traverse = function(obj, keyPath) {
    for (const key of keyPath) {
        if (obj != null) {
            obj = obj[key];
        } else {
            break;
        }
    }
    return obj;
}

/**
 * 
 * @param {any} obj 
 * @param {string[]} keyPath 
 * @param {any} value 
 */
exports.set = function(obj, keyPath, value) {
    const last = keyPath.pop();
    for (const key of keyPath) {
        if (obj != null) {
            obj = obj[key];
        } else {
            obj = {};
        }
    }
    obj[last] = value;
}
