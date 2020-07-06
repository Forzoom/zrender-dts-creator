const htmlparser2 = require('htmlparser2');
const fs = require('fs');
const axios = require('axios');
const { interpret } = require('robot3');
const { machine } = require('./robot');
const recast = require('recast');
const { EVENT } = require('./constant');
const FILE_PATH = './assets/api.html';
const definition = [];

Array.prototype.top = function() {
    return this.length ? this[this.length - 1] : undefined;
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

    // 使用robot
    const service = interpret(machine, service => {}, {});

    // 使用parser
    const parser = new htmlparser2.Parser({
        onopentag(tagName, attribes) {
            if (attribes.class === 'api-content') {
                service.send(EVENT.START);
                return;
            }

            if (/^h[3-6]$/.test(tagName)) {
                service.send(EVENT.OPEN_H);
                return;
            }

            // open_tagName
            service.send(`open_${tagName}`);
            return;
        },
        ontext(text) {
            if (/^[a-zA-Z.]*\([a-z]*\)$/.test(text)) {
                service.send({
                    type: EVENT.FIND_METHOD_LIKE,
                    value: text,
                });
                return;
            }
            if (text === '参数') {
                service.send(EVENT.FIND_PARAM_WORD);
                return;
            }
            if (text === '返回值') {
                service.send(EVENT.FIND_RETURN_WORD);
                return;
            }

            if (!/^\s*$/.test(text)) {
                service.send({
                    type: EVENT.FIND_PLAIN_TEXT,
                    value: text,
                });
            }
        },
        onclosetag(tagName) {
            // close_tagName
            service.send(`close_${tagName}`);
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
</div>`)
    parser.end();

    console.log(service, service.context.definition[0]);
}

main();
