const { machine } = require('../../../src/machine/param');
const { create } = require('../../../src/parser/html');
const { interpret } = require('robot3');
const { expect } = require('chai');
const util = require('util');

describe('param machine', function() {
    it('basic', function() {
        // 使用robot
        const service = interpret(machine, service => {}, {});
        // console.log(service);
        const { parser } = create(service);
        parser.write(`
        <table>
            <tbody>
                <tr><td>foo.bar</td><td><code>number</code></td><td></td><td>1</td></tr>
                <tr><td>foo.baz</td><td><code>string</code></td><td></td><td>xxx</td></tr>
            </tbody>
        </table>`);
        parser.end();

        const params = service.context.params;
        expect(params.length).to.equal(1);
        expect(params[0][0]).to.equal('foo');
        expect(params[0][1].bar.__name).to.equal('bar');
        expect(params[0][1].baz.__name).to.equal('baz');

        // console.log(util.inspect(service.context, {
        //     depth: 6,
        // }));
    });

    it('with comment', function() {
        // 使用robot
        const service = interpret(machine, service => {}, {});
        // console.log(service);
        const { parser } = create(service);
        parser.write(`
        <p>销毁 ZRender 实例。</p>
        <table>
            <tbody>
            </tbody>
        </table>`);
        parser.end();

        const { comment, params } = service.context;
        expect(comment).to.equal('销毁 ZRender 实例。');
        expect(params.length).to.equal(0);
    });
});
