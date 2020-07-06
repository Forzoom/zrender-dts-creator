const { createMachine, state, transition, interpret, action, reduce, immediate } = require('robot3');
const { EVENT } = require('./constant');

exports.machine = createMachine({
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
                top.name = ev.value;
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
    param: state(
        transition(EVENT.OPEN_P, 'param'),
        transition(EVENT.FIND_PLAIN_TEXT, 'param',
            reduce((ctx, ev) => {
                const d = ctx.definition.top();
                d.comment = ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.OPEN_TABLE, 'param_table'),
    ),
    param_table: state(
        transition(EVENT.OPEN_TBODY, 'param_tbody'),
    ),
    param_tbody: state(
        transition(EVENT.OPEN_TR, 'param_tbody',
            reduce((ctx) => {
                const params = ctx.definition.top().params;
                params.push([]);
                return ctx;
            }),
        ),
        transition(EVENT.OPEN_TD, 'param_tbody',
            reduce((ctx) => {
                const params = ctx.definition.top().params;
                params[params.length - 1].push('');
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'param_tbody',
            reduce((ctx, ev) => {
                const param = ctx.definition.top().params.top();
                param[param.length - 1] += ev.value;
                return ctx;
            }),
        ),
    ),
}, () => ({ definition: [] }));
