const { createMachine, state, transition, interpret, action, reduce, immediate, guard, invoke } = require('robot3');
const { EVENT } = require('../constant');
const { capitalize } = require('../utils');
const { machineFactory: collectTextMachineFactory } = require('./collect_text');
const { parseParam } = require('../parser/index');

const machine = createMachine({
    before: state(
        // 某些位置将函数的说明写在了"参数"之后
        transition(EVENT.FIND_PLAIN_TEXT, 'before',
            reduce((ctx, ev) => {
                ctx.comment = ev.value;
                return ctx;
            }),
        ),
        transition(EVENT.OPEN_TABLE, 'prepared'),
    ),
    prepared: state(
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
                    parseParam(param, parsed);
                    // console.log(parsed);
                }

                const result = [];
                const cache = {};
                for (const param of params) {
                    const keyPath = param[0].split('.');
                    if (keyPath.length === 1) {
                        result.push(param);
                    } else if (!cache[keyPath[0]]) {
                        result.push([ keyPath[0], parsed[keyPath[0]], '', '' ]);
                        cache[keyPath[0]] = true;
                    }
                }

                ctx.params = result;

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
                console.log('before');
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
     * comment: 可能偶尔有文档错误，导致method的comment写到了参数里面，例如zrender.dispose
     */
    return {
        ...ctx,
        plain_text_buf: '',
        // 用于存储params machine中的内容，完成后可以可以在外层删除
        params: {
            params: [],
            comment: null,
        },
    };
});

module.exports = exports = {
    machine,
}
