const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');
const { machine: paramMachine } = require('./param');
const { machine: methodMachine } = require('./method');

const machine = createMachine({
    idle: state(
        transition(EVENT.START, 'prepared',
            action(() => { console.log('start!') }),
        ),
    ),
    prepared: state(
        transition(EVENT.OPEN_H, 'define'),
        transition(EVENT.END, 'before_finish'),
    ),
    define: state(
        // 判断是定义函数
        transition(EVENT.FIND_PLAIN_TEXT, 'method',
            guard((ctx, ev) => {
                console.log('define1', /^[a-zA-Z.]*\([a-z, ]*\)$/.test(ev.value));
                return /^[a-zA-Z.]*\([a-z, ]*\)$/.test(ev.value);
            }),
            reduce((ctx, ev) => {
                console.log('define1_1');
                const name = ev.value.split('.').pop();
                ctx.stack.push({
                    type: 'method',
                    raw_name: ev.value,
                    method_name: name.substr(0, name.indexOf('(')),
                });
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'class',
            guard((ctx, ev) => {
                console.log('define2', /^([a-zA-Z]*.)*[A-Z][a-z, ]*$/.test(ev.value));
                return /^([a-zA-Z]*.)*[A-Z][a-z, ]*$/.test(ev.value);
            }),
            reduce((ctx, ev) => {
                ctx.stack.push({
                    type: 'class',
                    raw_name: ev.value,
                    methods: [],
                });
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'property',
            guard((ctx, ev) => {
                console.log('define3');
                return /^[a-zA-Z.]*[a-z, ]*$/.test(ev.value);
            }),
            reduce((ctx, ev) => {
                ctx.stack.push({
                    type: 'property',
                    raw_name: ev.value,
                });
                return ctx;
            }),
        ),
        transition(EVENT.END, 'before_finish'),
    ),
    // 处理method
    method: invoke(methodMachine,
        transition('done', 'define',
            reduce((ctx, ev) => {
                const def = ctx.stack.pop();
                const top = ctx.stack.top();
                if (top && top.type === 'class') {
                    if (!top.methods) {
                        top.methods = [];
                    }
                    top.methods.push(def);
                } else {
                    ctx.definition.push(def);
                }
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
                ctx.stack.top().property_type = ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_P, 'prepared',
            reduce((ctx, ev) => {
                const def = ctx.stack.pop();
                const top = ctx.stack.top();
                if (top && top.type === 'class') {
                    if (!top.methods) {
                        top.methods = [];
                    }
                    top.methods.push(def);
                } else {
                    ctx.definition.push(def);
                }
                return ctx;
            }),
        ),
    ),
    class: state(
        transition(EVENT.FIND_CONSTRUCTOR_WORD, 'class_constructor'),
    ),
    class_constructor: state(
        transition(EVENT.FIND_PLAIN_TEXT, 'class_constructor',
            reduce((ctx, ev) => {
                // 这里需要定义构造函数相关的内容
                return ctx;
            }),
        ),
        transition(EVENT.CLOSE_P, 'prepared'),
    ),
    relative: state(
        immediate('prepared'),
    ),
    before_finish: state(
        immediate('finish',
            reduce((ctx, ev) => {
                while (ctx.stack.top()) {
                    const def = ctx.stack.pop();

                    if (!ctx.stack.top()) {
                        ctx.definition.push(def);
                    } else {
                        if (def.type === 'method') {
                            ctx.methods.push(def);
                        }
                    }
                }
                return ctx;
            }),
        ),
    ),
    finish: state(),
    // stack用于处理多层级定义，处理完成后存放在definition中
}, () => ({ definition: [], stack: [] }));

module.exports = exports = {
    machine,
};
