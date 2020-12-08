'use strict';

const _inputType = {
    TEXT: 'textInput',
    DATE: 'dateInput',
    SELECT: 'dropDownInput'
}

// NOTE: this MUST match:
//  ..\cx.app.v0\public\javascript\jx-api\jx-declarations.js(CX_CONTROL.TYPE)
//  ..\cx.sdk.v0\cx.data.client.v0\cx-client-declarations.js(RENDER.CTRL_TYPE)

const _controlType = {
    TEXT: 'inputText',
    DATE: 'inputDate',
    // DATE_TIME: 'inputDateTime',
    NUMERIC: 'inputNumeric',
    CHECK: 'inputCheckBox',
    SELECT: 'inputSelect',
    DROPDOWN: 'inputDropDown',
    TABLE: 'table',
    FORM: 'form',
    GROUP: 'controlGroup'
}

module.exports = {
    InputType: _inputType,
    ControlType: _controlType,
}