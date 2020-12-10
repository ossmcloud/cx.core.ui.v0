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
    if (!options.id) {
        options.id = (options.fieldName || options.name);
        if (!options.id) { options.id = 'cx_control'; }
    }

    if (!options.name) { options.name = options.id; }

    if (options.inline === true) { options.cssOuterContainer = 'jx-control-inline'; }
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
    if (options.type) { return options.type; }
    if (options.inputType) { return options.inputType; }
    if (Array.isArray(options.items)) { return _declarations.ControlType.DROPDOWN; }
    if (Array.isArray(options.options) || Array.isArray(options.lookUps)) { return _declarations.ControlType.SELECT; }
    if (Array.isArray(objects) || Array.isArray(objects.records) || Array.isArray(options.records)) { return _declarations.ControlType.TABLE; }
    if (options.value) {
        if (options.value.constructor.name === 'Date') { return _declarations.ControlType.DATE; }
        if (options.value.constructor.name === 'Boolean') { return _declarations.ControlType.CHECK; }
        if (options.value.constructor.name === 'Float' || options.value.constructor.name === 'Int') { return _declarations.ControlType.NUMERIC; }
    }
    return _declarations.ControlType.TEXT;
}

function formatValue(options) {
    if (!options.value) { return; }
    if (options.type == _declarations.ControlType.DATE) {
        options.htmlType = 'date';
        if (options.value.constructor.name === 'Date') {
            options.htmlType = (options.value.hasTime()) ? 'datetime-local' : 'date';
            options.value = _core.date.format({ date: options.value, inverted: true, showTime: options.value.hasTime(), dateTimeSep: 'T' }); 
        }
        
    } else if (options.type == _declarations.ControlType.CHECK) {
        options.labelCheckBox = options.label;
        options.label = null;
        if (options.value == true || options.value == 'T' || options.value == 't' || options.value == 'Y' || options.value == 'y'
            || options.value.toString().toLowerCase() == 'yes' || options.value == '1' || options.value > 0
            || options.value.toString().toLowerCase() == 'true') {
            options.value = true;
        } else {
            options.value = null;
        }
    }


}



function _render(options, objects) {
    formatOptions(options);
    options.value = detectControlValue(options, objects);
    options.type = detectControlType(options, objects);
    formatValue(options);
    
    //
    if (options.type == _declarations.ControlType.SELECT) {
        if (!options.options && options.items) { options.options = options.items; }
        if (!options.options && options.lookUps) { options.options = options.lookUps; }
    }

    if (options.type == _declarations.ControlType.DROPDOWN) { return _dropDown.render(options); } 
    if (options.type == _declarations.ControlType.TABLE) { return _table.render(options, options.records || objects); }

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, options.type + '.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _inputBase.render(options);

}

// function _render(options, objects) {
//     if (!options.id) {
//         options.id = (options.fieldName || options.name);
//         if (!options.id) { options.id = 'cx_control'; }
//     }

//     if (options.inline === true) { options.cssOuterContainer = 'jx-control-inline'; }

//     if (options.type == _declarations.ControlType.DROPDOWN || (!options.type && Array.isArray(options.items))) {
//         options.type = _declarations.ControlType.DROPDOWN;
//         if (options.value == undefined && objects) { options.value = objects[options.name]; }
//         return _dropDown.render(options);
//     } else if (options.type == _declarations.ControlType.TABLE || (!options.type && options.records) || (!options.type && objects && objects.length>=0)) {
//         options.type = _declarations.ControlType.TABLE;
//         return _table.render(options, options.records || objects);
//     } else {
//         // TODO: CX-UI: remove lie below options.inputType should be refactored and fully removed
//         if (!options.type && options.inputType) { options.type = options.inputType; }
//         //
//         if (options.value == undefined && objects) {
//             options.value = objects[options.name];
//             // if (options.value.constructor.name === 'Date') {
//             //     if (!options.type) {
//             //         options.type
//             //         options.type = (options.value.hasTime()) ? _declarations.ControlType.DATE_TIME : _declarations.ControlType.DATE;
//             //     }
//             //     options.value = _core.date.format({ date: options.value, inverted: true, showTime: options.value.hasTime(), dateTimeSep: '' });

//             // }
//         }
//         if (options.readOnly && options.lookUps) {
//             for (var lx = 0; lx < options.lookUps.length; lx++) {
//                 if (options.lookUps[lx].value == options.value) {
//                     options.value = options.lookUps[lx].text;
//                     break;
//                 }
//             }
//         }



//         //
//         if (!options.type) {
//             if (options.value) {
//                 if (options.value.constructor.name === 'Date') {
//                     options.type = _declarations.ControlType.DATE;
//                     options.htmlType = (options.value.hasTime()) ? 'datetime-local' : 'date';
//                     options.value = _core.date.format({ date: options.value, inverted: true, showTime: options.value.hasTime(), dateTimeSep: 'T' });
//                 } else {
//                     options.type = _declarations.ControlType.TEXT;
//                 }
//             } else {
//                 options.type = _declarations.ControlType.TEXT;
//             }
//         }

        
//         //
//         if (options.type == _declarations.ControlType.SELECT) {
//             if (!options.options && options.items) { options.options = options.items; }
//         }
//         //
//         if (options.type == _declarations.ControlType.CHECK) {
//             //
//             options.labelCheckBox = options.label;
//             options.label = null;
//             //
//             if (options.value == true || options.value == 'T' || options.value == 't' || options.value == 'Y' || options.value == 'y'
//                 || options.value.toString().toLowerCase() == 'yes' || options.value == '1' || options.value > 0
//                 || options.value.toString().toLowerCase() == 'true') {
            
//             } else {
//                 options.value = null;
//             }
//         }

        
       
        

//         //
        
//         var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, options.type + '.hbs'), 'utf8'));
//         options.content = hTmpl(options);
//         return _inputBase.render(options);
//     }
// }

module.exports = {
    render: _render
}