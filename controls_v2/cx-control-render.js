'use strict'

const _declarations = require('../cx-core-ui-declarations');
const _table = require('./common/table/table');
const _commonInputs = require('./common/input');
const _controlGroup = require('./common/controlGroup/controlGroup');


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
    if (options.inline === true) { options.cssOuterContainer = 'jx-control-inline'; }

    if (options.controls || options.fields) {
        var renderedControls = '';
        var controlArray = options.controls || options.fields;
        
        if (!options.columnCount) { options.columnCount = 1; }
        for (var colNo = 1; colNo <= options.columnCount; colNo++) {
            renderedControls += '<div class="jx-control-group-column"'
            if (options.columnCount == 1) {
                renderedControls += ' style="display: table-row"';
            }
            renderedControls += '>';
            
            for (var cx = 0; cx < controlArray.length; cx++) {
                if (!controlArray[cx].column) { controlArray[cx].column = 1; }
                if (controlArray[cx].column == colNo) {
                    if (controlArray[cx].html) {
                        renderedControls += html;   
                    } else {
                        if (controlArray[cx].readOnly == undefined) { controlArray[cx].readOnly = options.readOnly; }
                        if (controlArray[cx].disabled == undefined) { controlArray[cx].disabled = options.disabled; }
                        renderedControls += _renderControl(controlArray[cx], objects);
                    }
                }
            }
            renderedControls += '</div>';
        }
        
        options.controlsHtml = renderedControls;
        options.type = _declarations.ControlType.GROUP;
        return _controlGroup.render(options, objects);

    } else {
        //if (!options.width) { options.width = 'auto'; }

        if (!options.id) { options.id = options.name; }
        if (!options.name) { options.name = options.id; }
        // ender filters if any
        if (Array.isArray(options.filters)) { options.filters = _renderTableFilters(options); }

        // TODO: CX-UI: detect from option which control we need and use relevant function
        return _commonInputs.render(options, objects);
    }
}


module.exports = {
    render: _renderControl,
}