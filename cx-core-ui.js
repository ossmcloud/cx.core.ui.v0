'use strict'

const _table = require('./controls/table');
const _tableEx = require('./controls/table/table');
const _form = require('./controls/form');
const _dropDown = require('./controls/dropDown/dropDown');


module.exports = {
    controls: {
        dropDown: function (options) {
            return _dropDown.render(options);
        },
        table: function (objects, options) {
            return _table.render(objects, options);
        },
        tableEx: function (objects, options) {
            return _tableEx.render(objects, options);
        },

        form: function (record, options) {
            return _form.render(record, options);
        }
    }
}