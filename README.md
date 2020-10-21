# cx.core.ui (general purpose HTML UI library)
General purpose library for basic HTML UIs for Connections cloud.
<br />
Basically this is a very simple rendering module.
<br />
Hopefully we'll replace it with 3rd party UI SDK

---

## basic use
```
const _core_ui = require('cx-core-ui');
// build a drop down
_core_ui.dropDown(options);

// builds an HTML table
_core_ui.table(objects, options)

// builds an HTML form
_core_ui.form(record, options)

```
