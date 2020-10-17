const { traverse, set } = require('../utils');

/**
 * 解析一个tr中的param信息
 * @param {string[]} info 
 * @param {{ [paramName: string]: any }} parsed 存储所有的param信息
 */
function parseParam(info, parsed) {
    const names = info[0].split('.');
    for (let i = 0, len = names.length; i < len; i++) {
        const path = names.slice(0, i + 1);
        const def = traverse(parsed, path);
        if (!def) {
            /** @type {ParamDef} */
            const newDef = {
                __name: path[path.length - 1],
                __type: 'unknown',
            };
            set(parsed, path, newDef);
        }
    }

    const def = traverse(parsed, names);
    def.__type = info[1];
    def.__default = info[2];
    def.__comment = info[3];
}

module.exports = exports = {
    parseParam,
};
