'use strict'

const _declarations = require('./cx-core-ui-declarations');
const _form = require('./form/form');
const _controls = require('./controls/cx-control-render');

// TODO: CX-UI: Refactor
const _calendar = require('./controls_old/calendar/calendar');


// HANDLEBARS CUSTOM HELPERS
// compares a value with the root value
const _h = require('handlebars');
_h.registerHelper('if_val', function (arg1, options) {
    //if (options.data) { data = _h.createFrame(options.data); }
    if (arg1 == null || arg1 == undefined) { arg1 = ''; }
    var rootValue = options.data.root.value;
    if (rootValue == null || rootValue == undefined) { rootValue = ''; }
    return (arg1.toString() == rootValue.toString()) ? options.fn(this) : options.inverse(this);
});

module.exports = {
    CtrlType: _declarations.ControlType,
    // render control
    render: _controls.render,
    // render form
    form: function (options, record) {
        return _form.render(options, record);
    },
    calendar: function (options) {
        if (!options) { options = {}; }
        return _calendar.render(options);
    },
}