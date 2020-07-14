const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');
const { capitalize } = require('../utils');

function hey(...args) {
    return action((ctx) => { console.log('hey', ...args) });
}

const machine = createMachine({
    prepared: state(
        // 某些位置将函数的说明写在了"参数"之后
        transition(EVENT.FIND_PLAIN_TEXT, 'prepared',
            reduce((ctx, ev) => {
                ctx.comment = ev.value;
                return ctx;
            }),
        ),
        // 这里不使用open_table，而使用open_tbody
        transition(EVENT.OPEN_TBODY, 'handle'),
    ),
    handle: state(
        transition(EVENT.OPEN_TR, 'handle',
            reduce((ctx) => {
                ctx._pending.push([]);
                return ctx;
            }),
        ),
        transition(EVENT.OPEN_TD, 'handle',
            reduce((ctx) => {
                ctx.plain_text_buf = '';
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'handle',
            reduce((ctx, ev) => {
                const text = ev.value;
                const def = ctx.stack.top();
                if (text !== '&nbsp;') {
                    ctx.plain_text_buf += ev.value;
                }

                const pending = ctx._pending.top();
                if (pending.length == 1 && ev.value == 'Object') {
                    const interface_name = capitalize(def.method_name) + capitalize(pending[0]);
                    ctx.interface.push({
                        name: interface_name,
                        properties: [],
                    });
                }

                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_TD, 'handle',
            reduce((ctx, ev) => {
                ctx._pending.top().push(ctx.plain_text_buf);
                ctx.plain_text_buf = '';
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_TR, 'handle',
            reduce((ctx, ev) => {
                console.log(ctx._pending);
                const pending = ctx._pending.pop();
                if (pending[0].indexOf('.') >= 0) {
                    pending[0] = pending[0].split('.').pop();
                    ctx.interface.top().properties.push(pending);
                } else {
                    hey(pending[1]);
                    if (pending[1] == 'Object') {
                        pending[1] = ctx.interface.top().name;
                    }
                    ctx.params.push(pending);   
                }
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_TABLE, 'finish'),
    ),
    finish: state(),
}, (ctx) => {
    /**
     * 将返回的数据
     * 
     * params: 记录参数
     * interface: 记录生成的interface
     * comment: 可能偶尔有文档错误，导致method的comment写到了参数里面
     * _pending: 用于临时记录参数信息
     */
    return { ...ctx, params: [], interface: [], _pending: [], comment: null };
});

module.exports = exports = {
    machine,
}
