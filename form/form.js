'use strict'

const _core = require('cx-core');
const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _control = require('../controls_v2/cx-control-render');
const _controlBase = require('../controls_v2/base/controlBase/controlBase');

function _render(options, record) {
    if (!options.formMethod) { options.formMethod = 'POST'; }
    if (!options.formAction) { options.formAction = options.path; }
    options.recordId = (record[options.primaryKey] || '');
    options.rowVersion = _core.bufferToString(record.rowVersion);
    options.width = 'auto';

    options.fieldHtml = '';
    for (var fx = 0; fx < options.fields.length; fx++) {
        var field = options.fields[fx];
        options.fieldHtml += _renderField(field, record);
    }
    

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'form.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _controlBase.render(options);
}

function _renderField(field, record) {
    var html = '';

    html += _control.render(field, record);
   

    return html;
}



module.exports = {
    render: _render
}