const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { machine: paramMachine } = require('./param');
const { EVENT } = require('../constant');

/**
 * 将处理参数和返回值
 */
const machine = createMachine({
    prepared: state(
        transition(EVENT.FIND_PARAM_WORD, 'param'),
        transition(EVENT.FIND_RETURN_WORD, 'return'),
        transition(EVENT.FIND_EXAMPLE_WORD, 'example'),
        transition(EVENT.OPEN_H, 'finish'),
        transition(EVENT.END, 'finish'),
    ),
    // 处理params
    param: invoke(paramMachine,
        transition('done', 'prepared',
            reduce((ctx, ev) => {
                const top = ctx.stack.top();
                // ev.type === 'done', ev.data实际上是完整的context
                console.log('target13', ev);
                const { params, interface, comment } = ev.data;
                if (params) {
                    top.params = params;
                }
                if (interface) {
                    top.interface = interface;
                }
                if (comment) {
                    top.comment = comment;
                }
                // 使用完成后将ctx中的数据删除
                ctx.params = [];
                ctx.interface = [];
                ctx._pending = [];
                ctx.comment = null;
                return ctx;
            }),
        ),
    ),
    // 处理返回值
    return: state(
        transition(EVENT.OPEN_CODE, 'return_detail'),
        transition(EVENT.OPEN_A, 'return_detail'),
    ),
    return_detail: state(
        transition(EVENT.FIND_PLAIN_TEXT, 'return_detail',
            guard((ctx, ev) => !ctx.stack.top().return),
            reduce((ctx, ev) => {
                ctx.stack.top().return = ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_P, 'prepared'),
    ),
    // 例子
    example: state(
        transition(EVENT.OPEN_CODE, 'example_detail'),
    ),
    example_detail: state(
        transition(EVENT.FIND_PLAIN_TEXT, 'example_detail',
            reduce((ctx, ev) => {
                const top = ctx.stack.top();
                if (!top.example) {
                    top.example = ev.value;
                } else {
                    top.example += ev.value;
                }
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_CODE, 'prepared'),
    ),
    // 结束
    finish: state(),
}, (ctx) => {
    return {
        // 回味ctx.stack.top()提供params/example/return/interface等可能的内容
        ...ctx,
    };
});

module.exports = exports = {
    machine,
};
