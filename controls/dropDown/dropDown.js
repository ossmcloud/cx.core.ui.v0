'use strict'

const _fs = require('fs');
const _h = require('handlebars');

function _render(options) {
    // TODO: validate options
    var items = [];
    options.items.forEach(item => {
        if (item.value === undefined || item.text === undefined) {
            items.push({ value: item, text: item });
        } else {
            items.push(item);
        }
    });
    options.items = items;
    var hTmpl = _h.compile(_fs.readFileSync('src/sdk/ui/comboInput/comboInput.hbs', 'utf8'));
    return hTmpl(options);
}


module.exports = {
    render: _render
}