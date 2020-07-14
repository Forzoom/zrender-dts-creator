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
    '静态类': EVENT.FIND_STATIC_CLASS_WORD,
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

    parser.write(content);
    parser.end();

    console.log(service, util.inspect(service.context, {
        depth: 6,
    }));
}

main();
