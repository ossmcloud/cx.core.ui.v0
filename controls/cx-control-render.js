'use strict'

const _declarations = require('../cx-core-ui-declarations');
const _table = require('./common/table/table');
const _commonInputs = require('./common/input');
const _controlGroup = require('./common/controlGroup/controlGroup');


function _renderTableFilters(options) {
    if (!options.filters) { return ''; }
    if (!options.query) { options.query = {}; }

    // @PAGING:
    if (options.paging) {
        var pageFilter = { label: 'page', fieldName: 'page', type: _declarations.ControlType.NUMERIC, width: '50px', inline: true, inputStyle: 'text-align: center' }
        pageFilter.value = options.query.page || 1;
        options.pagingFilter = _renderControl(pageFilter);
    }

  
    var filtersHtml = '';
    for (var fx = 0; fx < options.filters.length; fx++) {
        var filter = options.filters[fx];
        filter.inline = true;
        filter.value = options.query[filter.fieldName] || filter.value;
        filtersHtml += _renderControl(filter);
    }
    return filtersHtml;
}

function _renderControl(options, objects) {
    var controlArray = options.controls || options.fields;
    if (controlArray) {
        var renderedControls = '';
        if (!options.columnCount) { options.columnCount = 1; }
        for (var colNo = 1; colNo <= (options.columnCount);  colNo++) {
            renderedControls += '<div class="jx-control-group-column"'
            if (options.style) {
                renderedControls += ' style="' + options.style + '"';
            } else {
                if (options.columnCount == 1) { renderedControls += ' style="display: table-row"'; }
            }
            renderedControls += '>';
            //
            for (var cx = 0; cx < controlArray.length; cx++) {
                if (!controlArray[cx]) { continue; }
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
        //
        options.controlsHtml = renderedControls;
        options.type = _declarations.ControlType.GROUP;
        return _controlGroup.render(options, objects);
    } else {
        // render filters if any
        if (Array.isArray(options.filters)) { options.filters = _renderTableFilters(options); }
     

        // render control
        return _commonInputs.render(options, objects);
    }
}


module.exports = {
    CtrlType: _declarations.ControlType,
    render: _renderControl,
}