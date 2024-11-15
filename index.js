function groupByName(data, name) {
  return data.find((item) => item.block === name);
}

function allItemValues(groups) {
  return groups.reduce((acc, group) => {
    acc = acc.concat(group.items.map((item) => item.value).filter((itemValue) => itemValue.length));
    return acc;
  }, []);
}

function allOtherItemValues(groups, thisgroupItems) {
  return outersectArray(allItemValues(groups), thisgroupItems);
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

function simpleCombinations(itemValue, list = [], groups) {
  let arrays = [];
  list.forEach((string) => {
    const otherGroupItems = groupItems(string, groups);
    otherGroupItems.forEach((otherGroupItem) => {
      arrays.push([itemValue, otherGroupItem]);
    });
  });
  return arrays;
}

function expandIncludes(list, groups) {
  let arr = [];
  if (!list) {
    return [];
  }
  list.forEach((string) => {
    arr = arr.concat(groupItems(string, groups));
  });
  return arr;
}

function outersectArray(inclusionArray, exclusionArray) {
  return inclusionArray.filter((item) => !exclusionArray.includes(item));
}

function generateIgnoreArrays(groups) {
  let arrays = [];
  groups.forEach((group) => {
    const thisGroupItems = groupItems(group.block, groups);
    const expandedIncludes = expandIncludes(group.include, groups);
    if (expandedIncludes.length) {
      group.ignore = (group.ignore || []).concat(outersectArray(allOtherItemValues(groups, thisGroupItems), expandedIncludes));
    }
    thisGroupItems.forEach((thisGroupItem) => {
      arrays = arrays.concat(simpleCombinations(thisGroupItem, group.ignore, groups));
    });
    group.items.forEach((item) => {
      const expandedIncludes = expandIncludes(item.include, groups);
      if (expandedIncludes.length) {
        item.ignore = (item.ignore || []).concat(outersectArray(allOtherItemValues(groups, thisGroupItems), expandedIncludes));
      }
      arrays = arrays.concat(simpleCombinations(item.value, item.ignore, groups));
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
