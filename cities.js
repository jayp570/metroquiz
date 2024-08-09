// Initialize the map and set its view to a specific location
var map = L.map('map', {
    // zoomControl: false,
    // scrollWheelZoom: false,
    // doubleClickZoom: false,
    // touchZoom: false,
    // keyboard: false, 
    // dragging: false
}).setView([37.7, -122.4], 8.25); // Centered on San Francisco for example

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
let metroarea = "seattlemetroarea"
let populations = {}


function fillCities() {
    $.getJSON("clipped_boundaries/" + metroarea + ".geojson", function(data) {
        console.log(data)
        for(let feature of data.features) {
            let name = feature.properties.name
            cities.add(name.toLowerCase())
            citiesWithCase.set(name.toLowerCase(), name)
        }
    });
}

function loadPopulations() {
    $.getJSON("populations/" + metroarea + ".json", function(data) {
        populations = data
    })
}

function loadGeoJSON() {
    // Load GeoJSON data
    $.getJSON("clipped_boundaries/" + metroarea + ".geojson", function(data) {
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
                if(!correctCities.has(feature.properties.name.toLowerCase())) {
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
    document.getElementById("score").innerHTML = `${correctCities.size}/${correctCities.size + cities.size}`
    userInput.value = ""
    nameWithCase = citiesWithCase.get(input)
    population = populations[nameWithCase]
    let html = `<span>${correctCities.size}. ${nameWithCase} (${population})</span> <br>`
    document.getElementById("citiesList").innerHTML = html + document.getElementById("citiesList").innerHTML
    if(correctCities.size > 5) {
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
