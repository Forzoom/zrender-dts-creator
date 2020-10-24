const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { machine: paramMachine } = require('./param');
const { machineFactory: collectTextMachineFactory } = require('./collect_text');
const { EVENT } = require('../constant');

/**
 * 将处理参数和返回值
 */
const machine = createMachine({
    prepared: state(
        transition(EVENT.FIND_PARAM_WORD, 'param'),
        transition(EVENT.FIND_RETURN_WORD, 'return'),
        transition(EVENT.FIND_EXAMPLE_WORD, 'example'),
        // 因为目前暂时没有明确的结束事件
        transition(EVENT.OPEN_H, 'finish'),
        transition(EVENT.END, 'finish'),
    ),
    // 处理params
    param: invoke(paramMachine,
        transition('done', 'prepared',
            reduce((ctx, ev) => {
                // const top = ctx.stack.top();
                // ev.type === 'done', ev.data实际上是完整的context
                const { params, comment } = ev.data;
                if (params) {
                    ctx.params = params;
                }
                if (comment) {
                    ctx.comment = comment;
                }
                return ctx;
            }),
        ),
    ),
    // 处理返回值
    return: invoke(collectTextMachineFactory(EVENT.CLOSE_P),
        transition('done', 'prepared',
            reduce((ctx, ev) => {
                ctx.ret = ev.data.plain_text_buf;
                return ctx;
            }),
        ),
    ),
    // 例子
    example: state(
        transition(EVENT.OPEN_CODE, 'example_detail'),
    ),
    example_detail: state(
        transition(EVENT.FIND_PLAIN_TEXT, 'example_detail',
            reduce((ctx, ev) => {
                if (!ctx.example) {
                    ctx.example = ev.value;
                } else {
                    ctx.example += ev.value;
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
        ...ctx,
        params: null,
        comment: null,
        ret: null,
        example: '',
    };
});

module.exports = exports = {
    machine,
};
