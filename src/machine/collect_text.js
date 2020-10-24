const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');

const machineFactory = function(finishTrigger) {
    return createMachine({
        handle: state(
            transition(EVENT.FIND_PLAIN_TEXT, 'handle',
                reduce((/** @type {RootContext} */ctx, ev) => {
                    const text = ev.value;
                    if (text !== '&nbsp;') {
                        ctx.plain_text_buf += ev.value;
                    }
                    return ctx;
                }),
            ),
            transition(finishTrigger, 'finish',
            reduce((/** @type {RootContext} */ctx, ev) => {
                return ctx;
            }),
            ),
        ),
        finish: state(),
    }, (ctx) => {
        /**
         * 将返回的数据
         * 
         * params: 记录参数
         * interface: 记录生成的interface
         * comment: 可能偶尔有文档错误，导致method的comment写到了参数里面，例如zrender.dispose
         * _pending: 用于临时记录参数信息
         */
        return {
            ...ctx,
            plain_text_buf: '',
        };
    });
}

module.exports = exports = {
    machineFactory,
};
