const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');
const { capitalize } = require('../utils');
const { machineFactory: collectTextMachineFactory } = require('./collect_text');
const { parseParam } = require('../parser/index');

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
    collect_text: invoke(collectTextMachineFactory(EVENT.CLOSE_TD),
        transition('done', 'handle',
            reduce((/** @type {RootContext & ParamRootContext} */ctx, ev) => {
                const text = ev.data.plain_text_buf;
                const param = ctx.params.params.top();
                if (param) {
                    param.push(text);
                }
                return ctx;
            }),
        ),
    ),
    handle: state(
        // 新的一行
        transition(EVENT.OPEN_TR, 'handle',
            reduce((/** @type {RootContext} */ctx) => {
                ctx.params.params.push([]);
                return ctx;
            }),
        ),
        // todo: 考虑将这里修改成一个单独的machine
        // 新的一个单元格
        transition(EVENT.OPEN_TD, 'collect_text'),
        // 全部结束
        transition(EVENT.CLOSE_TABLE, 'finish',
            reduce((ctx, ev) => {
                const params = ctx.params.params;
                const parsed = {};

                for (const param of params) {
                    console.log(ctx.params, parsed);
                    parseParam(param, parsed);
                }

                // const def = ctx.stack.top();

                // // 这里可能是有问题的
                // if (def.type === 'method') {
                //     // 如果当前正在为method定义
                //     const pending = ctx._pending.top();
                //     // 有定义，检测到需要interface
                //     if (pending && pending.length == 1 && text == 'Object') {
                //         const interface_name = capitalize(def.method_name) + capitalize(pending[0]);
                //         ctx.interface.push({
                //             name: interface_name,
                //             properties: [],
                //         });
                //     } else if (text.indexOf('.') >= 0 && /^[a-zA-Z0-9.]+$/.test(text) && ctx.interface.length === 0) {
                //         const interface_name = capitalize(def.method_name) + capitalize(text.split('.')[0]);
                //         ctx.interface.push({
                //             name: interface_name,
                //             properties: [],
                //         });
                //     }
                // } else if (def.type === 'class') {
                //     // 如果当前正在为class定义
                //     if (text.indexOf('.') >= 0 && /^[a-zA-Z0-9.]+$/.test(text) && ctx.interface.length === 0) {
                //         console.log('target2', def.class_name, text);
                //         const interface_name = capitalize(def.class_name) + capitalize(text.split('.')[0]);
                //         ctx.interface.push({
                //             name: interface_name,
                //             properties: [],
                //         });
                //     }
                // }

                // ctx._pending.top().push(text);

                // const pending = ctx._pending.pop();

                // if (pending[0].indexOf('.') >= 0) {
                //     // 需要加入到interface中
                //     pending[0] = pending[0].split('.').pop();
                //     ctx.interface.top().properties.push(pending);
                // } else {
                //     if (pending) {
                //         // 如果有之前的定义
                //         if (pending[1] == 'Object') {
                //             pending[1] = ctx.interface.top().name;
                //         }
                //         ctx.params.push(pending);   
                //     } else {
                //         // todo
                //         console.log('target3', ctx.stack.top());
                //     }
                // }
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
        // 用于存储params machine中的内容，完成后可以可以在外层删除
        params: {
            params: [],
            interface: [],
            _pending: [],
            comment: null,
        },
    };
});

module.exports = exports = {
    machine,
}
