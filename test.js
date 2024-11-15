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
    items: ['red', { value: 'orange', ignore: ['shapes', '1'] }],
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
