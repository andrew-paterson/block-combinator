const blockCombinator = require('./index');
const chalk = require('chalk');
const testSchemas = [
  {
    title: 'Basic usage',
    skip: false,
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
    title: 'Min length',
    skip: false,
    testFunction() {
      return blockCombinator(
        [
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
        ],
        {
          minLength: 3,
        }
      );
    },
    expectation: [
      ['red', '1', 'circle'],
      ['red', '1', 'square'],
      ['red', '2', 'circle'],
      ['red', '2', 'square'],
      ['orange', '1', 'circle'],
      ['orange', '1', 'square'],
      ['orange', '2', 'circle'],
      ['orange', '2', 'square'],
    ],
  },
  {
    title: 'Required blocks',
    skip: false,
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
    title: 'neverWithAnyOf at block level',
    skip: false,
    testFunction() {
      return blockCombinator([
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
    title: 'neverWithAnyOf at the item level',
    skip: false,
    testFunction() {
      return blockCombinator([
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
    title: 'onlyWithExactCombination at the block level',
    skip: false,
    testFunction() {
      return blockCombinator([
        {
          block: 'colours',
          onlyWithExactCombination: ['1', 'circle'],
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
      ['orange', '1', 'circle'],
      ['1', 'circle'],
      ['1', 'square'],
      ['2', 'circle'],
      ['2', 'square'],
    ],
  },
  {
    title: 'onlyWithExactCombination at the item level',
    skip: false,
    testFunction() {
      return blockCombinator([
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
      ['1', 'circle'],
      ['1', 'square'],
      ['2', 'circle'],
      ['2', 'square'],
    ],
  },
  {
    title: 'OnlwWithAnyOf at the block level',
    skip: false,
    testFunction() {
      return blockCombinator([
        {
          block: 'colours',
          onlyWithAnyOf: ['numbers', 'circle'],
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
      ['orange', '1', 'circle'],
      ['orange', '1', 'square'],
      ['orange', '1'],
      ['orange', '2', 'circle'],
      ['orange', '2', 'square'],
      ['orange', '2'],
      ['orange', 'circle'],
      ['1', 'circle'],
      ['1', 'square'],
      ['2', 'circle'],
      ['2', 'square'],
    ],
    found: [
      ['red', '1', 'circle'],
      ['red', '1'],
      ['red', '2', 'circle'],
      ['red', '2'],
      ['red', 'circle'],
      ['orange', '1', 'circle'],
      ['orange', '1'],
      ['orange', '2', 'circle'],
      ['orange', '2'],
      ['orange', 'circle'],
      ['1', 'circle'],
      ['1', 'square'],
      ['2', 'circle'],
      ['2', 'square'],
    ],
  },
];

testSchemas.forEach((testSchema) => {
  if (testSchema.skip) {
    return;
  }
  const result = JSON.stringify(testSchema.testFunction());
  const expectation = JSON.stringify(testSchema.expectation);
  if (result !== expectation) {
    console.log(chalk.red(`Test failed: ${testSchema.title}`));
    console.log(`Expected: ${chalk.green(expectation)}`);
    console.log(`Received: ${chalk.red(result)}`);
  } else {
    console.log(chalk.green(`Test passed: ${testSchema.title}`));
  }
});
