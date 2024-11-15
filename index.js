function groupByName(groups, name) {
  return groups.find((item) => item.block === name);
}

function allItemValues(groups) {
  return groups.reduce((acc, group) => {
    acc = acc.concat(group.items.map((item) => item.value).filter((itemValue) => itemValue.length));
    return acc;
  }, []);
}

function allOtherItemValues(groups, thisGroupItems) {
  return outersectArray(allItemValues(groups), thisGroupItems);
}

function combinations(groups) {
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
  const arrays = groups.map((item) => item.items);
  combine([], arrays);
  return result;
}

function parseIncoming(rawData) {
  return rawData.map((group) => {
    if (!group.required) {
      group.items.push('');
    }
    group.items = group.items.map((i) => {
      if (typeof i === 'string') {
        return { value: i };
      } else {
        return i;
      }
    });
    return group;
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

function expandIgnored(entity, groups, thisGroupItems) {
  const expandedIncludes = expandIncludes(entity.onlyWithExactCombination, groups);
  if (expandedIncludes.length) {
    entity.neverWithAnyOf = (entity.neverWithAnyOf || []).concat(outersectArray(allOtherItemValues(groups, thisGroupItems), expandedIncludes));
  }
}

function generateIgnoreArrays(groups) {
  let arrays = [];
  groups.forEach((group) => {
    const thisGroupItems = groupItems(group.block, groups);
    expandIgnored(group, groups, thisGroupItems);
    thisGroupItems.forEach((thisGroupItem) => {
      arrays = arrays.concat(simpleCombinations(thisGroupItem, group.neverWithAnyOf, groups));
    });
    group.items.forEach((item) => {
      expandIgnored(item, groups, thisGroupItems);
      arrays = arrays.concat(simpleCombinations(item.value, item.neverWithAnyOf, groups));
    });
  });
  return arrays;
}

module.exports = function (rawData, opts = {}) {
  const groups = parseIncoming(rawData);
  const ignoreArrays = generateIgnoreArrays(groups);
  return combinations(groups)
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
