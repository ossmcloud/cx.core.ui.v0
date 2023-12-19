'use strict'



function _renderJson(object, options) {
    var html = '<div class="jx-json-object-container">';
    try {
        if (object == undefined) { throw new Error('Argument: Object cannot be undefined') };

        if (!options) { options = {}; }

        if (object == null) {
            html += 'no object';
        } else {
            html += `
                <table class="jx-json-property">
                    <tbody>` ;

            if (object.constructor.name == 'String') {
                object = JSON.parse(object);
            }

            for (var k in object) {
                var value = object[k];

                if (value.constructor.name == 'Object') {
                    value = _renderJson(value, options);
                }

                html += `<tr>
                    <td class="jx-json-property-name">${k}</td>
                    <td class="jx-json-property-value">${value}</td>
                </tr>` ;
            }

            html += `
                        </tbody>
                    </table>` ;

        }

    } catch (error) {
        html += `<div class="jx-json-object-error">ERROR: ${error.message}</div>`;
    }
    html += '</div>';
    return html;
}


module.exports = {
    render: _renderJson,
}