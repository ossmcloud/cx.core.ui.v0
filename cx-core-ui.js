'use strict'


//const _table = require('./controls/table/table');
//const _form = require('./controls/.trash/form');
//const _dropDown = require('./controls/dropDown/dropDown');
//const _input = require('./controls/base/inputBase');
//const _inputCommon = require('./controls/common/commonInput');
// TODO: CX-UI: Refactor
const _formEx = require('./controls/form/form');
const _declarations = require('./cx-core-ui-declarations');
const _calendar = require('./controls/calendar/calendar');


// TODO: CX-UI: after refactoring all reverse folder name controls_v2
const _table = require('./controls_v2/common/table/table');
const _commonInputs = require('./controls_v2/common/input');

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


function _renderTableFilters(options) {
    if (!options.filters) { return ''; }
    if (!options.query) { options.query = {}; }
    var filtersHtml = '';
    for (var fx = 0; fx < options.filters.length; fx++) {
        var filter = options.filters[fx];
        filter.inline = true;
        filter.value = options.query[filter.fieldName];
        filtersHtml += _renderControl(filter);
    }
    return filtersHtml;
}

function _renderControl(options, objects) {
    //if (!options.width) { options.width = 'auto'; }
    if (options.inline === true) { options.cssOuterContainer = 'jx-control-inline'; }
    if (!options.id) { options.id = options.name; }
    if (!options.name) { options.name = options.id; }
    // ender filters if any
    if (Array.isArray(options.filters)) { options.filters = _renderTableFilters(options); }
    // TODO: CX-UI: detect from option which control we need and use relevant function
    return _commonInputs.render(options, objects);
}


module.exports = {
    controls: {
        Type: _declarations.InputType,
        CtrlType: _declarations.ControlType,    
        //
        render: _renderControl,


        // TODO: move to controls v2
        calendar: function (options) {
            if (!options) { options = {}; }
            return _calendar.render(options);
        },
        form: function (record, options) {
            return _form.render(record, options);
        },
        formEx: function (record, options) {
            return _formEx.render(this, record, options);
        }
    }
}