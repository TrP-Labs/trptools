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

// This is just a basic version, needs to account for the amount of vehicles on each route

function autoSolve(data) {
    let route = null

    const depot = spawnlocations[data.Depot]
    const customroute = route_overrides[data.Name]

    if (customroute) {route = customroute; return route}

    route = depot[Math.floor(Math.random()*depot.length)]

    return route
}