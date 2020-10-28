'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _core = require('cx-core');

class TableColumn {
    #o = null;
    #name = '';
    #title = '';
    #align = '';
    #width = '';
    constructor(options) {
        if (!options) { options = {}; }
        this.#o = options;
        this.#name = options.name || options;
        this.#title = options.title || this.#name;
        this.#align = options.align || 'left';
        this.#width = options.width || 'auto';
    }

    get name() { return this.#name; }
    get title() { return this.#title; }
    get align() { return this.#align; }
    get width() {
        return this.#width;
    } set width(val) {
        this.#width = val;
    }

    value(object) {
        var val = object[this.name];
        if (val === null) { val = '[NULL]'; }
        if (val === undefined) { val = '[UNKNOWN]'; }
        if (val.constructor.name === 'Date') {
            val = _core.date.format({ date: val, inverted: true, showTime: val.hasTime(), dateTimeSep: ' - ' });
        }
        return val;
    }
}

function formatColumns(objects, options) {
    if (!options.columns || options.columns.length == 0) {
        options.columns = [];
        //_core.list.each(objects, function (object) {
            var keys = _core.getAllKeys(objects[0], 2);
            keys.forEach(k => {
                if (k === 'constructor') { return; }
                if (_core.isObj(object[k])) { return; }
                options.columns.push(new TableColumn(k));
                //if (options.columns.indexOf(k) === -1) { options.columns.push(k); }
            });
        //});
    }
    var formattedColumns = [];
    _core.list.each(options.columns, function (column) {
        var formattedColumn = new TableColumn(column);
        if (formattedColumn.name == 'rowver' || formattedColumn.name == 'rowversion') { return; }
        formattedColumns.push(formattedColumn);
    });
    options.columns = formattedColumns;
}

function renderTableHeader(objects, options) {
    var tHead = '<thead><tr>';
    for (var i = 0; i < options.columns.length; i++) {
        var col = options.columns[i];
        var dataFieldName = `data-field-name="${col.name}"`;
        var sortableClass = (options.sortable) ? ' class="cx_sortable"' : '';
        var textAlign = ` style="text-align: ${col.align};"`; 
        tHead += '<th ' + dataFieldName + sortableClass + textAlign + '>' + col.title + '</th>';
    }
    tHead += '</tr></thead>'
    return tHead;
}

function renderTableBody(objects, options) {
    var tBody = '<tbody>';
    for (var i = 0; i < objects.length; i++) {
        tBody += '<tr>';
        for (var j = 0; j < options.columns.length; j++) {
            var col = options.columns[j];
            var cellValue = col.value(objects[i]);
            //
            if (col.name == options.primaryKey) {
                var link = options.path + '?id=' + cellValue;
                cellValue = '<a href="' + link + '">view</a>&nbsp&nbsp&nbsp';
                if (options.allowEdit) { cellValue += '<a href="' + link + '&e=T">edit</a>'; }
                col.width = '50px';
            }
            tBody += `<td style="width: ${col.width}; text-align: ${col.align};">${cellValue}</td>`;
        }
        tBody += '</tr>';
    }
    tBody += '</tbody>';
    return tBody;
}


function render(objects, options) {
    //
    if (!objects || objects.length === undefined) { throw new Error('Argument objects must be a list!'); }
    if (!options) { options = {}; }
    if (!options.tableId) { options.tableId = 'cx-table'; }
    if (!options.title) { options.title = ''; }
    if (options.sortable === undefined) { options.sortable = true; }
    options.count = objects.length;
    //
    options.fixHeadClass = (options.fixHeader === true) ? 'cx-fixhead' : '';
    options.fixHeadClassNoBorder = (options.fixHeader === true) ? 'cx-fixhead-noborder' : '';
    //
    formatColumns(objects, options);
    // 
    options.table = '<table id="' + options.tableId + '" class="cx-table ' + options.fixHeadClass + '">';
    options.table += renderTableHeader(objects, options);
    options.table += renderTableBody(objects, options);
    options.table += '</table>';

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'table.hbs'), 'utf8'));
    return hTmpl(options);
}


module.exports = {
    render: render
}