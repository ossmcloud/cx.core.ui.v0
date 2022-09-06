'use strict'

const _fs = require('fs');
const _path = require('path');
const _h = require('handlebars');
const _core = require('cx-core');
const _controlBase = require('../base/controlBase/controlBase');

const _monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function _render(options) {
    if (!options.id) { options.id = 'jx-calendar'; }
    if (!options.date) {
        options.date = _core.date.format({ inverted: true });
    }
    if (!options.flags) { options.flags = []; }

    var y = parseInt(options.date.split('-')[0]);
    var m = parseInt(options.date.split('-')[1]);
    var d = parseInt(options.date.split('-')[2]);
    var theDate = new Date(y, (m - 1), d);

    if (isNaN(y) || y < 1900) { y = (new Date().getFullYear() + 1) };
    if (isNaN(m) || m < 1 || m > 12) { m = (new Date().getMonth() + 1) };

    // get month start
    var startDate = new Date(y, (m - 1), 1);
    // get month end
    var endDate = startDate.addMonths(1).addDays(-1);
    // start from 1st monday
    while (startDate.getDay() != 1) { startDate = startDate.addDays(-1); }
    // end at last sunday
    while (endDate.getDay() != 0) { endDate = endDate.addDays(1); }

    var html = ''; var c = 0; var today = Date.today();
    while (startDate <= endDate) {
        html += '<tr>';
        for (var dx = 0; dx < 7; dx++) {

            var date = _core.date.format({ date: startDate, inverted: true });
            html += `<td data-value="${date}" `;

            var cellValue = startDate.getDate();
            var paddingStyle = ''; var toolTip = '';

            var flag = _core.list.findInArray(options.flags, "d", date);
            if (flag) {
                cellValue = `<a title="${flag.toolTip}"  href="${flag.link}">${startDate.getDate()}</a>`;
                paddingStyle = ' style="padding: 0px; ' + flag.style + '"';
            } else {
                if (startDate >= today) {
                    toolTip = 'future date';
                } else {
                    toolTip = 'no data available';
                    if (options.noFlagStyle) {
                        paddingStyle = ' style="' + options.noFlagStyle + '"';
                    }
                }
            }

            if (date == options.date) {
                // highlight selected date
                html += `class="jx-calendar-current-on jx-calendar-current-now" style="${flag.style}"`;
                cellValue = startDate.getDate();
            } else if (startDate.getMonth() == (m - 1) && startDate < today) {
                // current month
                if (flag) {
                    html += `class="jx-calendar-current-on" ${paddingStyle}`;
                } else {
                    html += `class="jx-calendar-current-off" ${paddingStyle}`;
                }
            } else if (startDate >= today) {
                html += `class="jx-calendar-future" ${paddingStyle}`;
            } else {
                html += `class="jx-calendar-past"  ${paddingStyle}`;
            }
            html += ` title="${toolTip}">`;
            html += (cellValue + '</td>');
            startDate = startDate.addDays(1);
            c++;
        }
        html += '</tr>';
        if (c > 34) { break; }
    }
    options.calendar = html;
    options.monthName = (_monthNames[m - 1] + ' ' + y);

    options.type = 'calendar';
    options.value = options.date;
    options.dataType = 'date';

    if (options.navigation) {

        options.prevButton = `<div id="${options.id}_btn__prev" class="jx-calendar-nav jx-calendar-nav-prev">${options.navigation.prevText || ''}</div>`;


        // if (theDate.addDays(31) < Date.today()) {
        options.nextButton = `<div id="${options.id}_btn__next" class="jx-calendar-nav jx-calendar-nav-next">${options.navigation.nextText || ''}</div>`;
        // }
    }

    var hTmpl = _h.compile(_fs.readFileSync(_path.join(__dirname, 'calendar.hbs'), 'utf8'));
    options.content = hTmpl(options);
    return _controlBase.render(options);
}


module.exports = {
    render: _render
}