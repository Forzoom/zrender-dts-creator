const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');
const { machine: paramMachine } = require('./param');

const machine = createMachine({
    idle: state(
        transition(EVENT.START, 'prepared',
            action(() => { console.log('start!') }),
        ),
    ),
    prepared: state(
        transition(EVENT.OPEN_H, 'define',
            reduce((ctx, ev) => {
                ctx.definition.push({});
                return ctx;
            }),
        ),
    ),
    define: state(
        transition(EVENT.FIND_METHOD_LIKE, 'method',
            reduce((ctx, ev) => {
                const top = ctx.definition.top();
                top.type = 'method';
                top.raw_name = ev.value;
                const name = ev.value.split('.').pop();
                top.method_name = name.substr(0, name.indexOf('('));
                return ctx;
            }),
        ),
    ),
    method: state(
        transition(EVENT.FIND_PARAM_WORD, 'param',
            reduce((ctx) => {
                const top = ctx.definition.top();
                top.params = [];
                return ctx;
            }),
        ),
    ),
    param: invoke(paramMachine,
        transition('done', 'return',
            reduce((ctx, ev) => {
                const top = ctx.definition.top();
                if (ev.data.params) {
                    top.params = ev.data.params;
                }
                if (ev.data.comment) {
                    top.comment = ev.data.comment;
                }
                return ctx;
            }),
        )
    ),
    return: state(
        transition(EVENT.OPEN_CODE, 'return_value')
    ),
    return_value: state(
        transition(EVENT.FIND_PLAIN_TEXT, 'return_value',
            guard((ctx, ev) => !ctx.definition.top().return),
            reduce((ctx, ev) => {
                ctx.definition.top().return = ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.FIND_RELATIVE_WORD, 'relative'),
    ),
    relative: state(
        immediate('prepared'),
    ),
    final: state(),
}, () => ({ definition: [] }));

module.exports = exports = {
    machine,
};
