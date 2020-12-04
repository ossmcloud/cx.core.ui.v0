'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _declarations = require('../../cx-core-ui-declarations');
const _inputBase = require('../base/inputBase/inputBase');
const _dropDown = require('./dropDown/dropDown');
const _table = require('./table/table');

function _render(options, objects) {
    if (!options.id) {
        options.id = (options.fieldName || options.name);
        if (!options.id) {
            options.id = 'cx_control';
        }
    }
    if (options.type == _declarations.ControlType.DROPDOWN || (!options.type && Array.isArray(options.items))) {
        options.type = _declarations.ControlType.DROPDOWN;
        return _dropDown.render(options);
    } else if (options.type == _declarations.ControlType.TABLE || (!options.type && objects)) {
        options.type = _declarations.ControlType.TABLE;
        return _table.render(options, objects);
    } else {
        // TODO: CX-UI: remove lie below options.inputType should be refactored and fully removed
        if (!options.type && options.inputType) { options.type = options.inputType; }
        //
        if (!options.type) { options.type = _declarations.ControlType.TEXT; }
        // TODO: CX-UI: we want to have one for types: date, datetime-local, month, time, week use a sub type
        if (options.type == _declarations.ControlType.DATE) { options.htmlType = 'date'; }
        //
        if (options.type == _declarations.ControlType.SELECT) {
            if (!options.options && options.items) { options.options = options.items; }
        }
        //
        if (options.type == _declarations.ControlType.CHECK) {
            //
            options.labelCheckBox = options.label;
            options.label = null;
            //
            if (options.value == true || options.value == 'T' || options.value == 't' || options.value == 'Y' || options.value == 'y'
                || options.value.toString().toLowerCase() == 'yes' || options.value == '1' || options.value > 0
                || options.value.toString().toLowerCase() == 'true') {
            
            } else {
                options.value = null;
            }
        }
        if (options.readOnly && options.lookUps) {
            for (var lx = 0; lx < options.lookUps.length; lx++) {
                if (options.lookUps[lx].value == options.value) {
                    options.value = options.lookUps[lx].text;
                    break;
                }
            }
        }
        //
        var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, options.type + '.hbs'), 'utf8'));
        options.content = hTmpl(options);
        return _inputBase.render(options);
    }
}

module.exports = {
    render: _render
}