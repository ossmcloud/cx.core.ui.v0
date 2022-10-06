'use strict'

const _core = require('cx-core');
const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _control = require('../controls/cx-control-render');
const _controlBase = require('../controls/base/controlBase/controlBase');

function _render(options, record) {
    if (!options.formMethod) { options.formMethod = 'POST'; }
    if (!options.formAction) { options.formAction = options.path; }
    options.recordId = (record[options.primaryKey] || '');
    options.rowVersion = _core.bufferToString(record.rowVersion);
    options.width = 'auto';
    options.type = 'form';

    options.record = _core.text.toBase64(JSON.stringify((record.toObject) ? record.toObject() : record));

    if (options.dialog == true) {
        if (!options.data) { options.data = []; }
        options.data.push({ name: 'dialog', value: true });
    }


    options.fieldHtml = ''
    if (!options.fields) { options.fields = []; }
    for (var fx = 0; fx < options.fields.length; fx++) {
        var field = options.fields[fx];
        if (!options.editMode) {
            field.readOnly = true;
        }
        options.fieldHtml += _renderField(field, record);
    }

    if (!options.buttons) { options.buttons = []; }

    options.showButtons = [];
    for (var bx = 0; bx < options.buttons.length; bx++) {
        var btn = options.buttons[bx];
        if (!btn.mode) { btn.mode = 'both' }
        if (
            (options.editMode && (btn.mode == 'both' || btn.mode == 'edit')) ||
            (!options.editMode && (btn.mode == 'both' || btn.mode == 'view'))
        ) {
            options.showButtons.push(btn);
        }

    }

    options.pathArgSep = '';
    if (options.path) {
        options.pathArgSep = (options.path.indexOf('?') < 0) ? '?' : '&';
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