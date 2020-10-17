const htmlparser2 = require('htmlparser2');
const fs = require('fs');
const axios = require('axios');
const { interpret } = require('robot3');
const { machine } = require('./machine');
const recast = require('recast');
const { EVENT, keywords } = require('./constant');
const util = require('util');
const debug = require('debug')('parser');
const FILE_PATH = './assets/api.html';
const definition = [];

// 使用robot
const service = interpret(machine, service => {}, {});

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
            debug('onopentag:', tagName, attribes);
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
            debug('ontext:', text);
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
            debug('onclosetag:', tagName);
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
