const blockCombinator = require('./index');

// const data = [
//   {
//     block: 'colours',
//     items: ['red', { value: 'orange' }, 'blue'],
//     required: true,
//   },
//   {
//     block: 'numbers',
//     items: ['1', '2'],
//   },
//   {
//     block: 'shapes',
//     items: ['circle', 'square'],
//   },
// ];
const data = [
  {
    block: 'colours',
    // include: ['1', 'circle'],
    // items: ['red', { value: 'orange', ignozre: ['shapes', '1'] }],
    items: ['red', { value: 'orange', include: ['1', 'circle'] }],
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

console.log(blockCombinator(data, { minLength: 2 }));
