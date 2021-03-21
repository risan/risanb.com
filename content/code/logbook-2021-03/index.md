---
title: "Logbook: 2021 March"
date: 2021-03-21T17:19:56+07:00
categories: [log]
tags: [logbook]
---
### DataTables: Dynamic Ajax Parameter

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

### Datatables: Sorting for Custom Rendered Column

I was working with the old JavaScript codebase that uses the [DataTables](https://datatables.net/reference/) plugin. It fetches the data from an API and displays them in a table. The user can sort the columns on this table.

The API has a `month` field with an integer type. But, we have to display this field as a proper month name (i.e. `1` for January, `2` for February, and so on). Luckily, we can use the [`columns.render`](https://datatables.net/reference/option/columns.render) option on the DataTables to customize the rendered output.

```js
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

$('#table').dataTable({
  ajax: {
    url: 'https://examples.com/api/foo',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${process.env.API_TOKEN}`,
    },
  },
  columns: [
    {
      data: 'month',
      render: data => MONTHS[data - 1],
    },
    // ...
  ],
});
```

But, there was an issue with the sorting. When the user sorts the table by the month field, it was sorted alphabetically. So April goes first, instead of January. To solve this issue, we can check for the second parameter named `type`.

```js
$el.table.dataTable({
  // Omitted...
  columns: [
    {
      data: 'month',
      render(data, type) {
        if (type === 'sort' || type === 'type') {
          return data;
        }

        return MONTHS[data - 1];
      },
    },
    // ...
  ],
});
```

This way, DataTables will still use the integer value of the month field for sorting or type detection.