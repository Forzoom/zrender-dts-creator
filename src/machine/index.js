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
        transition(EVENT.FIND_PLAIN_TEXT, 'method',
            guard((ctx, ev) => {
                return /^[a-zA-Z.]*\([a-z, ]*\)$/.test(ev.value);
            }),
            reduce((ctx, ev) => {
                const top = ctx.definition.top();
                top.type = 'method';
                top.raw_name = ev.value;
                const name = ev.value.split('.').pop();
                top.method_name = name.substr(0, name.indexOf('('));
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'class',
            guard((ctx, ev) => {
                return /^([a-zA-Z]*.)*[A-Z][a-z, ]*$/.test(ev.value);
            }),
            reduce((ctx, ev) => {
                const top = ctx.definition.top();
                top.type = 'class';
                top.raw_name = ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'property',
            guard((ctx, ev) => {
                return /^[a-zA-Z.]*[a-z, ]*$/.test(ev.value);
            }),
            reduce((ctx, ev) => {
                const top = ctx.definition.top();
                top.type = 'property';
                top.raw_name = ev.value;
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
    property: state(
        transition(EVENT.OPEN_CODE, 'property_desc'),
    ),
    property_desc: state(
        transition(EVENT.FIND_PLAIN_TEXT, 'property_desc',
            guard((ctx, ev) => !ctx.definition.top().property_type),
            reduce((ctx, ev) => {
                ctx.definition.top().property_type = ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_P, 'prepared'),
    ),
    class: state(),
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
                if (ev.data.interface) {
                    top.interface = ev.data.interface;
                }
                return ctx;
            }),
        )
    ),
    return: state(
        transition(EVENT.OPEN_CODE, 'return_desc')
    ),
    return_desc: state(
        transition(EVENT.FIND_PLAIN_TEXT, 'return_desc',
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
