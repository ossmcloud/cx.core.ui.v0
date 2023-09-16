'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _core = require('cx-core');
const _controlBase = require('../../base/controlBase/controlBase');
const _render = require('../../cx-control-render');
const _declarations = require('../../../cx-core-ui-declarations');
const { deserialize } = require('v8');
const { template } = require('handlebars');

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
    #formatNumber = null;
    #unbound = false;
    #style = '';
    #nullText = '';
    #undefinedText = '';
    #addTotals = false;
    #link = null;
    #toolTip = null;
    #headerToolTip = '';
    #addValues = [];
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
        this.#formatNumber = options.formatNumber;
        this.#unbound = options.unbound;
        this.#style = options.style || '';
        this.#link = options.link || null;
        this.#toolTip = options.toolTip || null;
        this.#headerToolTip = options.headerToolTip || '';
        this.#addValues = options.addValues || [];

        this.#nullText = (options.nullText === undefined) ? '[NULL]' : options.nullText;
        this.#undefinedText = options.undefinedText || '[UNKNOWN]';
        this.#addTotals = options.addTotals || false;
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
    get addTotals() { return this.#addTotals; }
    get link() { return this.#link; }
    get toolTip() { return this.#toolTip; }
    get headerToolTip() { return this.#headerToolTip; }
    get addValues() { return this.#addValues; }

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
                    // @@REVIEW: encapsulate, used input.js
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
                    } else if (this.#formatNumber) {
                        var dec = 2;
                        if (this.#formatNumber.constructor.name == 'String') {
                            dec = parseInt(this.#formatNumber.substr(1));
                            if (isNaN(dec)) { dec = 2; }
                        }
                        val = parseFloat(val).toFixed(dec);
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

function renderTableHeader(objects, options, tableTotals) {
    if (options.noHeader) { return ''; }
    var tHead = '<thead><tr>';
    if (options.actionsTitle == undefined) { options.actionsTitle = 'actions'; }
    if (options.listActions && options.actionsShowFirst) {
        tHead += `<th style="text-align: center; width: 30px;"><span style="display: none; cursor: pointer;" title="show deleted lines" id="${options.id}_undo_delete_line">&#8634;</span></th>`;
    }
    if (options.actions && options.actionsShowFirst) {
        tHead += `<th style="text-align: center; width: 50px;">${options.actionsTitle}</th>`;
    }
    for (var i = 0; i < options.columns.length; i++) {
        var col = options.columns[i];
        if (col.dataHidden || col.hide) { continue; }

        var dataFieldName = `data-field-name="${col.name}"`;
        var sortableClass = (options.sortable) ? ' class="cx_sortable"' : '';
        var textAlign = ` style="text-align: ${col.align};"`;
        tHead += '<th ' + dataFieldName + sortableClass + textAlign + 'title="' + col.headerToolTip + '">';
        if (col.addTotals) {
            tableTotals[col.name] = 0;
            tHead += '<span class="jx-col-total"><span class="jx-col-total-lbl" title="The total displayed here are relevant to the page displayed and not the overall results total">&#x1F6C8;</span><span class="jx-col-total-val">{$' + col.name + '}</span></span>';
            tHead += '<span style="display: block">' + col.title + '</span>';
        } else {
            tHead += col.title;
        }
        tHead += '</th>';
    }
    if (options.actions && !options.actionsShowFirst) {
        tHead += `<th style="text-align: center; width: 50px;">${options.actionsTitle}</th>`;
    }
    if (options.listActions && !options.actionsShowFirst) {
        tHead += `<th style="text-align: center; width: 50px;"><span style="display: none; cursor: pointer;" title="show deleted lines" id="${options.id}_undo_delete_line">&#8634;</span></th>`;
    }
    tHead += '</tr></thead>'
    return tHead;
}

function renderActions(object, options) {
    var tBody = '';
    if (options.actions) {
        tBody += '<td style="text-align: center; width: 30px;">';
        for (var ax = 0; ax < options.actions.length; ax++) {
            var action = options.actions[ax];
            if (options.allowActionCondition) {
                if (!options.allowActionCondition(action, object)) {
                    continue;
                }
            }
            var actionToolTip = (action.toolTip) ? `title="${action.toolTip}"` : '';
            var actionTarget = (action.target) ? `target="${action.target}"` : '';
            if (action.funcName) {
                tBody += `<a class="jx-table-action" ${actionToolTip} href="#" onclick="cx.clientExec('${action.funcName}', ${object[options.primaryKey]} || this, event)" >${action.label}</a>`;
            } else if (action.func) {
                tBody += `<a class="jx-table-action" ${actionToolTip} href="${action.func(object)}" ${actionTarget} >${action.label}</a>`;
            } else if (action.link) {
                var link = action.link;
                if (link[link.length - 1] == '=') {
                    if (action.linkParamField) {
                        link += object[action.linkParamField];
                    } else {
                        link += object[options.primaryKey];
                    }
                }
                tBody += `<a class="jx-table-action" style="${action.style || ''}" ${actionToolTip} href="${link}" ${actionTarget} >${action.label}</a>`;
            }
        }
        tBody += '</td>';
    }
    if (options.listActions) {
        tBody += '<td style="text-align: center; width: 50px;">';
        tBody += `<span class="jx-table-action-add-line" title="add line below">&#65291;</span>`;
        tBody += `<span class="jx-table-action-copy-line" title="duplicate line">&#x29C9;</span>`;
        tBody += `<span class="jx-table-action-delete-line" title="delete line">&#128465;</span>`;
        tBody += '</td>';
    }
    return tBody;
}

function renderTableBody(objects, options, tableTotals, rowTemplate) {
    var tBody = (rowTemplate) ? '<tfoot>' : '<tbody>';
    for (var i = 0; i < objects.length; i++) {
        var isNewRowTemplate = '';
        var highlightStyle = getHighlightStyle(objects[i], options);
        if (rowTemplate) {
            highlightStyle += ' display: none';
            isNewRowTemplate = 'data-row-template="true"';
        }
        var lineNo = (rowTemplate) ? -1 : i;
        var tRow = `<tr style="${highlightStyle}" data-cx-record-id="${objects[i][options.primaryKey]}" ${isNewRowTemplate} data-cx-line-no="${lineNo}" [$DATA$]>`;
        //
        if (options.actionsShowFirst) { tRow += renderActions(objects[i], options); }

        var dataAttr = ''; var jj = 0;
        for (var j = 0; j < options.columns.length; j++) {
            var col = options.columns[j];
            var cellColStyle = col.style || '';
            if (col.input) { cellColStyle += ' padding: 1px 0px 0px 0px;'; }

            if (col.dataHidden) {
                dataAttr += ` data-${col.dataHidden}="${col.value(objects[i], true)}"`;
                continue;
            }

            var cellToolTip = '';
            var cellValue = col.value(objects[i]);
            if (col.addTotals) {
                if (!tableTotals[col.name]) { tableTotals[col.name] = 0; }
                var cellValueNo = parseFloat(objects[i][col.name]);
                if (!isNaN(cellValueNo)) { tableTotals[col.name] += cellValueNo };
            }

            cellValue = formatCellValue(cellValue, options, col, objects[i]);
            if (col.addValues && col.addValues.length > 0) {
                for (var ax = 0; ax < col.addValues.length; ax++) {
                    var addValueObj = col.addValues[ax];
                    if (addValueObj.constructor.name == 'String') { addValueObj = { name: addValueObj };                    }
                    var addValue = formatCellValue(objects[i][addValueObj.name], options, col, objects[i]);
                    if (addValueObj.style) {
                        addValue = `<span style="${addValueObj.style}">${addValue}</span>`
                    }

                    cellValue += `<br />${addValue}`;

                }
            }

            // if (col.type == 'check') {
            //     // CHECK: built in check box column
            //     cellValue = `<input type="checkbox" style="margin: 0px; width: 30px;">`;

            // } else if (col.input) {
            //     // INPUT: the column has an input control 
            //     col.input.id = 'cxlist_' + options.id + '_' + col.name + '_' + ((rowTemplate) ? 'tmpl_idx' : i);
            //     col.input.name = col.input.id;

            //     col.input.fieldName = col.input.id;
            //     col.input.fieldNameDb = col.name;

            //     col.input.value = objects[i][col.name];
            //     col.input.dataAttributes = null;
            //     col.input.data = null;

            //     cellValue = _input.render(col.input);
            //     cellColStyle += ' padding: 1px 0px 0px 0px;';

            // } else {
            //     if (options.path && col.name == options.primaryKey) {
            //         // PRIMARY KEY VIEW EDIT LINKS: we only show this if we have a .path set
            //         var target = ' target="' + (options.linkTarget || '_self') + '" ';
            //         var link = options.path + ((options.path.indexOf('?') < 0) ? '?' : '&') + 'id=' + cellValue;
            //         cellValue = '<a tabindex="-1" style="text-decoration: none;"' + target + 'href="' + link + '" title="view...">&#128269;</a>';
            //         if (options.allowEditCondition) {
            //             if (options.allowEditCondition(objects[i])) { cellValue += ' <a tabindex="-1" style="text-decoration: none;" ' + target + 'href="' + link + '&e=T" title="edit...">&#x270E;</a>'; }
            //         } else if (options.allowEdit) {
            //             cellValue += ' <a tabindex="-1" style="text-decoration: none;" ' + target + 'href="' + link + '&e=T" title="edit...">&#x270E;</a>';
            //         }
            //         col.width = '30px';

            //     } else {
            //         // BOOLEAN RENDER: Replace boolean values with 'checked' / 'unchecked' UTF-* chars
            //         if (cellValue === false) { cellValue = '&#x2610;'; }
            //         if (cellValue === true) { cellValue = '&#x2611;'; }

            //         // CUSTOM LINK:
            //         if (col.link) {
            //             var linkValue = col.value(objects[i]);
            //             // @@IMPROVE: we could accept valueField as array of valueField, paramName for the url
            //             if (col.link.valueField) { linkValue = objects[i][col.link.valueField]; }
            //             if (linkValue) {
            //                 var linkPlaceHolder = '{' + (col.link.paramName || col.name) + '}';
            //                 var linkUrl = (col.link.constructor.name == 'String') ? col.link : col.link.url;
            //                 linkUrl = linkUrl.replace(linkPlaceHolder, linkValue);
            //                 cellValue = `<a href="${linkUrl}" target="_blank" >${cellValue}</a>`;
            //             }

            //         }
            //     }

            //     if (col.toolTip) {
            //         cellToolTip = objects[i][col.toolTip.valueField || col.name] || '';
            //         if (col.toolTip.suppressText) { cellValue = ''; }
            //     }

            //     // CUSTOM STYLE: if a .style is passed then we wrap the value with it 
            //     if (objects[i].style) { cellValue = '<span style="' + objects[i].style + '">' + cellValue + '</span>'; }
            // }

            if (col.toolTip) {
                cellToolTip = objects[i][col.toolTip.valueField || col.name] || '';
                if (col.toolTip.suppressText) { cellValue = ''; }
            }

            // CUSTOM STYLE: if a .style is passed then we wrap the value with it
            if (objects[i].style) { cellValue = '<span style="' + objects[i].style + '">' + cellValue + '</span>'; }

            // now get cell highlight styles and wrap if any
            var cellStyle = getCellHighlightStyle(objects[i], col, options);
            if (cellStyle) { cellValue = `<span style="${cellStyle}">${cellValue}</span>`; }

            // NOTE: if we have list actions and this is the 1st visible cell, 
            //          then we add an hidden input control with the line's id so that actions can safely and efficiently retrieve it
            if (options.listActions && jj == 0) {
                var hiddenId = 'cxlist_' + options.id + '_lineId_' + ((rowTemplate) ? 'tmpl_idx' : i);
                cellValue += `<input type="hidden" id="${hiddenId}" name="${hiddenId}" value="${objects[i].id}">`;
            }
            jj++;

            // build table cell
            tRow += `<td style="width: ${col.width}; text-align: ${col.align}; ${(col.fontSize ? 'font-size: ' + col.fontSize + ';' : '')} ${cellColStyle}" title="${cellToolTip}">${cellValue}</td>`;

        }

        tRow = tRow.replace('[$DATA$]', dataAttr);

        //
        if (!options.actionsShowFirst) { tRow += renderActions(objects[i], options); }

        tRow += '</tr>';
        tBody += tRow;
    }
    tBody += ((rowTemplate) ? '</tfoot>' : '</tbody>');
    return tBody;
}

function formatCellValue(cellValue, options, col, object) {
    if (col.type == 'check') {
        // CHECK: built in check box column
        cellValue = `<input type="checkbox" style="margin: 0px; width: 30px;">`;

    } else if (col.input) {
        // INPUT: the column has an input control 
        col.input.id = 'cxlist_' + options.id + '_' + col.name + '_' + ((rowTemplate) ? 'tmpl_idx' : i);
        col.input.name = col.input.id;

        col.input.fieldName = col.input.id;
        col.input.fieldNameDb = col.name;

        col.input.value = objects[i][col.name];
        col.input.dataAttributes = null;
        col.input.data = null;

        cellValue = _input.render(col.input);
       

    } else {
        if (options.path && col.name == options.primaryKey) {
            // PRIMARY KEY VIEW EDIT LINKS: we only show this if we have a .path set
            var target = ' target="' + (options.linkTarget || '_self') + '" ';
            var link = options.path + ((options.path.indexOf('?') < 0) ? '?' : '&') + 'id=' + cellValue;
            cellValue = '<a tabindex="-1" style="text-decoration: none;"' + target + 'href="' + link + '" title="view...">&#128269;</a>';
            if (options.allowEditCondition) {
                if (options.allowEditCondition(objects[i])) { cellValue += ' <a tabindex="-1" style="text-decoration: none;" ' + target + 'href="' + link + '&e=T" title="edit...">&#x270E;</a>'; }
            } else if (options.allowEdit) {
                cellValue += ' <a tabindex="-1" style="text-decoration: none;" ' + target + 'href="' + link + '&e=T" title="edit...">&#x270E;</a>';
            }
            col.width = '30px';

        } else {
            // BOOLEAN RENDER: Replace boolean values with 'checked' / 'unchecked' UTF-* chars
            if (cellValue === false) { cellValue = '&#x2610;'; }
            if (cellValue === true) { cellValue = '&#x2611;'; }

            // CUSTOM LINK:
            if (col.link) {
                var linkValue = col.value(object);
                // @@IMPROVE: we could accept valueField as array of valueField, paramName for the url
                if (col.link.valueField) { linkValue = object[col.link.valueField]; }
                if (linkValue) {
                    var linkPlaceHolder = '{' + (col.link.paramName || col.name) + '}';
                    var linkUrl = (col.link.constructor.name == 'String') ? col.link : col.link.url;
                    linkUrl = linkUrl.replace(linkPlaceHolder, linkValue);
                    cellValue = `<a href="${linkUrl}" target="_blank" >${cellValue}</a>`;
                }

            }
        }

    }
    return cellValue;
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
        if (!h.columns) {
            if (h.column != column.name) { continue; }
        } else {
            if (h.columns.indexOf(column.name) < 0) { continue; }
        }

        var applied = false;
        var rawVal = object[h.column];
        var compareValue = h.value;
        if (rawVal && rawVal.constructor.name == 'Number') {
            rawVal = rawVal.roundNumber(2);
            compareValue = parseFloat(h.value).roundNumber(2);
        }

        if (h.op == '=') {
            if (rawVal == compareValue) { style += h.style; applied = true; }
        } else if (h.op == '!=') {
            if (rawVal != compareValue) { style += h.style; applied = true; }
        } else if (h.op == '>') {
            if (rawVal > compareValue) { style += h.style; applied = true; }
        } else if (h.op == '>=') {
            if (rawVal >= compareValue) { style += h.style; applied = true; }
        } else if (h.op == '<') {
            if (rawVal < compareValue) { style += h.style; applied = true; }
        } else if (h.op == '<=') {
            if (rawVal <= compareValue) { style += h.style; applied = true; }
        } else if (h.customStyle) {
            var tStyle = (h.customStyle(object, rawVal, h) || '');
            if (tStyle) {
                applied = true;
                style += tStyle;
            }

        }
        if (style) { style += ' '; }
        if (h.stop && applied) { break; }
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
    var tableTotals = {};
    options.table = '<table id="' + options.id + '" class="jx-table ' + options.fixHeadClass + '">';
    options.table += renderTableHeader(objects, options, tableTotals);
    options.table += renderTableBody(objects, options, tableTotals);

    if (options.rowTemplate) {
        options.table += renderTableBody([options.rowTemplate], options, {}, true);
    }

    options.table += '</table>';
    for (var key in tableTotals) {
        options.table = options.table.replace('{$' + key + '}', tableTotals[key].formatMoney());
    }

    if (options.lookupLists) {
        options.lookupLists = _core.text.toBase64(JSON.stringify(options.lookupLists));
    }


    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'table.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _controlBase.render(options);
}


module.exports = {
    render: render
}