'use strict';

// NOTE: this MUST match:
//  ..\cx.app.v0\public\javascript\jx-api\jx-declarations.js(CX_CONTROL.TYPE)
//  ..\cx.sdk.v0\cx.data.client.v0\cx-client-declarations.js(RENDER.CTRL_TYPE)
const _controlType = {
    TEXT: 'inputText',
    TEXT_AREA: 'inputTextArea',
    DATE: 'inputDate',
    NUMERIC: 'inputNumeric',
    CHECK: 'inputCheckBox',
    SELECT: 'inputSelect',
    DROPDOWN: 'inputDropDown',
    TABLE: 'table',
    FORM: 'form',
    GROUP: 'controlGroup',
    HIDDEN: 'inputHidden',
    HTML: 'html',
    PASSWORD: 'password',
}

module.exports = {
    ControlType: _controlType,
}