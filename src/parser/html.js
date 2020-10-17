const debug = require('debug')('html-parser');
const { EVENT, keywords } = require('../constant');
const htmlparser2 = require('htmlparser2');

module.exports.create = function(service) {
    /** 发送 */
    function send(...args) {
        let sender = service;
        while (sender.child) {
            sender = sender.child;
        }
        sender.send(...args);
    }

    /** 发送end */
    function end() {
        let sender = service;
        const senders = [sender];
        while (sender.child) {
            sender = sender.child;
            senders.unshift(sender);
        }

        for (const sender of senders) {
            sender.send(EVENT.END);
        }
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

    return {
        send,
        end,
        parser,
    };
}
