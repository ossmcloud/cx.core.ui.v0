'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _inputBase = require('../../base/inputBase/inputBase');

function _render(options) {
    var items = [];
    options.items.forEach(item => {
        if (item.value === undefined || item.text === undefined) {
            items.push({ value: item, text: item });
        } else {
            items.push(item);
        }
    });
    options.items = items;

    if (!options.css) {
        options.css = {
            //input: 'btn',
            borderColor: 'var(--element-bd-color)',
            backgroundColor: 'var(--element-bg-color)',
            backgroundColorHover: 'var(--header-bg-color)',
        };
    }
    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'dropDown.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _inputBase.render(options);
}


module.exports = {
    render: _render
}