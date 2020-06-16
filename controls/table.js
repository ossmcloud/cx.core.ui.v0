const _core = require('cx-core');

/*
function jsonSetsToHtml(sets) {
    var tables = '';
    for (var i = 0; i < sets.length; i++) {
        tables += jsonToHtml(sets[i]) + '<br /><br /><br />';
    }
    return tables;
}
*/


function jsonToHtml(objects, options) {
    if (!options) { options = {}; }
    if (options.tableId) { options.tableId = 'p-table'; }
    if (!options.class) { options.class = ''; }

    objects = pCore.toArray(objects);
    // EXTRACT VALUE FOR HTML HEADER. 
    if (!options.hideHeader) {
        var col = [];
        for (var i = 0; i < objects.length; i++) {
            for (var key in objects[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }
    }

    var table = '';
    if (options.new) {
        var link = options.link + '?e=T';
        if (options.new.query) {
            link += '&' + options.new.query;
        }

        table = '<div style="padding-bottom: 7px;"><input type="button" class="btn" value="new record" onclick="document.location.href=\'' + link + '\'" /></div>';
    }

    if (objects.length == 0) {
        return table += '<h5>no data found</h5>';
    }

    // CREATE DYNAMIC TABLE.

    table += '<table id="' + options.tableId + '" class="' + options.class + '">';
    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
    table += '<thead><tr>'
    for (var i = 0; i < col.length; i++) {
        if (col[i] == 'rowver') { continue; }
        if (col[i] == options.id) {
            table += '<th style="text-align: center;">actions</th>';
        } else {
            if (options.sortable) {
                table += '<th class="p_sortable">' + col[i] + '</th>';
            } else {
                table += '<th>' + col[i] + '</th>';
            }
        }
    }
    table += '</tr></thead>'

    // ADD JSON DATA TO THE TABLE AS ROWS.
    table += '<tbody>';
    for (var i = 0; i < objects.length; i++) {
        table += '<tr>';
        for (var j = 0; j < col.length; j++) {
            if (col[j] == 'rowver') { continue; }

            var cellValue = objects[i][col[j]];
            if (col[j] == options.id) {
                var link = options.link + '?id=' + cellValue;
                cellValue = '<a href="' + link + '">view</a>&nbsp&nbsp&nbsp';
                if (options.edit) {
                    cellValue += '<a href="' + link + '&e=T">edit</a>';
                }
                table += '<td style="width: 50px; text-align: center;">';
            } else {
                table += '<td>';
            }
            if (cellValue === null) { cellValue = '[EMPTY]'; }
            if (cellValue === undefined) { cellValue = '[UNKNOWN]'; }
            if (cellValue.constructor.name === 'Date') {

                cellValue = pCore.formatDate(cellValue);
            }
            table += cellValue;
            table += '</td>'
        }
        table += '</tr>';
    }
    table += '</tbody>';
    table += '</table>';
    return table;
}





module.exports = {
    jsonToHtml: jsonToHtml
}