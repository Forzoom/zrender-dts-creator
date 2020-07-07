const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');

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
                ctx.params.push([]);
                return ctx;
            }),
        ),
        transition(EVENT.OPEN_TD, 'handle',
            reduce((ctx) => {
                const params = ctx.params;
                params[params.length - 1].push('');
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'type_object',
            guard((ctx, ev) => {
                const param = ctx.params.top();
                return param.length == 2 && param[1] === '' && ev.value == 'Object';
            }),
            reduce((ctx) => {
                ctx.interface = [];
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'handle',
            reduce((ctx, ev) => {
                const text = ev.value;
                if (text == '&nbsp;') {
                    return ctx;
                }
                const param = ctx.params.top();
                param[param.length - 1] += ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_TABLE, 'finish'),
    ),
    type_object: state(
        immediate('finish', hey('1')),
        transition(EVENT.OPEN_TR, 'type_object',
            reduce((ctx) => {
                ctx.interface.push([]);
                return ctx;
            }),
        ),
        transition(EVENT.OPEN_TD, 'handle',
            reduce((ctx) => {
                ctx.interface.push([]);
                return ctx;
            }),
        ),
        transition(EVENT.OPEN_TR, 'handle',
            reduce((ctx) => {
                ctx.params.push([]);
                return ctx;
            }),
        ),
    ),
    finish: state(),
}, (ctx) => ctx);

module.exports = exports = {
    machine,
}
