'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');

function _render(options) {
    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, options.inputType + '.hbs'), 'utf8'));
    return hTmpl(options);
}

module.exports = {
    render: _render
}