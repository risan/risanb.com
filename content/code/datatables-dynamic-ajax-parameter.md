---
title: "DataTables: Dynamic Ajax Parameter"
date: 2021-03-21T17:19:56+07:00
categories: [snippet]
tags: [javascript]
images: [/img/javascript.png]
---
On DataTables, we can pass custom query parameters for the API through [`ajax.data`](https://datatables.net/reference/option/ajax.data) option.

```js
$('#table').dataTable({
  ajax: {
    url: 'https://examples.com/api/users',
    data: {
      paid_plan: true,
    },
  },
  // Omitted...
});
```

If these custom query parameters are dynamic like retrieved from some input elements. We have to pass these parameters as a function instead of a plain object. This way, when the user updates these input elements; we can reload the DataTable, and it will pick up the updated query parameters.

```js
// Reload DataTable on input change.
$('input[name=paid_plan_only]').on('change', () => {
  $('#table').DataTable().ajax.reload();
});

$('#table').dataTable({
  ajax: {
    url: 'https://examples.com/api/users',
    data() {
      return {
        paid_plan: $('input[name=paid_plan_only]').is(':checked'),
      };
    },
  },
  // Omitted...
});
```