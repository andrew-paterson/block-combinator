function generateIgnoreSets(data) {
  const ignoreSets = [];
  data.forEach((dataItem) => {
    if (dataItem.ignore) {
      dataItem.items.forEach((item) => {
        item.ignore = item.ignore || [];
        item.ignore = item.ignore.concat(dataItem.ignore);
      });
    }
    dataItem.items.forEach((item) => {
      if (item.ignore) {
        console.log(item);
        const ignoreSet = [{ items: [{ value: item.value }] }];
        item.ignore.forEach((ignoreItem) => {
          if (!ignoreItem.items) {
            ignoreItem.items = data.find((item) => item.block === ignoreItem.block).items;
          }
          ignoreItem.items = ignoreItem.items.map((i) => {
            if (typeof i === 'string') {
              return { value: i };
            } else {
              return i;
            }
          });
          ignoreItem.items.push({ value: '' });
          ignoreSet.push(ignoreItem);
        });
        ignoreSets.push(ignoreSet);
      }
    });
  });
  return ignoreSets;
}

function combinations(data) {
  const result = [];

  function combine(prefix, arrays) {
    if (arrays.length === 0) {
      result.push(prefix);
      return;
    }

    const firstArray = arrays[0];
    const remainingArrays = arrays.slice(1);

    for (const item of firstArray) {
      combine([...prefix, item.value], remainingArrays);
    }
  }

  const arrays = data.map((item) => item.items);
  combine([], arrays);

  return result;
}
function parseIncoming(rawData) {
  return rawData.map((item) => {
    if (!item.required) {
      item.items.push('');
    }
    item.items = item.items.map((i) => {
      if (typeof i === 'string') {
        return { value: i };
      } else {
        return i;
      }
    });

    return item;
  });
}
module.exports = function (rawData, opts = {}) {
  const data = parseIncoming(rawData);
  const ignoreSets = generateIgnoreSets(data);
  const ignoreArrays = ignoreSets
    .reduce((acc, ignoreSet) => {
      return acc.concat(combinations(ignoreSet));
    }, [])
    .map((item) => item.filter((item) => item.length))
    .filter((item) => item.length > 1);

  return combinations(data)
    .map((item) => item.filter((part) => part.length))
    .filter((item) => {
      if (item.length < (opts.minLength || 2)) {
        return false;
      }
      return !ignoreArrays.some((ignoreArray) => {
        return ignoreArray.every((ignoreItem) => {
          return item.includes(ignoreItem);
        });
      });
    });
};
