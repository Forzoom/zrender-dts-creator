const htmlparser2 = require('htmlparser2');
const fs = require('fs');
const axios = require('axios');
const { interpret } = require('robot3');
const { machine } = require('./machine');
const recast = require('recast');
const { EVENT } = require('./constant');
const util = require('util');
const FILE_PATH = './assets/api.html';
const definition = [];

Array.prototype.top = function() {
    return this.length ? this[this.length - 1] : undefined;
}

// 使用robot
const service = interpret(machine, service => {}, {});

// 关键字
const keywords = {
    '参数': EVENT.FIND_PARAM_WORD,
    '返回值': EVENT.FIND_RETURN_WORD,
    '相关': EVENT.FIND_RELATIVE_WORD,
    '构造函数': EVENT.FIND_CONSTRUCTOR_WORD,
};

function send(...args) {
    service.send(...args);
    if (service.child) {
        service.child.send(...args);
    }
}

async function main() {
    const exist = fs.existsSync(FILE_PATH);
    let content = null;

    // 获取网站内容
    if (!exist) {
        const response = await axios.get('https://ecomfe.github.io/zrender-doc/public/api.html');
        content = response.data;
        fs.writeFileSync(FILE_PATH, content);
    } else {
        content = fs.readFileSync(FILE_PATH);
    }

    // 使用parser
    const parser = new htmlparser2.Parser({
        onopentag(tagName, attribes) {
            if (attribes.class === 'api-content') {
                send(EVENT.START);
                return;
            }

            if (keywords[attribes.id]) {
                send(keywords[attribes.id]);
                return;
            }

            if (/^h[3-6]$/.test(tagName)) {
                send(EVENT.OPEN_H);
                return;
            }

            // open_tagName
            send(`open_${tagName}`);
            return;
        },
        ontext(text) {
            if (keywords[text]) {
                send(keywords[text]);
                return;
            }

            if (!/^\s*$/.test(text)) {
                send({
                    type: EVENT.FIND_PLAIN_TEXT,
                    value: text,
                });
                return;
            }
        },
        onclosetag(tagName) {
            // close_tagName
            send(`close_${tagName}`);
            return;
        },
    });

    // parser.write(content);
    parser.write(`<div class="api-content">
    <h2 id="zrender-api">zrender</h2>
    <h3 id="zrenderdisposezr">zrender.dispose(zr)<a href="#zrenderdisposezr" class="api-anchor">#</a></h3>
    <h4 id="参数">参数</h4>
    <p>销毁 ZRender 实例。</p>
    <table class="table">
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
      <td>&nbsp;</td>
      <td>ZRender 实例，由 <a href="#zrenderinitdom-opts"><code class="highlighter-rouge">zrender.init</code></a> 创建。不传则销毁全部。</td>
    </tr>
  </tbody>
</table>
<h4 id="返回值">返回值</h4>
<p>类型：<code class="highlighter-rouge">zrender</code>，<code class="highlighter-rouge">zrender</code> 类。</p>
<h4 id="相关">相关</h4>
<p><a href="#zrenderinitdom-opts">zrender.init</a>。</p>
<h3 id="zrenderinitdom-opts">zrender.init(dom, opts)<a href="#zrenderinitdom-opts" class="api-anchor">#</a></h3>
<p>得到一个 ZRender 的实例，实例属性及方法参见<a href="#zrender-instance-api">实例 API</a>。</p>
<h4 id="参数">参数</h4>
<table class="table">
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
      <td>dom</td>
      <td><code class="highlighter-rouge">HTMLElement</code></td>
      <td>&nbsp;</td>
      <td>ZRender 容器，在调用该方法时，应该已有宽度和高度。</td>
    </tr>
    <tr>
      <td>opts</td>
      <td><code class="highlighter-rouge">Object</code></td>
      <td>&nbsp;</td>
      <td>配置项</td>
    </tr>
    <tr>
      <td>opts.renderer</td>
      <td><code class="highlighter-rouge">string</code></td>
      <td><code class="highlighter-rouge">'canvas'</code></td>
      <td>渲染方式，支持：<code class="highlighter-rouge">'canavs'</code>、<code class="highlighter-rouge">'svg'</code>、<code class="highlighter-rouge">'vml'</code></td>
    </tr>
    <tr>
      <td>opts.devicePixelRatio</td>
      <td><code class="highlighter-rouge">number</code></td>
      <td><code class="highlighter-rouge">2</code></td>
      <td>画布大小与容器大小之比，仅当 <code class="highlighter-rouge">renderer</code> 为 <code class="highlighter-rouge">'canvas'</code> 时有效。</td>
    </tr>
    <tr>
      <td>opts.width</td>
      <td><code class="highlighter-rouge">number|string</code></td>
      <td><code class="highlighter-rouge">'auto'</code></td>
      <td>画布宽度，设为 <code class="highlighter-rouge">'auto'</code> 则根据 <code class="highlighter-rouge">devicePixelRatio</code> 与容器宽度自动计算。</td>
    </tr>
    <tr>
      <td>opts.height</td>
      <td><code class="highlighter-rouge">number|string</code></td>
      <td><code class="highlighter-rouge">'auto'</code></td>
      <td>画布高度，设为 <code class="highlighter-rouge">'auto'</code> 则根据 <code class="highlighter-rouge">devicePixelRatio</code> 与容器高度自动计算。</td>
    </tr>
  </tbody>
</table>
<h4 id="返回值">返回值</h4>
<p>类型：<code class="highlighter-rouge">zrender</code>，<a href="#zrender-instance-api">ZRender 实例</a>。</p>
<h4 id="相关">相关</h4>
<p><a href="#zrenderdisposezr">zrender.dispose</a>。</p>
<h3 id="zrenderversion">zrender.version<a href="#zrenderversion" class="api-anchor">#</a></h3>
<p>类型：<code class="highlighter-rouge">'string'</code>，ZRender 版本号。</p>
<h3 id="zrenderanimatable">zrender.Animatable<a href="#zrenderanimatable" class="api-anchor">#</a></h3>
<p>支持动画的对象。</p>
<h4 id="构造函数">构造函数</h4>
<p><code class="highlighter-rouge">zrender.Animatable()</code></p>
</div>`)
    parser.end();

    console.log(service, util.inspect(service.context.definition, {
        depth: 3,
    }));
}

main();
