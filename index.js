const fs = require('fs');

function groupByName(groups, name) {
  return groups.find((item) => item.block === name);
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

let allCombinations;

function filterNeverWithAnyOfItem(arrays, entity, groups, filterType) {
  if (entity[filterType]) {
    const expandedFiltersList = expandItemList(entity[filterType], groups);
    const entityName = entity.block || entity.value;
    const entityItems = groupItems(entityName, groups);
    entityItems.forEach((item) => {
      arrays = arrays.filter((array) => {
        if (!array.includes(item)) {
          return true;
        }
        if (filterType === 'neverWithAnyOf') {
          return !intersectArray(array, expandedFiltersList).length;
        } else if (filterType === 'onlyWithExactCombination') {
          return arraysMatchExactly(array, [item, ...expandedFiltersList]);
        } else if (filterType === 'onlyWithAnyOf') {
          return intersectArray(array, expandedFiltersList).length;
        } else {
          return true;
        }
      });
    });
  }
  return arrays;
}

module.exports = function (rawData, opts = {}) {
  let final;
  const groups = parseIncoming(rawData);
  allCombinations = combinations(groups.map((item) => item.items));
  final = allCombinations
    .map((item) => item.filter((part) => part.length))
    .filter((item) => {
      return item.length >= (opts.minLength || 2);
    });
  ['onlyWithExactCombination', 'neverWithAnyOf', 'onlyWithAnyOf'].forEach((filterType) => {
    groups.forEach((group) => {
      final = filterNeverWithAnyOfItem(final, group, groups, filterType);
      group.items.forEach((item) => {
        final = filterNeverWithAnyOfItem(final, item, groups, filterType);
      });
    });
  });
  return final;
};
