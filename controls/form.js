'use strict';

const _core = require('cx-core');

function getColumns(record, options) {
    if (!options.columns || options.columns.length == 0) {
        options.columns = [];
        _core.list.eachProp(record.fields, function (f) {
            options.columns.push(f); 
        });
        
    }
}

function _render(record, options) {
    getColumns(record, options);

    var recId = (record[options.primaryKey] || '');
    var html = '';
    if (options.edit) { html += '<form method="POST" action="' + options.path + '">'; }
    html += '<div><div class="form-field-group">';
    html += '<input name="accountId" type="hidden" value=' + options.accountId + ' />';
    html += '<input name="recordId" type="hidden" value=\'' + recId + '\' />';
    html += '<input name="rowVersion" type="hidden" value=\'' + _core.bufferToString(record.rowVersion) + '\' />';

    html += '<div class="form-action-panel">';
    if (options.edit) {
        html += '<input class="btn form-inline" type="submit" value="Save" />';
    } else {
        // TODO: add edit button
        html += '<input class="btn form-inline" type="button" value="Edit" onclick="document.location.href=\'' + options.path + '?id=' + recId + '&e=T\';" />';
    }
    html += '<input class="btn form-inline" type="button" value="Back" onclick="window.history.back();" />';
    if (options.listPath) {
        html += '<div style="float: right; padding-left: 17px;">';
        html += '<a href=' + options.listPath + '>list</a>';
        html += '</div>';
    }
    html += '</div>';

    options.columns.forEach(c => {
        var fieldName = c.name || c;
        var fieldValue = record[fieldName];
        if (fieldValue === undefined || fieldValue === null) { fieldValue = ''; }
        html += _renderControl({
            label: c.label || c,
            name: fieldName,
            value: fieldValue,
            readOnly: (fieldName == options.primaryKey) || !(options.edit || c.edit),
        });
    }); 
    
    html += '</div></div>';

    if (options.edit) { html += '</form>'; }
    return html;
}

function _renderControl(recordField) {
    var html = '<label>' + recordField.label + '</label>';
    if (recordField.readOnly || recordField.name == 'created') {
        html += '<span class="inlineText">' + (recordField.value) + '</span>';
    } else {
        html += '<input name="' + recordField.name + '" class="form-control" type="text" value="' + (recordField.value) + '" />';
    }
    return html;
}


module.exports = {
    render: _render
}