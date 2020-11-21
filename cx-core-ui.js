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
    return (arg1 == options.data.root.value) ? options.fn(this) : options.inverse(this);
});


module.exports = {
    controls: {

        Type: _declarations.InputType,
        CtrlType: _declarations.ControlType,    

        render: function (options, objects) {
            //if (!options.width) { options.width = 'auto'; }
            if (options.inline === true) { options.cssOuterContainer = 'jx-control-inline'; }
            if (!options.id) { options.id = options.name; }
            if (!options.name) { options.name = options.id; }
            // TODO: CX-UI: detect from option which control we need and use relevant function
            return _commonInputs.render(options, objects);
        },

        // table: function (objects, options) {
        //     options.type = _declarations.ControlType.TABLE;
        //     return _table.render(objects, options);
        // },


        // input: function (options) {
        //     if (!options.width) { options.width = 'auto'; }
        //     if (options.inline === true) { options.inline = 'form-input-inline'; }
        //     if (!options.id) { options.id = options.name; }
        //     if (!options.name) { options.name = options.id; }

        //     if (options.inputType == _declarations.InputType.SELECT) {
        //         options.inputControl = _dropDown.render(options);
        //     } else {
        //         options.inputControl = _inputCommon.render(options);
        //     }
            
        //     return _input.render(options);
        // },
        // text: function (options) {
        //     options.inputType = _declarations.InputType.TEXT;
        //     return this.input(options);  
        // },
        // date: function (options) {
        //     options.inputType = _declarations.InputType.DATE;
        //     return this.input(options);
        // },
        // dropDown: function (options) {
        //     options.inputType = _declarations.InputType.SELECT;
        //     return this.input(options);
        // },




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