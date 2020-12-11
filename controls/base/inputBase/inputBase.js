'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _controlBase = require('../controlBase/controlBase');

function _render(options) {
    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'inputBase.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _controlBase.render(options);
}


module.exports = {
    render: _render
}