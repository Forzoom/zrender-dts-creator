const { machine } = require('../../../src/machine/index');
const { create } = require('../../../src/parser/html');
const { interpret } = require('robot3');
const { expect } = require('chai');
const util = require('util');

const text = `
<div class="api-content">
<h2 id="zrender-api">zrender</h2>
        
<h3 id="zrenderdisposezr">zrender.dispose(zr)</h3>

<h4 id="参数">参数</h4>

<p>销毁 ZRender 实例。</p>

<table>
<thead>
<tr>
<th>名称</th>
<th>类型</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr>
<td>zr</td>
<td><code class="highlighter-rouge">zrender</code></td>
<td> </td>
<td>ZRender 实例，由 <a href="#zrenderinitdom-opts"><code class="highlighter-rouge">zrender.init</code></a> 创建。不传则销毁全部。</td>
</tr>
</tbody>
</table>

<h4 id="返回值">返回值</h4>

<p>类型：<code class="highlighter-rouge">zrender</code>，<code class="highlighter-rouge">zrender</code> 类。</p>

<h4 id="相关">相关</h4>

<p><a href="#zrenderinitdom-opts">zrender.init</a>。</p>
</div>
`;

describe('index machine', function() {
    it('basic', function() {
        // 使用robot
        const service = interpret(machine, service => {}, {});
        const { parser } = create(service);
        parser.write(text);
        parser.end();

        const context = service.context;
        // expect(params.length).to.equal(1);
        // expect(params[0][0]).to.equal('foo');
        // expect(params[0][1].bar.__name).to.equal('bar');
        // expect(params[0][1].baz.__name).to.equal('baz');
        // expect(comment).to.equal('销毁 ZRender 实例。');
        // expect(ret).to.equal('类型：zrender，zrender 类。');
        // expect(example).to.equal('');

        console.log(util.inspect(context, {
            depth: 6,
        }));
    });
});
