'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _core = require('cx-core');
const _cx_list = require('cx-core/core/cx-core-lists');

function formatDataValue(value) {
    var dataAttributeValue = '';
    if (_core.isObj(value)) {
        dataAttributeValue = JSON.stringify(value);
    } else {
        if (value == null) {
            dataAttributeValue = '[DB-NULL]';
        } else if (value == undefined) {
            dataAttributeValue = '[UNDEFINED]';
        } else {
            dataAttributeValue = value.toString();
        }
    }
    dataAttributeValue = dataAttributeValue.replaceAll('"', '&quot;');
    return dataAttributeValue;
}



function _render(options) {
    

    // NOTE: if we have a data attribute passed we assume it is already properly formatted and escaped
    if (!options.dataAttributes) {

        // if we don't have data attributes then we just add the standard
        if (!options.data) { options.data = []; }

        // 
        if (Array.isArray(options.data)) {
            // this would be the norm, we have a collection of data attributes
            //  FIELD VALUE - add if not already there
            var dataAttribute = _cx_list.findInArray(options.data, 'name', 'field-value');
            if (!dataAttribute) { options.data.unshift({ name: 'field-value', value: formatDataValue(options.value) }); }
            //  FIELD NAME - add if not already there
            dataAttribute = _cx_list.findInArray(options.data, 'name', 'field');
            if (!dataAttribute) {
                var field = (options.field == undefined) ? options.fieldName : options.field;
                options.data.unshift({ name: 'field', value: formatDataValue(field) });
            }
            // CONTROL TYPE - add if not already there
            dataAttribute = _cx_list.findInArray(options.data, 'name', 'control');
            if (!dataAttribute) { options.data.unshift({ name: 'control', value: formatDataValue(options.type) }); }

            

            
        } else if (_core.isObj(options.data)) {
            // we assume this is a custom object passed as is
            options.data = [{ name: 'cx-obj', value: formatDataValue(options.data) }];
        } else {
            // NOTE: otherwise we assume it is already properly formatted and escaped
            options.dataAttributes = options.data.toString();
        }

        // format data attribute string
        if (Array.isArray(options.data)) {
            // now build the string
            options.dataAttributes = '';
            options.data.forEach(dataAttribute => {
                options.dataAttributes += (` data-cx-${dataAttribute.name}="${formatDataValue(dataAttribute.value)}"`);
            });
        }
    }
    
   
    // render final control
    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'controlBase.hbs'), 'utf8'));
    return hTmpl(options);
}


module.exports = {
    render: _render
}