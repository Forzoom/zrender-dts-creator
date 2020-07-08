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
        transition(EVENT.OPEN_TABLE, 'start'),
    ),
    start: state(
        transition(EVENT.OPEN_TBODY, 'handle',
            reduce((ctx) => {
                ctx.params = [];
                return ctx;
            }),
        ),
    ),
    handle: state(
        transition(EVENT.OPEN_TR, 'handle',
            reduce((ctx) => {
                ctx.pending.push([]);
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
                const definition = ctx.definition.top();
                if (text !== '&nbsp;') {
                    ctx.plain_text_buf += ev.value;
                }

                const pending = ctx.pending.top();
                if (pending.length == 1 && ev.value == 'Object') {
                    const interface_name = capitalize(definition.method_name) + capitalize(pending[0]);
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
                ctx.pending.top().push(ctx.plain_text_buf);
                ctx.plain_text_buf = '';
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_TR, 'handle',
            reduce((ctx, ev) => {
                const pending = ctx.pending.pop();
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
}, (ctx) => ({ ...ctx, pending: [], interface: [] }));

module.exports = exports = {
    machine,
}
