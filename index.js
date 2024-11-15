function groupByName(data, name) {
  return data.find((item) => item.block === name);
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

function groupItems(name, groups) {
  const group = groupByName(groups, name);
  if (group) {
    return group.items.map((item) => item.value).filter((itemValue) => itemValue.length);
  }
  return [name];
}

function generateIgnoreArrays(groups) {
  let arrays = [];
  groups.forEach((group) => {
    const thisGroupItems = groupItems(group.block, groups);
    if (group.ignore) {
      group.ignore.forEach((string) => {
        const otherGroupItems = groupItems(string, groups);
        thisGroupItems.forEach((thisGroupItem) => {
          otherGroupItems.forEach((otherGroupItem) => {
            arrays.push([thisGroupItem, otherGroupItem]);
          });
        });
      });
    }
    group.items.forEach((item) => {
      if (item.ignore) {
        item.ignore.forEach((string) => {
          const otherGroupItems = groupItems(string, groups);
          otherGroupItems.forEach((otherGroupItem) => {
            arrays.push([item.value, otherGroupItem]);
          });
        });
      }
    });
  });
  return arrays;
}

module.exports = function (rawData, opts = {}) {
  const data = parseIncoming(rawData);
  const ignoreArrays = generateIgnoreArrays(data);
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
