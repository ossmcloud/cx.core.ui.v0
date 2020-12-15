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

            if (options.validation) {
                var validationAttribute = _cx_list.findInArray(options.data, 'name', 'validation');
                if (!validationAttribute) {
                    options.data.unshift({ name: 'validation', value: formatDataValue(options.validation) });
                }
            }

            
            var dataAttribute = null;

            // URLS
            if (options.path) {
                dataAttribute = _cx_list.findInArray(options.data, 'name', 'path');
                if (!dataAttribute) { options.data.unshift({ name: 'path', value: formatDataValue(options.path) }); }
            }
            if (options.listPath) {
                dataAttribute = _cx_list.findInArray(options.data, 'name', 'list-path');
                if (!dataAttribute) { options.data.unshift({ name: 'list-path', value: formatDataValue(options.listPath) }); }
            }

            //  FIELD DATA TYPE - add if not already there
            dataAttribute = _cx_list.findInArray(options.data, 'name', 'field-data-type');
            if (!dataAttribute) { options.data.unshift({ name: 'field-data-type', value: formatDataValue(options.dataType) }); }
            //  FIELD VALUE - add if not already there
            dataAttribute = _cx_list.findInArray(options.data, 'name', 'field-value');
            if (!dataAttribute) { options.data.unshift({ name: 'field-value', value: formatDataValue(options.value) }); }
            //  FIELD NAME - add if not already there
            dataAttribute = _cx_list.findInArray(options.data, 'name', 'field');
            if (!dataAttribute) {
                var field = (options.field == undefined) ? options.fieldName : options.field;
                options.data.unshift({ name: 'field', value: formatDataValue(field) });
            }
            //  RECORD TITLE - add if not already there
            dataAttribute = _cx_list.findInArray(options.data, 'name', 'record-title');
            if (!dataAttribute && options.recordTitle) {
                options.data.unshift({ name: 'record-title', value: options.recordTitle });
            }
            //  RECORD TYPE - add if not already there
            dataAttribute = _cx_list.findInArray(options.data, 'name', 'record-name');
            if (!dataAttribute) {
                options.data.unshift({ name: 'record-name', value: options.recordName });
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