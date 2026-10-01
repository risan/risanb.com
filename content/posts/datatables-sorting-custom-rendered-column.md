---
title: "Datatables: Sorting for Custom Rendered Column"
date: 2021-03-21T17:20:06+07:00
categories: [snippet]
tags: [javascript]
images: [/img/javascript.png]
---
I was working with the old JavaScript codebase that uses the [DataTables](https://datatables.net/reference/) plugin. It fetches the data from an API and displays them in a table. The user can sort the columns on this table.

The API has a `month` field with an integer type. But, we have to display this field as a proper month name (i.e. `1` for January, `2` for February, and so on). Luckily, we can use the [`columns.render`](https://datatables.net/reference/option/columns.render) option on the DataTables to customize the rendered output.

```js
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

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