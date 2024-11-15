const blockCombinator = require('./index');
const chalk = require('chalk');
const testSchemas = [
  {
    title: 'Basic usage',
    testFunction() {
      return blockCombinator([
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
    },
    expectation: [
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
    ],
  },
  {
    title: 'Required blocks',
    testFunction() {
      return blockCombinator([
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
      ]);
    },
    expectation: [
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
    ],
  },
  {
    title: 'Ignoring at block level',
    testFunction() {
      return blockCombinator([
        {
          block: 'colours',
          items: ['red', 'orange'],
          ignore: ['numbers', 'square'],
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
    },
    expectation: [
      ['red', 'circle'],
      ['orange', 'circle'],
      ['1', 'circle'],
      ['1', 'square'],
      ['2', 'circle'],
      ['2', 'square'],
    ],
  },
  {
    title: 'Ignoring at the item level',
    testFunction() {
      return blockCombinator([
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
      ]);
    },
    expectation: [
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
    ],
  },
  {
    title: 'Including at the item level',
    testFunction() {
      return blockCombinator([
        {
          block: 'colours',
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
      ]);
    },
    expectation: [
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
    ],
  },
];

testSchemas.forEach((testSchema) => {
  const result = testSchema.testFunction();
  if (JSON.stringify(result) !== JSON.stringify(testSchema.expectation)) {
    console.log(chalk.red(`Test failed: ${testSchema.title}`));
    console.log(`Expected: ${testSchema.expectation}`);
    console.log(`Received: ${result}`);
  } else {
    console.log(chalk.green(`Test passed: ${testSchema.title}`));
  }
});
