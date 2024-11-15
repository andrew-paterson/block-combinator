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

## neverWithAnyOf at block level

An array of strings can be passed to the `neverWithAnyOf` prop.

These strings can either be the names of blocks, or the value of items within a block.

For blocks named in the `neverWithAnyOf` array, the final set of combinations will exclude those combinations which have any items from the current block along with any items from the ignored block.

For item values named in the `neverWithAnyOf` array the final set of combinations will exclude those combinations which have any items from the current block along the item value in the ignored item value.

```javascript
const data = [
  {
    block: 'colours',
    items: ['red', 'orange'],
    neverWithAnyOf: ['numbers', 'square'],
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
  ['red', 'circle'],
  ['orange', 'circle'],
  ['1', 'circle'],
  ['1', 'square'],
  ['2', 'circle'],
  ['2', 'square'],
];
```

## neverWithAnyOf at the item level

Note that members of a blocks `items` array can be strings, or an object where `value` is a string. This allows us to add an `neverWithAnyOf` array to the item.

An array of strings can be passed to the `neverWithAnyOf` prop.

These strings can either be the names of blocks, or the value of items within a block.

For blocks named in the `neverWithAnyOf` array, the final set of combinations will exclude the value of the curent item along with any items from the ignored block.

For item values named in the `neverWithAnyOf` array the final set of combinations will exclude the value of the curent item along the item value in the ignored item value.

```javascript
const data = [
  {
    block: 'colours',
    items: ['red', { value: 'orange', neverWithAnyOf: ['shapes', '1'] }],
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
  ['orange', '2'],
  ['1', 'circle'],
  ['1', 'square'],
  ['2', 'circle'],
  ['2', 'square'],
];
```

## onlyWithExactCombination at the item level

```javascript
const data = [
  {
    block: 'colours',
    items: ['red', { value: 'orange', onlyWithExactCombination: ['1', 'circle'] }],
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
  ['orange', '1'],
  ['orange', 'circle'],
  ['1', 'circle'],
  ['1', 'square'],
  ['2', 'circle'],
  ['2', 'square'],
];
```
