'use strict'

//const _table = require('./controls/table');
const _table = require('./controls/table/table');
const _form = require('./controls/form');
const _formEx = require('./controls/form/form');
const _dropDown = require('./controls/dropDown/dropDown');
const _input = require('./controls/base/inputBase');
const _inputCommon = require('./controls/common/commonInput');
const _declarations = require('./cx-core-ui-declarations');
const _calendar = require('./controls/calendar/calendar');

module.exports = {
    controls: {

        Type: _declarations.InputType,

        input: function (options) {
            if (!options.width) { options.width = 'auto'; }
            if (options.inline === true) { options.inline = 'form-input-inline'; }
            if (!options.id) { options.id = options.name; }

            if (options.inputType == _declarations.InputType.SELECT) {
                options.inputControl = _dropDown.render(options);
            } else {
                options.inputControl = _inputCommon.render(options);
            }
            
            return _input.render(options);
        },
        text: function (options) {
            options.inputType = _declarations.InputType.TEXT;
            return this.input(options);  
        },
        date: function (options) {
            options.inputType = _declarations.InputType.DATE;
            return this.input(options);
        },
        dropDown: function (options) {
           // return _dropDown.render(options);
            options.inputType = _declarations.InputType.SELECT;
            return this.input(options);
        },




        calendar: function (options) {
            if (!options) { options = {}; }
            return _calendar.render(options);
        },
        // table: function (objects, options) {
        //     return _table.render(objects, options);
        // },
        table: function (objects, options) {
            return _table.render(objects, options);
        },
        

        form: function (record, options) {
            return _form.render(record, options);
        },
        formEx: function (record, options) {
            return _formEx.render(this, record, options);
        }
    }
}