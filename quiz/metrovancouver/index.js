// Initialize the map and set its view to a specific location
var map = L.map('map', {
    // zoomControl: false,
    // scrollWheelZoom: false,
    // doubleClickZoom: false,
    // touchZoom: false,
    // keyboard: false, 
    // dragging: false
}).setView([49.2, -122.9], 9); // Centered on San Francisco for example

// Add OpenStreetMap tile layer
L.tileLayer('https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png', {
    maxZoom: 18,
    attribution: '© CartoDB'
}).addTo(map);




let cities = new Set()
let citiesWithCase = new Map()
let correctCities = new Set()
let userInput = document.getElementById("userInput")
let geoJSONLayer = L.layerGroup().addTo(map)
let metroarea = "metrovancouver"
let populations = {}
let totalPopulation = 0
let populationSum = 0


function fillCities() {
    $.getJSON("../../citydata/clipped_boundaries/" + metroarea + ".geojson", function(data) {
        console.log(data)
        for(let feature of data.features) {
            let name = feature.properties.name
            cities.add(name.toLowerCase())
            citiesWithCase.set(name.toLowerCase(), name)
        }
    });
}

function loadPopulations() {
    $.getJSON("../../citydata/populations/" + metroarea + ".json", function(data) {
        populations = data
        console.log(populations)
        console.log(Object.values(populations))
        for(let pop of Object.values(populations)) {
            totalPopulation += parseInt(pop)
        }
        console.log(totalPopulation)
    })
}

function loadGeoJSON() {
    // Load GeoJSON data
    $.getJSON("../../citydata/clipped_boundaries/" + metroarea + ".geojson", function(data) {
        // Add GeoJSON layer to the map
        geoJSONLayer.clearLayers()
        L.geoJson(data, {
            style: function(feature) {
                if(correctCities.has(feature.properties.name.toLowerCase())) {
                    return {color: "green", weight: 0.5}
                } else {
                    return {color: "black", weight: 0.25}
                }
            },
            onEachFeature: function(feature, layer) {
                if(correctCities.has(feature.properties.name.toLowerCase())) {
                    layer.bindPopup(feature.properties.name)
                }
            }
        }).addTo(geoJSONLayer);
    });

}

fillCities()
loadGeoJSON()
loadPopulations()





function updateHTML(input) {
    let citiesList = document.getElementById("citiesList")
    document.getElementById("score").innerHTML = `${correctCities.size}/${correctCities.size + cities.size}`

    userInput.value = ""
    nameWithCase = citiesWithCase.get(input)

    population = parseInt(populations[nameWithCase])
    populationSum += population
    percentage = (100*populationSum/totalPopulation).toFixed(2)
    popStr = population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    popSumStr = populationSum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    let html = `<span>${correctCities.size}. ${nameWithCase} <span id="population">(${popStr})</span></span> <br>`
    citiesList.innerHTML = html + document.getElementById("citiesList").innerHTML
    document.getElementById("percentage").innerHTML = `<b>${popSumStr}</b> people (<b>${percentage}%</b> of this area's population)`
    if(citiesList.offsetHeight > 100) {
        document.getElementById("expandCollapseButton").style.display = "block"
    }
}

function expandCollapse() {
    citiesListStyle = document.getElementById("citiesList").style
    if(citiesListStyle.maxHeight != "none") {
        citiesListStyle.maxHeight = "none"
        document.getElementById("expandCollapseButton").innerHTML = "(-)"
    } else {
        citiesListStyle.maxHeight = "6.3em"
        document.getElementById("expandCollapseButton").innerHTML = "(+)"
    }
}

$('#userInput').keyup(function() {
    let input = userInput.value.toLowerCase()
    if(cities.has(input) && !correctCities.has(input)) {
        correctCities.add(input)
        cities.delete(input)
        loadGeoJSON()
        updateHTML(input)
    }
})



// feature to add - population of all guessed cities as a percentage of the metro areas population
// make json to store total populations of metro areas
