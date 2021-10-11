'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _core = require('cx-core');
const _controlBase = require('../../base/controlBase/controlBase');

class TableColumn {
    #o = null;
    #name = '';
    #type = '';
    #title = '';
    #align = '';
    #width = '';
    #lookUps = [];
    constructor(options) {
        if (!options) { options = {}; }
        this.#o = options;
        this.#name = options.name || options;
        this.#type = options.type || '';
        this.#title = options.title || '';
        this.#align = options.align || 'left';
        this.#width = options.width || 'auto';
        this.#lookUps = options.lookUps || [];
        
    }

    get name() { return this.#name; }
    get type() { return this.#type; }
    get title() { return this.#title; }
    get align() { return this.#align; }
    get width() {
        return this.#width;
    } set width(val) {
        this.#width = val;
    }
    get lookUps() { return this.#lookUps; }
    

    value(object) {
        var val = object[this.name];
        if (val === null) { return '[NULL]'; }
        if (val === undefined) { return '[UNKNOWN]'; }
        if (this.lookUps.length > 0) {
            for (var lx = 0; lx < this.lookUps.length; lx++) {
                if (this.lookUps[lx].value == val) {
                    val = this.lookUps[lx].text;
                    break;
                }
            }
            
        } else {
            if (val.constructor.name === 'Date') {
                val = _core.date.format({ date: val, inverted: true, showTime: val.hasTime(), dateTimeSep: ' - ' });
            }
            if (val.constructor.name === 'Number') {
                val = val.toLocaleString();
            }
        }
        return val;
    }
}

function formatColumns(objects, options) {
    if (!options.columns || options.columns.length == 0) {
        options.columns = [];
        //_core.list.each(objects, function (object) {
            var keys = _core.getAllKeys(objects[0], 3);
            keys.forEach(k => {
                if (k === 'constructor') { return; }
                if (_core.isObj(objects[k])) { return; }
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
    if (options.actionsTitle == undefined) { options.actionsTitle = 'actions'; }
    if (options.actions && options.actionsShowFirst) { tHead += `<th style="text-align: center; width: 50px;">${options.actionsTitle}</th>`; }
    for (var i = 0; i < options.columns.length; i++) {
        var col = options.columns[i];
        var dataFieldName = `data-field-name="${col.name}"`;
        var sortableClass = (options.sortable) ? ' class="cx_sortable"' : '';
        var textAlign = ` style="text-align: ${col.align};"`; 
        tHead += '<th ' + dataFieldName + sortableClass + textAlign + '>' + col.title + '</th>';
    }
    if (options.actions && !options.actionsShowFirst) { tHead += `<th style="text-align: center; width: 50px;">${options.actionsTitle}</th>`; }
    tHead += '</tr></thead>'
    return tHead;
}

function renderActions(object, options) {
    var tBody = '';
    if (options.actions) {
        tBody += '<td style="text-align: center; width: 50px;">';
        for (var ax = 0; ax < options.actions.length; ax++) {
            var action = options.actions[ax];
            if (action.funcName) {
                tBody += `<a class="jx-table-action" href="#" onclick="cx.clientExec('${action.funcName}', ${object[options.primaryKey]})" >${action.label}</a>`;
            } else if (action.link) {
                var link = action.link;
                if (link[link.length - 1] == '=') {
                    if (action.linkParamField) {
                        link += object[action.linkParamField];   
                    } else {
                        link += object[options.primaryKey];
                    }
                }
                tBody += `<a class="jx-table-action" href="${link}" target="${action.target}" >${action.label}</a>`;
            }
        }
        tBody += '</td>';
    }
    return tBody;
}

function renderTableBody(objects, options) {
    var tBody = '<tbody>';
    for (var i = 0; i < objects.length; i++) {
        var highlightStyle = getHighlightStyle(objects[i], options);
        
        tBody += `<tr style="${highlightStyle}" data-cx-record-id="${objects[i][options.primaryKey]}">`;
        //
        if (options.actionsShowFirst) { tBody += renderActions(objects[i], options); }

        for (var j = 0; j < options.columns.length; j++) {
            var col = options.columns[j];
            var cellValue = col.value(objects[i]);
            if (col.type == 'check') {
                cellValue = `<input type="checkbox" style="margin: 0px; width: 30px;">`;
            } else {
               
                //
                if (col.name == options.primaryKey) {
                    var link = options.path + '?id=' + cellValue;
                    cellValue = '<a href="' + link + '">view</a>&nbsp&nbsp&nbsp';
                    if (options.allowEdit) { cellValue += '<a href="' + link + '&e=T">edit</a>'; }
                    col.width = '50px';
                }
            }
            tBody += `<td style="width: ${col.width}; text-align: ${col.align};">${cellValue}</td>`;
        }

        //
        if (!options.actionsShowFirst) { tBody += renderActions(objects[i], options); }
        
        tBody += '</tr>';
    }
    tBody += '</tbody>';
    return tBody;
}

function getHighlightStyle(object, options) {
    var style = '';
    for (var hx = 0; hx < options.highlights.length; hx++) {
        var h = options.highlights[hx];
        var rawVal = object[h.column];
        if (h.op == '=') {
            if (rawVal == h.value) {
                style = h.style
                //break;
            }
        }
    }
    return style;
}



function render(options, objects) {
    //
    if (objects && objects.records) { objects = objects.records; }
    if (!objects || objects.length === undefined) { throw new Error('Argument objects must be a list!'); }
    if (!options) { options = {}; }
    if (!options.id) { options.id = 'cx-table'; }
    if (!options.title) { options.title = ''; }
    if (options.sortable === undefined) { options.sortable = true; }
    options.count = objects.length;
    //
    options.fixHeadClass = (options.fixHeader === true) ? 'jx-fixhead' : '';
    options.fixHeadClassNoBorder = (options.fixHeader === true) ? 'jx-fixhead-noborder' : '';
    options.classTblContainer = (options.fixHeader === true) ? 'jx-table-container-fixhead' : 'jx-table-container';
    options.cssTitle = 'jx-table-title';
    if (options.fixHeader) { options.cssTitle += '-fixhead'; }
    
    //
    if (!options.highlights) { options.highlights = []; }
    
    //
    formatColumns(objects, options);
    // 
    options.table = '<table id="' + options.id + '" class="jx-table ' + options.fixHeadClass + '">';
    options.table += renderTableHeader(objects, options);
    options.table += renderTableBody(objects, options);
    options.table += '</table>';

    

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'table.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _controlBase.render(options);
}


module.exports = {
    render: render
}