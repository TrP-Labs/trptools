let routeAPI = null
const MAX_PEOPLE_PER_ROUTE = 6

const spawnlocations = {
    "N/A": [
        6,
        9,
        10,
        14,
        16
    ],
    "Hardbass Island Depot": [
        6,
        9,
        10
    ],
    "Main Island Depot": [
        10,
        14,
        16
    ],
}

const route_overrides = {
    'ZiU-682 (ZiU-9) Service vehicle': "SV",
    'VAZ-2109 Sputnik': "Staff"
}

let routestatus = {
    ['6'] : 0,
    ['9'] : 0,
    ['10'] : 0,
    ['14'] : 0,
    ['16'] : 0,
}

function scrambleObject(obj) {
    return Object.fromEntries(Object.entries(obj).sort(() => Math.random() - 0.5));
  }

function getLowestNumber(obj) {
    let minValue = Infinity;
    let minIndex;
  
    for (const key in obj) {
      const value = obj[key];
      
      if (value < minValue) {
        minValue = value;
        minIndex = key;
      }
    }
  
    return minIndex;
  }

  function filterObjectByIndexes(array, originalObject) {
    const filteredObject = {};
  
    array.forEach(index => {
      if (originalObject.hasOwnProperty(index)) {
        filteredObject[index] = originalObject[index];
      }
    });
  
    return filteredObject;
  }

function autoSolve(data, exclude) {
    let route = null

    const depot = spawnlocations[data.Depot]
    const customroute = route_overrides[data.Name]

    if (customroute) {route = customroute; return route}

    let filteredObject = filterObjectByIndexes(depot, routestatus) // make an object where the index is the route and the value is the amount of vehicles on it
    filteredObject = scrambleObject(filteredObject) // not sure if this does anything tbh

    if (filteredObject[exclude]) { // prevent duplicates
        delete filteredObject[exclude]
    }

    route = getLowestNumber(filteredObject)

    return route
}