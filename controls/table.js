const _core = require('cx-core');

function getColumns(objects, options) {
    if (!options.columns || options.columns.length == 0) {
        options.columns = [];
        _core.list.each(objects, function (object) {
            var keys = _core.getAllKeys(object, 2);
            keys.forEach(k => {
                if (k === 'constructor') { return; }
                if (_core.isObj(object[k])) { return; }
                if (options.columns.indexOf(k) === -1) { options.columns.push(k); }
            });
        });
        
    }
}

function renderActions(objects, options) {
    var actionPanel = '<div style="padding-bottom: 7px;">';
    if (options.allowNew) {
        var link = options.path + '?e=T';
        if (options.allowNew.query) { link += '&' + options.allowNew.query; }
        actionPanel += '<input type="button" class="btn" value="new record" onclick="document.location.href=\'' + link + '\'" />';
    }
    if (options.filters) {
        actionPanel += '<input type="button" class="btn" value="Refresh" onclick="document.location.reload()" />';
    }
    actionPanel += '</div>';
    return actionPanel;
}

function renderFilters(objects, options) {
    return '<div></div>';
}

function renderTableHeader(objects, options) {
    var tHead = '<thead><tr>';
    for (var i = 0; i < options.columns.length; i++) {
        var colName = options.columns[i].title || options.columns[i];
        if (colName == 'rowver' || colName == 'rowversion') { continue; }
        if (colName == options.primaryKey) {
            tHead += '<th style="text-align: center;">actions</th>';
        } else {
            if (options.sortable) {
                tHead += '<th class="cx_sortable">' + colName + '</th>';
            } else {
                tHead += '<th>' + colName + '</th>';
            }
        }
    }
    tHead += '</tr></thead>'
    return tHead;
}

function renderTableBody(objects, options) {
    var tBody = '<tbody>';
    for (var i = 0; i < objects.length; i++) {
        
        tBody += '<tr>';
        for (var j = 0; j < options.columns.length; j++) {
            var colName = options.columns[j].title || options.columns[j];
            if (colName == 'rowver' || colName == 'rowversion') { continue; }

            var propName = options.columns[j].name || options.columns[j];

            var cellValue = objects[i][propName];
            if (propName == options.primaryKey) {
                var link = options.path + '?id=' + cellValue;
                cellValue = '<a href="' + link + '">view</a>&nbsp&nbsp&nbsp';
                if (options.allowEdit) {
                    cellValue += '<a href="' + link + '&e=T">edit</a>';
                }
                tBody += '<td style="width: 50px; text-align: center;">';
            } else {
                tBody += '<td>';
            }
            if (cellValue === null) { cellValue = '[EMPTY]'; }
            if (cellValue === undefined) { cellValue = '[UNKNOWN]'; }
            if (cellValue.constructor.name === 'Date') {
                cellValue = _core.date.format(cellValue);
            }
            tBody += cellValue;
            tBody += '</td>'
        }
        tBody += '</tr>';
    }
    tBody += '</tbody>';
    return tBody;
}

function render(objects, options) {
    if (!objects || objects.length === undefined) { throw new Error('Argument objects must be a list!'); }
    if (!options) { options = {}; }
    if (options.tableId) { options.tableId = 'cx-table'; }
    if (!options.class) { options.class = 'cx-fixhead'; }
    if (options.sortable === undefined) { options.sortable = true; }
    //objects = _core.list.toArray(objects.records);
    //
    getColumns(objects, options);
    //
    var actionPanel = renderActions(objects, options);
    //
    var filterPanel = renderFilters(objects, options);
    // 
    var table = actionPanel + filterPanel;
    if (objects.length == 0) {
        table += '<h5>no data found</h5>';
    } else {
        table += '<table id="' + options.tableId + '" class="' + options.class + '">';
        table += renderTableHeader(objects, options);
        table += renderTableBody(objects, options);
        table += '</table>';
    }
    //
    return table;
}




module.exports = {
    render: render
}