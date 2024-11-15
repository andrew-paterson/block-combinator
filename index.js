function groupByName(groups, name) {
  return groups.find((item) => item.block === name);
}

function allItemValues(groups) {
  return groups.reduce((acc, group) => {
    acc = acc.concat(group.items.map((item) => item.value).filter((itemValue) => itemValue.length));
    return acc;
  }, []);
}

function getAllOtherItemValues(groups, thisGroupItems) {
  return outersectArray(allItemValues(groups), thisGroupItems);
}

function combinations(arrays) {
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

function expandItemList(list, groups) {
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

function intersectArray(array1, array2) {
  return array1.filter((item) => array2.includes(item));
}

function arraysMatchExactly(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  const sortedArray1 = array1.slice().sort();
  const sortedArray2 = array2.slice().sort();

  for (let i = 0; i < sortedArray1.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }
  return true;
}

function expandIgnored(entity, groups, thisGroupItems, ignored = [], string, callerLevel) {
  ignored = ignored.concat(simpleCombinations(string, entity.neverWithAnyOf, groups));

  const allCombinationsWithString = combinations(groups.map((item) => item.items))
    .filter((combination) => combination.includes(string))
    .map((array) => array.filter((item) => item.length));

  const onlyWithExactCombinationExpanded = expandItemList(entity.onlyWithExactCombination, groups);
  if (onlyWithExactCombinationExpanded.length) {
    ignored = ignored.concat(allCombinationsWithString.filter((combination) => !arraysMatchExactly(combination, [string, ...onlyWithExactCombinationExpanded])).map((combination) => [...combination, { matchlength: true }]));
  }
  const onlyWithAnyOfExpanded = expandItemList(entity.onlyWithAnyOf, groups);
  if (onlyWithAnyOfExpanded.length) {
    ignored = ignored.concat(allCombinationsWithString.filter((combination) => !intersectArray(combination, onlyWithAnyOfExpanded).length).map((combination) => [...combination, { matchlength: true }]));
  }
  return ignored;
}

function generateIgnoreArrays(groups) {
  let ignored = [];
  groups.forEach((group) => {
    const thisGroupItems = groupItems(group.block, groups);
    thisGroupItems.forEach((thisGroupItem) => {
      ignored = expandIgnored(group, groups, thisGroupItems, ignored, thisGroupItem, 'group');
    });
    group.items.forEach((item) => {
      ignored = expandIgnored(item, groups, thisGroupItems, ignored, item.value, 'item');
    });
  });
  return ignored;
}

module.exports = function (rawData, opts = {}) {
  const groups = parseIncoming(rawData);
  const ignoreArrays = generateIgnoreArrays(groups);
  return combinations(groups.map((item) => item.items))
    .map((item) => item.filter((part) => part.length))
    .filter((item) => {
      if (item.length < (opts.minLength || 2)) {
        return false;
      }
      return !ignoreArrays.some((ignoreArray) => {
        let matchlength = false;
        if (ignoreArray.find((item) => item && typeof item === 'object')) {
          matchlength = true;
        }
        const ignoreArrayStrings = [...ignoreArray].filter((item) => typeof item === 'string');
        if (matchlength) {
          return (
            ignoreArrayStrings.every((ignoreItem) => {
              return item.includes(ignoreItem);
            }) && item.length === ignoreArrayStrings.length
          );
        } else {
          return ignoreArrayStrings.every((ignoreItem) => {
            return item.includes(ignoreItem);
          });
        }
      });
    });
};
