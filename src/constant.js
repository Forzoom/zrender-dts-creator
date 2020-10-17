Array.prototype.top = function() {
    return this.length ? this[this.length - 1] : undefined;
}

const EVENT = exports.EVENT = {
    START: 'start',
    END: 'end',

    FIND_METHOD_LIKE: 'find_method_like',

    FIND_PARAM_WORD: 'find_param_word',
    FIND_RETURN_WORD: 'find_return_word',
    FIND_RELATIVE_WORD: 'find_relative_word',
    FIND_CONSTRUCTOR_WORD: 'find_constructor_word',
    FIND_EXAMPLE_WORD: 'find_example_word',
    FIND_STATIC_CLASS_WORD: 'find_static_class_word',

    FIND_PLAIN_TEXT: 'find_plain_text',
    OPEN_A: 'open_a',
    CLOSE_A: 'close_a',
    OPEN_H: 'open_h',
    OPEN_P: 'open_p',
    CLOSE_P: 'close_p',
    OPEN_TABLE: 'open_table',
    CLOSE_TABLE: 'close_table',
    OPEN_TBODY: 'open_tbody',
    OPEN_TR: 'open_tr',
    CLOSE_TR: 'close_tr',
    OPEN_TD: 'open_td',
    CLOSE_TD: 'close_td',
    OPEN_CODE: 'open_code',
    CLOSE_CODE: 'close_code',
};

// 关键字
exports.keywords = {
    '参数': EVENT.FIND_PARAM_WORD,
    '返回值': EVENT.FIND_RETURN_WORD,
    '相关': EVENT.FIND_RELATIVE_WORD,
    '构造函数': EVENT.FIND_CONSTRUCTOR_WORD,
    '例子': EVENT.FIND_EXAMPLE_WORD,
    '静态类': EVENT.FIND_STATIC_CLASS_WORD,
};
