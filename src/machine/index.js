const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');
const { machine: methodMachine } = require('./method');
const { machine: classMachine } = require('./clazz');
const debug = require('debug')('machine:index');

const machine = createMachine({
    idle: state(
        transition(EVENT.START, 'prepared',
            action(() => { debug('start!') }),
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
                debug('define1', /^[a-zA-Z0-9.]*\([a-zA-Z0-9, ]*\)$/.test(ev.value.trim()));
                return /^[a-zA-Z0-9.]*\([a-zA-Z0-9, ]*\)$/.test(ev.value.trim());
            }),
            reduce((ctx, ev) => {
                debug('define1_1');
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
                debug('define2', /^([a-zA-Z]*.)*[A-Z][a-z, ]*$/.test(ev.value));
                return /^([a-zA-Z]*.)*[A-Z][a-z, ]*$/.test(ev.value);
            }),
            reduce((ctx, ev) => {
                // 当定义class时，如果stack中仍旧有class的话，需要将class弹出
                const top = ctx.stack.top();
                if (top && top.type === 'class') {
                    ctx.definition.push(ctx.stack.pop());
                }

                ctx.stack.push({
                    type: 'class',
                    raw_name: ev.value,
                    class_name: ev.value.split('.').pop(),
                    methods: [],
                });
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'property',
            guard((ctx, ev) => {
                debug('define3');
                const isPropertyLike = /^[a-zA-Z.]*[a-z, ]*$/.test(ev.value);
                const name = ev.value.split('.').pop();
                return ['util', 'vector', 'matrix', 'color', 'path'].indexOf(name) < 0;
            }),
            reduce((ctx, ev) => {
                ctx.stack.push({
                    type: 'property',
                    raw_name: ev.value,
                });
                return ctx;
            }),
        ),
        transition(EVENT.FIND_PLAIN_TEXT, 'prepared',
            guard((ctx, ev) => {
                debug('define4');
                const isPropertyLike = /^[a-zA-Z.]*[a-z, ]*$/.test(ev.value);
                const name = ev.value.split('.').pop();
                return ['util', 'vector', 'matrix', 'color', 'path'].indexOf(name) >= 0;
            }),
            reduce((ctx, ev) => {
                ctx.stack.push({
                    type: 'static_class',
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
                def.params = ev.data.params;
                def.comment = null;
                def.return = null;
                def.example = '';
                const def = ctx.stack.pop();
                const top = ctx.stack.top();
                if (top && (top.type === 'class' || top.type === 'static_class')) {
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
        // 结束处理stack
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
    class: invoke(classMachine,
        transition('done', 'define',
            reduce((ctx, ev) => {
                const def = ctx.stack.top();
                const { comment, constructor } = ev.data;
                if (comment) {
                    def.comment = comment;
                }
                if (constructor) {
                    def.constructor = constructor;
                }
                return ctx;
            }),
        ),
    ),
    relative: state(
        immediate('prepared'),
    ),
    // 处理stack中的剩余数据
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
