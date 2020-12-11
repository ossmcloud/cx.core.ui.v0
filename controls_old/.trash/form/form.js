'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _core = require('cx-core');
const _declarations = require('../../cx-core-ui-declarations');


function getColumns(record, options) {
    if (!options.columns || options.columns.length == 0) {
        options.columns = [];
        _core.list.eachProp(record.fields, function (f) {
            options.columns.push(f);
        });
    }
}

function _render(ui, record, options) {

    if (!options.formMethod) { options.formMethod = 'POST'; }
    if (!options.formAction) { options.formAction = options.path; }
    options.recordId = (record[options.primaryKey] || '');
    options.rowVersion = _core.bufferToString(record.rowVersion);

    options.fieldHtml = '';
    options.groups.forEach(g => {
        if (!g.columnCount) { g.columnCount = 5; }
        var html = '';
        for (var gcx = 1; gcx <= g.columnCount; gcx++) {
            var htmlInner = '';
            options.fields.forEach(c => {
                if (!c.column) { c.column = 1; }
                if (c.group == g.name && c.column == gcx) {
                    var fieldName = c.name;
                    var fieldValue = record[fieldName];
                    if (fieldValue === undefined || fieldValue === null && c.readOnly) { fieldValue = '[NULL]'; }
                    if (!c.type) {
                        if (c.items){
                            c.type = _declarations.ControlType.DROPDOWN;
                        } else {
                            c.type = _declarations.ControlType.TEXT;
                        }
                    }

                    if (c.options) {
                        htmlInner += ui.render(c.options);
                    } else {
                        c.fieldName = fieldName;
                        c.value = fieldValue;
                        c.inputType = c.type || ui.Type.TEXT;
                        c.readOnly = (fieldName == options.primaryKey) || !(options.editMode || c.edit) || c.readOnly;
                        c.width = c.width || '100%';
                        htmlInner += ui.render(c);
                    }
                }
            });
            //if (htmlInner) {
                html += '<div class="form-field-group-column">' + htmlInner + '</div>';
            //}
        }
    
        var fieldsGroup = _h.compile(_fs.readFileSync(_path.join(__dirname, 'form-fields-group.hbs'), 'utf8'));
        options.fieldHtml += fieldsGroup({ title: g.title, fields: html });
    });
    

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'form.hbs'), 'utf8'));
    return hTmpl(options);
}


module.exports = {
    render: _render
}