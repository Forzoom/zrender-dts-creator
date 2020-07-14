const htmlparser2 = require('htmlparser2');
const fs = require('fs');
const axios = require('axios');
const { interpret } = require('robot3');
const { machine } = require('./machine');
const recast = require('recast');
const { EVENT } = require('./constant');
const util = require('util');
const debug = require('debug')('parser');
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
    '例子': EVENT.FIND_EXAMPLE_WORD,
};

/** 发送 */
function send(...args) {
    if (service.child) {
        if (service.child.child) {
            service.child.child.send(...args);
        } else {
            service.child.send(...args);
        }
    } else {
        service.send(...args);
    }
}

/** 发送end */
function end() {
    send(EVENT.END);
    send(EVENT.END);
    send(EVENT.END);
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
            debug('onopentag');
            if (attribes.class === 'api-content') {
                send(EVENT.START);
                return;
            }

            let id = attribes.id;
            if (id) {
                const pos = id.indexOf('-');
                if (pos >= 0) {
                    id = id.substr(0, pos);
                }

                if (keywords[id]) {
                    send(keywords[id]);
                    return;
                }
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
            debug('ontext', text);
            if (keywords[text]) {
                debug('ontext1');
                send(keywords[text]);
                return;
            }

            if (!/^\s*$/.test(text)) {
                debug('ontext2');
                send({
                    type: EVENT.FIND_PLAIN_TEXT,
                    value: text,
                });
                return;
            }
            debug('ontext3');
        },
        onclosetag(tagName) {
            debug('onclosetag');
            // close_tagName
            send(`close_${tagName}`);
            return;
        },
        onend() {
            debug('end');
            end();
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
<h3 id="zrenderanimatableanimatepath-loop">zrender.Animatable.animate(path, loop)<a href="#zrenderanimatableanimatepath-loop" class="api-anchor">#</a></h3>
<p>创建一个动画对象。动画不会立即开始，如需立即开始，需调用 <a href=""><code class="highlighter-rouge">zrender.Animator.start</code></a>。</p>
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
      <td>path</td>
      <td><code class="highlighter-rouge">string</code></td>
      <td>&nbsp;</td>
      <td>对该对象的哪个元素执行动画，如 <code class="highlighter-rouge">xxx.animate('a.b', true)</code> 表示对 <code class="highlighter-rouge">xxx.a.b</code> （可能是一个 <code class="highlighter-rouge">Object</code> 类型）执行动画。</td>
    </tr>
    <tr>
      <td>loop</td>
      <td><code class="highlighter-rouge">boolean</code></td>
      <td><code class="highlighter-rouge">false</code></td>
      <td>是否循环动画。</td>
    </tr>
  </tbody>
</table>
<h4 id="返回值">返回值</h4>
<p>动画对象，类型：<a href="#zrenderanimator">Animator</a>。</p>
<h4 id="例子">例子</h4>
<div class="language-js highlighter-rouge"><pre class="highlight"><code><span class="nx">el</span><span class="p">.</span><span class="nx">animate</span><span class="p">(</span><span class="s1">'style'</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span>
    <span class="p">.</span><span class="nx">when</span><span class="p">(</span><span class="mi">1000</span><span class="p">,</span> <span class="p">{</span><span class="na">x</span><span class="p">:</span> <span class="mi">10</span><span class="p">})</span>
    <span class="p">.</span><span class="nx">done</span><span class="p">(</span><span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
         <span class="c1">// Animation done</span>
    <span class="p">})</span>
    <span class="p">.</span><span class="nx">start</span><span class="p">()</span>
</code></pre>
</div>
<h3 id="zrenderanimatableanimatetotarget-time-delay-easing-callback-forceanimate">zrender.Animatable.animateTo(target, time, delay, easing, callback, forceAnimate)<a href="#zrenderanimatableanimatetotarget-time-delay-easing-callback-forceanimate" class="api-anchor">#</a></h3>
<p>为属性设置动画。</p>
<p>部分参数可缺省，支持以下形式的调用：</p>
<ul>
  <li>animateTo(target, time, delay, easing, callback, forceAnimate)</li>
  <li>animateTo(target, time, delay, easing, callback)</li>
  <li>animateTo(target, time, easing, callback)</li>
  <li>animateTo(target, time, delay, callback)</li>
  <li>animateTo(target, time, callback)</li>
  <li>animateTo(target, callback)</li>
  <li>animateTo(target)</li>
</ul>
<h4 id="参数-1">参数</h4>
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
      <td>target</td>
      <td><code class="highlighter-rouge">Object</code></td>
      <td>&nbsp;</td>
      <td>设置动画的对象，应为 <code class="highlighter-rouge">this</code> 的属性。</td>
    </tr>
    <tr>
      <td>time</td>
      <td><code class="highlighter-rouge">number</code></td>
      <td><code class="highlighter-rouge">500</code></td>
      <td>动画时长，单位毫秒。</td>
    </tr>
    <tr>
      <td>delay</td>
      <td><code class="highlighter-rouge">number</code></td>
      <td><code class="highlighter-rouge">0</code></td>
      <td>动画延迟执行的时长，单位毫秒。</td>
    </tr>
    <tr>
      <td>easing</td>
      <td><code class="highlighter-rouge">string</code></td>
      <td><code class="highlighter-rouge">'linear'</code></td>
      <td>缓动函数名称，支持的名称参见<a href="http://echarts.baidu.com/gallery/editor.html?c=line-easing">缓动函数</a>。</td>
    </tr>
    <tr>
      <td>callback</td>
      <td><code class="highlighter-rouge">Function</code></td>
      <td>&nbsp;</td>
      <td>动画执行完成后的回调函数。</td>
    </tr>
    <tr>
      <td>forceAnimate</td>
      <td><code class="highlighter-rouge">boolean</code></td>
      <td><code class="highlighter-rouge">false</code></td>
      <td>对于相同的属性，是否强制执行（也就是不直接结束动画）。</td>
    </tr>
  </tbody>
</table>
<h4 id="例子-1">例子</h4>
<div class="language-js highlighter-rouge"><pre class="highlight"><code><span class="c1">// Animate position</span>
<span class="nx">el</span><span class="p">.</span><span class="nx">animateTo</span><span class="p">({</span>
    <span class="na">position</span><span class="p">:</span> <span class="p">[</span><span class="mi">10</span><span class="p">,</span> <span class="mi">10</span><span class="p">]</span>
<span class="p">},</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="c1">// done</span>
<span class="p">});</span>

<span class="c1">// Animate shape, style and position in 100ms, delayed 100ms,</span>
<span class="c1">// with cubicOut easing</span>
<span class="nx">el</span><span class="p">.</span><span class="nx">animateTo</span><span class="p">({</span>
    <span class="na">shape</span><span class="p">:</span> <span class="p">{</span>
        <span class="na">width</span><span class="p">:</span> <span class="mi">500</span>
    <span class="p">},</span>
    <span class="na">style</span><span class="p">:</span> <span class="p">{</span>
        <span class="na">fill</span><span class="p">:</span> <span class="s1">'red'</span>
    <span class="p">}</span>
    <span class="nl">position</span><span class="p">:</span> <span class="p">[</span><span class="mi">10</span><span class="p">,</span> <span class="mi">10</span><span class="p">]</span>
<span class="p">},</span> <span class="mi">100</span><span class="p">,</span> <span class="mi">100</span><span class="p">,</span> <span class="s1">'cubicOut'</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
    <span class="c1">// done</span>
<span class="p">});</span>
</code></pre>
</div>
<h3 id="zrenderanimatablestopanimationforwardtolast">zrender.Animatable.stopAnimation(forwardToLast)<a href="#zrenderanimatablestopanimationforwardtolast" class="api-anchor">#</a></h3>
<p>停止动画。</p>
<h4 id="参数-2">参数</h4>
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
      <td>forwardToLast</td>
      <td><code class="highlighter-rouge">boolean</code></td>
      <td><code class="highlighter-rouge">false</code></td>
      <td>是否将动画跳到最后一帧。</td>
    </tr>
  </tbody>
</table>
<h4 id="返回值-1">返回值</h4>
<p><code class="highlighter-rouge">this</code>。</p>
</div>`)
    parser.end();

    console.log(service, util.inspect(service.context, {
        depth: 6,
    }));
}

main();
