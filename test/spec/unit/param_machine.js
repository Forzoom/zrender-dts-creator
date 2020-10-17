const { machine } = require('../../../src/machine/param');
const { create } = require('../../../src/parser/html');
const { interpret } = require('robot3');
const { expect } = require('chai');
const util = require('util');

describe('param machine', function() {
    it('basic', function() {
        // 使用robot
        const service = interpret(machine, service => {}, {});
        console.log(service);
        const { parser } = create(service);
        parser.write(`
        <table>
            <tbody>
                <tr><td>foo.bar</td><td><code>number</code></td><td></td><td>1</td></tr>
                <tr><td>foo.baz</td><td><code>string</code></td><td></td><td>xxx</td></tr>
            </tbody>
        </table>`);
        parser.end();

        console.log(service, util.inspect(service.context, {
            depth: 6,
        }));
    });
});
