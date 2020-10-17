const { parseParam } = require('../../../src/parser/index');
const { expect } = require('chai');

describe('parser', function() {
    it('parseParam basic', function() {
        const parsed = {};
        parseParam(['value', 'number', '', '测试'], parsed);

        // keys = ["value"]
        const keys = Object.keys(parsed);
        expect(keys.length).to.equal(1);
        expect(keys[0]).to.equal('value');

        expect(parsed.value.__name).to.equal('value');
        expect(parsed.value.__type).to.equal('number');
        expect(parsed.value.__default).to.equal('');
        expect(parsed.value.__comment).to.equal('测试');
    });

    it('parseParam hard', function() {
        const parsed = {};
        parseParam(['foo.bar', 'number', '', '1'], parsed);
        parseParam(['foo.baz', 'string', '', '哈哈'], parsed);

        // keys = ["foo"]
        const keys = Object.keys(parsed);
        expect(keys.length).to.equal(1);
        expect(keys[0]).to.equal('foo');

        expect(parsed.foo.__name).to.equal('foo');
        expect(parsed.foo.__type).to.equal('unknown');

        expect(parsed.foo.bar.__name).to.equal('bar');
        expect(parsed.foo.bar.__type).to.equal('number');
        expect(parsed.foo.bar.__default).to.equal('');
        expect(parsed.foo.bar.__comment).to.equal('1');

        expect(parsed.foo.baz.__name).to.equal('baz');
        expect(parsed.foo.baz.__type).to.equal('string');
        expect(parsed.foo.baz.__default).to.equal('');
        expect(parsed.foo.baz.__comment).to.equal('哈哈');
    });
});
