'use strict';

const _core = require('cx-core');
//const _cored = require('cx-core/core/cx-core-date');
const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');

const _monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function _render(options) {
    if (!options.date) { options.date = _core.date.format({ inverted: true }); }
    if (!options.flags) { options.flags = []; }
    var y = parseInt(options.date.split('-')[0]);
    var m = parseInt(options.date.split('-')[1]);

    // get month start
    var startDate = new Date(y, (m - 1), 1);
    // get month end
    var endDate = startDate.addMonths(1).addDays(-1);
    // start from 1st monday
    while (startDate.getDay() != 1) { startDate = startDate.addDays(-1); }
    // end at last sunday
    while (endDate.getDay() != 0) { endDate = endDate.addDays(1); }
    

    var html = ''; var c = 0;
    while (startDate <= endDate) {
        html += '<tr>';
        for (var dx = 0; dx < 7; dx++) {
            // console.log(dx);
            if (startDate.getMonth() == (m - 1) && startDate < new Date()) {
                var date = _core.date.format({ date: startDate, inverted: true });
                var flag = _core.list.findInArray(options.flags, "d", date);
                if (flag) {
                    html += `<td class="cx-calendar-current-on" style="padding: 0px;"><a title="${flag.toolTip}" target="_blank" href="${flag.link}">${startDate.getDate()}</a></td>`;
                } else {
                    html += `<td class="cx-calendar-current-off" title="no data for this day">${startDate.getDate()}</td>`;
                }
            } else if (startDate >= new Date()) {
                html += `<td class="cx-calendar-future" title="future..." >${startDate.getDate()}</td>`;
            } else {
                html += `<td class="cx-calendar-past">${startDate.getDate()}</td>`;
            }
            startDate = startDate.addDays(1);
            c++;
        }
        html += '</tr>';
        if (c > 34) { break; }
    }
    options.calendar = html;
    options.monthName = _monthNames[m - 1];

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'calendar.hbs'), 'utf8'));
    return hTmpl(options);
}

module.exports = {
    render: _render
}