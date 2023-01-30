'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _core = require('cx-core');
const _controlBase = require('../../base/controlBase/controlBase');
const _declarations = require('../../../cx-core-ui-declarations');
const { deserialize } = require('v8');

var _input = null;

class TableColumn {
    #o = null;
    #name = '';
    #type = '';
    #title = '';
    #align = '';
    #width = '';
    #lookUps = [];
    #dataHidden = false;
    #input = null;
    #fontSize = null;
    #formatMoney = null;
    #formatPercent = null;
    #unbound = false;
    #style = '';
    #nullText = '';
    #undefinedText = '';
    constructor(options) {
        if (!options) { options = {}; }
        if (options.constructor.name == 'String') {
            options = { name: options };
        }
        this.#o = options;
        this.#name = options.name || options;
        this.#type = options.type || '';
        this.#title = options.title || options.name || '';
        //this.#title = options.title || '';
        this.#align = options.align || 'left';
        this.#width = options.width || 'auto';
        this.#lookUps = options.lookUps || [];
        this.#dataHidden = options.dataHidden || null;
        this.#input = options.input || null;
        this.#fontSize = options.fontSize || null;
        this.#formatMoney = options.formatMoney;
        this.#formatPercent = options.formatPercent;
        this.#unbound = options.unbound;
        this.#style = options.style || '';

        this.#nullText = options.nullText || '[NULL]';
        this.#undefinedText = options.undefinedText || '[UNKNOWN]';
    }

    get name() { return this.#name; }
    get type() { return this.#type; }
    get title() { return this.#title; }
    get align() { return this.#align; }
    get dataHidden() { return this.#dataHidden; }
    get input() { return this.#input; }
    get fontSize() { return this.#fontSize; }
    get width() {
        return this.#width;
    } set width(val) {
        this.#width = val;
    }
    get lookUps() { return this.#lookUps; }
    get unbound() { return this.#unbound; }
    get style() { return this.#style; }


    value(object, raw) {
        var val = object[this.name];
        if (this.unbound) { return ''; }
        if (val === null) { return '<span style="font-style: italic; color: var(--element-color-disabled)">' + this.#nullText + '</span>'; }
        if (val === undefined) { return '<span style="font-style: italic; color: var(--element-color-disabled)">' + this.#undefinedText + '</span>'; }
        if (this.lookUps.length > 0) {
            for (var lx = 0; lx < this.lookUps.length; lx++) {
                if (this.lookUps[lx].value == val) {
                    val = this.lookUps[lx].text;
                    break;
                }
            }

        } else {
            if (!raw) {
                if (val.constructor.name === 'Date') {
                    val = _core.date.format({ date: val, inverted: true, showTime: val.hasTime(), dateTimeSep: ' - ' });
                }
                if (val.constructor.name === 'Number' || !isNaN(parseFloat(val))) {
                    if (this.#formatMoney) {
                        var dec = 2;
                        if (this.#formatMoney.constructor.name == 'String') {
                            dec = parseInt(this.#formatMoney.substr(1));
                            if (isNaN(dec)) { dec = 2; }
                        }
                        val = parseFloat(val).formatMoney(dec);
                    } else if (this.#formatPercent === true) {
                        val = parseFloat(val).formatMoney(2) + '%';
                    } else if (this.#formatPercent === '*100') {
                        val = parseFloat(val * 100).formatMoney(2) + '%';
                    }
                }
            } else {
                if (_core.isObj(val) || Array.isArray(val)) {
                    val = JSON.stringify(val);
                    val = escape(val);
                }
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
    if (options.noHeader) { return ''; }
    var tHead = '<thead><tr>';
    if (options.actionsTitle == undefined) { options.actionsTitle = 'actions'; }
    if (options.actions && options.actionsShowFirst) { tHead += `<th style="text-align: center; width: 50px;">${options.actionsTitle}</th>`; }
    for (var i = 0; i < options.columns.length; i++) {
        var col = options.columns[i];
        if (col.dataHidden || col.hide) {
            continue;
        }
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
            if (options.allowActionCondition) {
                if (!options.allowActionCondition(action, object)) {
                    continue;
                }
            }
            if (action.funcName) {
                tBody += `<a class="jx-table-action" href="#" onclick="cx.clientExec('${action.funcName}', ${object[options.primaryKey]} || this, event)" >${action.label}</a>`;
            } else if (action.func) {
                tBody += `<a class="jx-table-action" href="${action.func(object)}" target="${action.target}" >${action.label}</a>`;
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

        var tRow = `<tr style="${highlightStyle}" data-cx-record-id="${objects[i][options.primaryKey]}" [$DATA$]>`;

        //
        if (options.actionsShowFirst) { tRow += renderActions(objects[i], options); }

        var dataAttr = '';
        for (var j = 0; j < options.columns.length; j++) {
            var col = options.columns[j];
            if (col.dataHidden) {
                dataAttr += ` data-${col.dataHidden}="${col.value(objects[i], true)}"`;
                continue;
            }
            var cellValue = col.value(objects[i]);
            if (col.type == 'check') {
                cellValue = `<input type="checkbox" style="margin: 0px; width: 30px;">`;

            } else if (col.input) {
                col.input.name = col.name;
                col.input.id = i + '_' + col.name;
                col.input.value = objects[i][col.name];
                cellValue = _input.render(col.input);

            } else {
                if (col.name == options.primaryKey) {
                    if (options.path) {
                        var link = options.path + ((options.path.indexOf('?') < 0) ? '?' : '&') + 'id=' + cellValue;
                        cellValue = '<a href="' + link + '">view</a>&nbsp&nbsp&nbsp';
                        if (options.allowEditCondition) {
                            if (options.allowEditCondition(objects[i])) { cellValue += '<a href="' + link + '&e=T">edit</a>'; }
                        } else if (options.allowEdit) {
                            cellValue += '<a href="' + link + '&e=T">edit</a>';
                        }
                        col.width = '50px';
                    }
                } else {
                    if (cellValue === false) { cellValue = '&#x2610;'; }
                    if (cellValue === true) { cellValue = '&#x2611;'; }
                    if (objects[i].style) {
                        cellValue = '<span style="' + objects[i].style + '">' + cellValue + '</span>';
                    }
                }
            }

            //
            var cellStyle = getCellHighlightStyle(objects[i], col, options);
            if (cellStyle) { cellValue = `<span style="${cellStyle}">${cellValue}</span>`; }

            var cellColStyle = col.style || '';
            tRow += `<td style="width: ${col.width}; text-align: ${col.align}; ${(col.fontSize ? 'font-size: ' + col.fontSize + ';' : '')} ${cellColStyle}">${cellValue}</td>`;
        }

        tRow = tRow.replace('[$DATA$]', dataAttr);

        //
        if (!options.actionsShowFirst) { tRow += renderActions(objects[i], options); }

        tRow += '</tr>';
        tBody += tRow;
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
            if (rawVal == h.value) { style += h.style }
        } else if (h.op == '!=') {
            if (rawVal != h.value) { style += h.style }
        } else if (h.op == '>') {
            if (rawVal > h.value) { style += h.style; }
        } else if (h.op == '>=') {
            if (rawVal >= h.value) { style += h.style; }
        } else if (h.op == '<') {
            if (rawVal < h.value) { style += h.style; }
        } else if (h.op == '<=') {
            if (rawVal <= h.value) { style += h.style; }
        } else if (h.customStyle) {
            style += (h.customStyle(object, rawVal, h) || '');
        }
        if (style) { style += ' '; }
    }
    return style;
}

function getCellHighlightStyle(object, column, options) {
    var style = '';
    for (var hx = 0; hx < options.cellHighlights.length; hx++) {
        var h = options.cellHighlights[hx];
        if (!h.columns || h.columns.indexOf(column.name) < 0) {
            continue;
        }

        var rawVal = object[h.column];
        if (h.op == '=') {
            if (rawVal == h.value) { style += h.style }
        } else if (h.op == '!=') {
            if (rawVal != h.value) { style += h.style }
        } else if (h.op == '>') {
            if (rawVal > h.value) { style += h.style; }
        } else if (h.op == '>=') {
            if (rawVal >= h.value) { style += h.style; }
        } else if (h.op == '<') {
            if (rawVal < h.value) { style += h.style; }
        } else if (h.op == '<=') {
            if (rawVal <= h.value) { style += h.style; }
        } else if (h.customStyle) {
            style += (h.customStyle(object, rawVal, h) || '');
        }
        if (style) { style += ' '; }
    }
    return style;
}




function render(options, objects, input) {
    //
    _input = input;
    if (objects && objects.records) { objects = objects.records; }
    if (!objects || objects.length === undefined) { throw new Error('Argument objects must be a list!'); }
    if (!options) { options = {}; }
    if (!options.id) { options.id = 'cx-table'; }
    if (!options.title) { options.title = ''; }
    if (options.sortable === undefined) { options.sortable = true; }
    options.count = objects.length;
    if (options.paging) {
        options.noCount = true;
        if (objects.length > 0) {
            var fromRow = options.pageSize * (options.pageNo - 1);
            var toRow = fromRow + objects.length;
            options.customCount = (fromRow + 1) + ' &#x21E8; ' + toRow;
        } else {
            options.customCount = '';
        }
        if (objects.count) { options.customCount += (' (of ' + objects.count + ')'); }
    }
    //
    options.fixHeadClass = (options.fixHeader === true) ? 'jx-fixhead' : '';
    options.fixHeadClassNoBorder = (options.fixHeader === true || options.noBorder === true) ? 'jx-fixhead-noborder' : '';
    options.classTblContainer = (options.fixHeader === true) ? 'jx-table-container-fixhead' : 'jx-table-container';
    if (!options.cssTitle) { options.cssTitle = 'jx-table-title'; }
    if (options.fixHeader) { options.cssTitle += '-fixhead'; }

    //
    if (!options.highlights) { options.highlights = []; }
    if (!options.cellHighlights) { options.cellHighlights = []; }


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