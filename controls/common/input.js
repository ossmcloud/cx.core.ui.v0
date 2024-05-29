'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _declarations = require('../../cx-core-ui-declarations');
const _inputBase = require('../base/inputBase/inputBase');
const _dropDown = require('./dropDown/dropDown');
const _table = require('./table/table');
const _core = require('cx-core');




function formatOptions(options) {
    // we need to have
    //      id          => used for html control Ids + input name field
    //      name:       => is the field name 
    //      fieldName   => the underlying field name
    if (options.fieldName == undefined && options.name != undefined) { options.fieldName = options.name; }
    if (options.fieldName == undefined && options.id != undefined) { options.fieldName = options.id; }
    if (options.name == undefined && options.fieldName != undefined) { options.name = options.fieldName; }
    if (options.id == undefined && options.fieldName != undefined) { options.id = options.fieldName; }
       
    if (!options.id) { options.id = 'cx_control'; }
    if (!options.name) { options.name = options.id; }

    //
    if (options.hidden) {
        options.type = _declarations.ControlType.HIDDEN;
        options.cssOuterContainer = 'jx-control-hidden';
    } else if (options.inline === true) {
        options.cssOuterContainer = 'jx-control-inline';
    }
}


function detectControlValue(options, objects) {
    var value = null;
    if (options.value != undefined) {
        value = options.value;
    } else if (objects && (Array.isArray(objects) || objects.records)) {
        value = null;
    } else if (options.name && objects) {
        value = objects[options.name];
    }

    if (options.readOnly && options.lookUps) {
        for (var lx = 0; lx < options.lookUps.length; lx++) {
            if (options.lookUps[lx].value == value) {
                value = options.lookUps[lx].text;
                break;
            }
        }
    }

    return value;

}

function detectControlType(options, objects) {
    if (options.html) { return _declarations.ControlType.HTML; }
    if (options.type) { return options.type; }
    if (options.inputType) { return options.inputType; }
    if (Array.isArray(options.items)) { return _declarations.ControlType.DROPDOWN; }
    if (Array.isArray(options.options) || Array.isArray(options.lookUps)) { return _declarations.ControlType.SELECT; }

    if (objects) {
        if (Array.isArray(objects) || Array.isArray(objects.records) || Array.isArray(options.records)) { return _declarations.ControlType.TABLE; }

        if (objects.getFieldDataType) {
            options.dataType = objects.getFieldDataType(options.name);
            if (options.dataType == 'varchar') { return _declarations.ControlType.TEXT; }
            if (options.dataType == 'int' || options.dataType == 'bigint' || options.dataType == 'money') { return _declarations.ControlType.NUMERIC; }
            if (options.dataType == 'datetime') { return _declarations.ControlType.DATE; }
            if (options.dataType == 'date') { return _declarations.ControlType.DATE; }
            if (options.dataType == 'bit') { return _declarations.ControlType.CHECK; }
            //
            if (options.dataType) {
                options.dataType = options.dataType;
            }

        }
    }

    if (options.value) {
        if (options.value.constructor.name === 'Date') { return _declarations.ControlType.DATE; }
        if (options.value.constructor.name === 'Boolean') { return _declarations.ControlType.CHECK; }
        if (options.value.constructor.name === 'Float' || options.value.constructor.name === 'Int') { return _declarations.ControlType.NUMERIC; }
    }

    return _declarations.ControlType.TEXT;
}

function formatValue(options) {
    
    if (options.type == _declarations.ControlType.DATE) {
        options.htmlType = 'date';
        if (!options.value) { return; }
        if (options.value.constructor.name === 'Date') {
            options.htmlType = (options.value.hasTime()) ? 'datetime-local' : 'date';
            options.value = _core.date.format({ date: options.value, inverted: true, showTime: options.value.hasTime(), dateTimeSep: ' ' }); 
        }
        
    } else if (options.type == _declarations.ControlType.CHECK) {
        options.labelCheckBox = options.label;
        options.label = null;
        if (!options.value) { return; }
        if (options.value == true || options.value == 'T' || options.value == 't' || options.value == 'Y' || options.value == 'y'
            || options.value.toString().toLowerCase() == 'yes' || options.value == '1' || options.value > 0
            || options.value.toString().toLowerCase() == 'true') {
            options.value = true;
        } else {
            options.value = null;
        }
    } else if (options.type == _declarations.ControlType.TEXT || options.type == _declarations.ControlType.TEXT_AREA) {
        if (options.value && options.value.length > 100) {
            options.type = _declarations.ControlType.TEXT_AREA
            options.rows = 7;
            //options.rows = 5;
        }
        if (options.readOnly && options.value && options.value.replaceAll) {
            // @@REVIEW: if spaces are replaced with &nbsp; word wrap does not work
            //           not even sure why i did this
            //options.value = options.value.replaceAll(' ', '&nbsp;');
            options.value = options.value.replaceAll('\n', '<br />');
        }
    } else if (options.type == _declarations.ControlType.NUMERIC) {
        // @@REVIEW: encapsulate, used table.js
        var val = options.value;
        if (options.readOnly) {
            if (options.formatMoney != undefined) {
                if (options.formatMoney !== false) {
                    var dec = 2;
                    if (options.formatMoney.constructor.name == 'String') {
                        dec = parseInt(options.formatMoney.substr(1));
                        if (isNaN(dec)) { dec = 2; }
                    }
                    val = parseFloat(val).formatMoney(dec);
                }
            } else if (options.formatPercent === true) {
                val = parseFloat(val).formatMoney(2) + '%';
            } else if (options.formatPercent === '*100') {
                val = parseFloat(val * 100).formatMoney(2) + '%';
            } else if (options.noFormat) {
                val = val;
            } else {
                val = parseFloat(val).formatMoney();
            }
        } else {
            
            if (options.formatMoney || options.formatPercent) {
                var dec = 2;
                if (options.formatMoney.constructor.name == 'String') {
                    dec = parseInt(options.formatMoney.substr(1));
                    if (isNaN(dec)) { dec = 2; }
                }
                val = parseFloat(val).toFixed(dec);
            } 
            
        }
        options.value = val;
    }


}



function _render(options, objects) {
    formatOptions(options);
    options.value = detectControlValue(options, objects);
    options.type = detectControlType(options, objects);
    formatValue(options);

    if (options.html) { return options.html; }
    
    if (options.type == _declarations.ControlType.CHECK) {
        options.minHeight = '50px';
    }
    //
    if (options.type == _declarations.ControlType.SELECT) {
        if (!options.options && options.items) { options.options = options.items; }
        if (!options.options && options.lookUps) { options.options = options.lookUps; }
    }

    if (options.type == _declarations.ControlType.DROPDOWN) { return _dropDown.render(options); } 
    if (options.type == _declarations.ControlType.TABLE) { return _table.render(options, options.records || objects, this); }

    // if (options.type == _declarations.ControlType.DATE && !options.htmlType) {
    //     options.htmlType = 'date';
    // }

    var viewName = (options.type == _declarations.ControlType.PASSWORD) ? _declarations.ControlType.TEXT : options.type;

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, viewName + '.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _inputBase.render(options);

}


module.exports = {
    CtrlType: _declarations.ControlType,
    render: _render

}