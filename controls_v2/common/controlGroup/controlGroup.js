'use strict'

const _core = require('cx-core');
const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _controlBase = require('../../base/controlBase/controlBase');

function _render(options) {
    //
    if (!options.id) { options.id = options.group; }
    if (!options.id) { options.id = options.groupTitle.replaceAll(' ', '_'); }
    if (!options.id) { options.id = 'ctrl-group'; }
    //
    options.cssOuterContainer = 'jx-control-group ' + (options.cssOuterContainer || '');
    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'controlGroup.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _controlBase.render(options);
}


module.exports = {
    render: _render
}