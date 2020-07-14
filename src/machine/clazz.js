const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { machine: paramMachine } = require('./param');
const { EVENT } = require('../constant');

const machine = createMachine({
    prepared: state(
        // 在class定义之后发现的文本，都视为注释
        transition(EVENT.FIND_PLAIN_TEXT, 'prepared',
            reduce((ctx, ev) => {
                ctx.comment = ev.value;
                return ctx;
            }),
        ),
        // 处理构造函数
        transition(EVENT.FIND_CONSTRUCTOR_WORD, 'class_constructor',
            reduce((ctx, ev) => {
                ctx.constructor = {};
                return ctx;
            }),
        ),
        // 处理params
        transition(EVENT.OPEN_TABLE, 'params'),
        transition(EVENT.OPEN_H, 'finish'),
        transition(EVENT.END, 'finish'),
    ),
    // 处理构造函数
    class_constructor: state(
        // 之后都文本视为构造函数的注释
        transition(EVENT.OPEN_CODE, 'class_constructor_desc'),
    ),
    // 构造函数注释
    class_constructor_desc: state(
        // 之后都文本视为构造函数的内容
        transition(EVENT.FIND_PARAM_WORD, 'class_constructor_desc',
            reduce((ctx, ev) => {
                ctx.constructor.raw = ev.value;
                return ctx;
            }),
        ),
        // 结束
        transition(EVENT.CLOSE_CODE, 'prepared'),
    ),
    // 处理参数
    params: invoke(paramMachine,
        transition('done', 'prepared',
            reduce((ctx, ev) => {
                // 保存params数据
                const { params, interface } = ev.data;
                if (params) {
                    ctx.constructor.params = params;
                }
                if (interface) {
                    ctx.constructor.interface = interface;
                }
                return ctx;
            }),
        ),
    ),
    finish: state(),
}, (ctx) => {
    return {
        ...ctx,
        // 类描述
        comment: null,
        // 构造函数描述
        constructor: null,
    };
});

module.exports = {
    machine,
};
