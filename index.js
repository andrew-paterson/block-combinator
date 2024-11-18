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
      combine([...prefix, item], remainingArrays);
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

function allStringsPresent(array1, array2) {
  return array1.every((item) => array2.includes(item));
}

function someStringsPresent(array1, array2) {
  return array1.some((item) => array2.includes(item));
}

function oneStringFromEachgroupPresent(array, groups) {
  for (var group of groups) {
    if (!someStringsPresent(group, array)) {
      return false;
    }
    return true;
  }
}

function organiseIntoGroups(array, groups) {
  const organised = [];
  groups.forEach((group) => {
    organised.push(array.filter((arrayItem) => group.items.map((item) => item.value).includes(arrayItem)));
  });
  return organised.filter((group) => group.length);
}

function filterItems(arrays, entity, groups, filterType) {
  if (entity[filterType]) {
    const entityName = entity.block || entity.value;
    const entityItems = groupItems(entityName, groups);
    entityItems.forEach((item) => {
      arrays = arrays.filter((array) => {
        if (!array.includes(item)) {
          return true;
        }
        if (filterType === 'onlyWithAtLeastOnefromEach') {
          const expandedFiltersList = expandItemList(entity[filterType], groups);
          const organisedCombinations = organiseIntoGroups([item, ...expandedFiltersList], groups);
          return oneStringFromEachgroupPresent(array, organisedCombinations);
        }
        if (filterType === 'onlyWithAllOf') {
          const expandedFiltersList = expandItemList(entity[filterType], groups);
          const organisedCombinations = organiseIntoGroups([item, ...expandedFiltersList], groups);
          const allExactCombinations = combinations(organisedCombinations);
          for (var exactCombination of allExactCombinations) {
            if (allStringsPresent(exactCombination, array)) {
              return true;
            }
          }
          return false;
        } else if (filterType === 'neverWithAnyOf') {
          const expandedFiltersList = expandItemList(entity[filterType], groups);
          return !someStringsPresent(array, expandedFiltersList);
        } else if (filterType === 'neverWithAllOf') {
          const expandedFiltersList = expandItemList(entity[filterType], groups);
          const organisedCombinations = organiseIntoGroups([item, ...expandedFiltersList], groups);
          const allExactCombinations = combinations(organisedCombinations);
          for (var exactCombination of allExactCombinations) {
            if (allStringsPresent(exactCombination, array)) {
              return false;
            }
          }
          return true;
        } else if (filterType === 'onlyWithExactCombinations') {
          const expandedFiltersList = expandItemList(entity[filterType], groups);
          const organisedCombinations = organiseIntoGroups([item, ...expandedFiltersList], groups);
          const allExactCombinations = combinations(organisedCombinations);
          for (var exactCombination of allExactCombinations) {
            if (arraysMatchExactly(exactCombination, array)) {
              return true;
            }
          }
          return false;
        } else if (filterType === 'onlyWithAnyOf') {
          const expandedFiltersList = expandItemList(entity[filterType], groups);
          return someStringsPresent(array, expandedFiltersList);
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
  const allCombinations = combinations(groups.map((group) => group.items.map((item) => item.value)));
  final = allCombinations
    .map((item) => item.filter((part) => part.length))
    .filter((item) => {
      return item.length >= (opts.minLength || 2);
    });
  ['onlyWithExactCombinations', 'neverWithAnyOf', 'onlyWithAnyOf', 'onlyWithAllOf', 'neverWithAllOf', 'onlyWithAtLeastOnefromEach'].forEach((filterType) => {
    groups.forEach((group) => {
      final = filterItems(final, group, groups, filterType);
      group.items.forEach((item) => {
        final = filterItems(final, item, groups, filterType);
      });
    });
  });
  return final;
};
