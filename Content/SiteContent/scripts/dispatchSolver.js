let routeAPI = null
const MAX_PEOPLE_PER_ROUTE = 6

let spawnlocations = {
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function shuffleObjectKeys(obj) {
  const keys = Object.keys(obj);
  shuffleArray(keys);
  return keys;
}


function getLowestNumber(obj) {
    let minValue = Infinity;
    let minIndex;
    const looparray = shuffleObjectKeys(obj)
    for (let key in looparray) {
      key = looparray[key]
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
      } else {
        filteredObject[index] = 0;
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

    if (filteredObject[exclude]) { // prevent duplicates
        delete filteredObject[exclude]
    }

    console.log(filteredObject)

    route = getLowestNumber(filteredObject)

    console.log(route)

    return route
}