# Block combinator

Creates a series of arrays of every possible combination of the values of items in separate blocks of data.

## Basic usage

```javascript
const blockCombinator = require('./block-combinator');

blockCombinator([
  {
    block: 'colours',
    items: ['red', 'orange'],
  },
  {
    block: 'numbers',
    items: ['1', '2'],
  },
  {
    block: 'shapes',
    items: ['circle', 'square'],
  },
]);
// RESULT
[
  ['red', '1', 'circle'],
  ['red', '1', 'square'],
  ['red', '1'],
  ['red', '2', 'circle'],
  ['red', '2', 'square'],
  ['red', '2'],
  ['red', 'circle'],
  ['red', 'square'],
  ['orange', '1', 'circle'],
  ['orange', '1', 'square'],
  ['orange', '1'],
  ['orange', '2', 'circle'],
  ['orange', '2', 'square'],
  ['orange', '2'],
  ['orange', 'circle'],
  ['orange', 'square'],
  ['1', 'circle'],
  ['1', 'square'],
  ['2', 'circle'],
  ['2', 'square'],
];
```

## Required blocks

Setting `required: true` on a block will ensure that every time in the results has a one item from that block.

```javascript
const data = [
  {
    block: 'colours',
    items: ['red', 'orange'],
    required: true,
  },
  {
    block: 'numbers',
    items: ['1', '2'],
  },
  {
    block: 'shapes',
    items: ['circle', 'square'],
  },
];

blockCombinator(data);
// RESULT
[
  ['red', '1', 'circle'],
  ['red', '1', 'square'],
  ['red', '1'],
  ['red', '2', 'circle'],
  ['red', '2', 'square'],
  ['red', '2'],
  ['red', 'circle'],
  ['red', 'square'],
  ['orange', '1', 'circle'],
  ['orange', '1', 'square'],
  ['orange', '1'],
  ['orange', '2', 'circle'],
  ['orange', '2', 'square'],
  ['orange', '2'],
  ['orange', 'circle'],
  ['orange', 'square'],
];
```

## Ignoring blocks and items

A block can ignore other blocks entirely, ot items within other blocks.
An individual item can also ignore other blocks entirely, ot items within other blocks.

Note that members of a blocks `items` array can be strings, or an object where `value` is a string. This allows us to add `ignore` on the item.

Note that ignore rules will only affect blocks or itemd from blocks that come after the current block.

```javascript
const data = [
  {
    block: 'colours',
    items: ['red', 'orange'],
    ignore: [
      {
        block: 'numbers',
        items: ['1'],
      },
    ],
  },
  {
    block: 'numbers',
    items: ['1', { value: '2', ignore: [{ block: 'shapes' }] }],
  },
  {
    block: 'shapes',
    items: ['circle', 'square'],
  },
];
blockCombinator(data);
// RESULT
[
  ['red', '2'],
  ['red', 'circle'],
  ['red', 'square'],
  ['orange', '2'],
  ['orange', 'circle'],
  ['orange', 'square'],
  ['1', 'circle'],
  ['1', 'square'],
];
```
