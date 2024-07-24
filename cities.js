// Initialize the map and set its view to a specific location
var map = L.map('map', {
    // zoomControl: false,
    // scrollWheelZoom: false,
    // doubleClickZoom: false,
    // touchZoom: false,
    // keyboard: false, 
    // dragging: false
}).setView([34, -118], 8.25); // Centered on San Francisco for example

// Add OpenStreetMap tile layer
L.tileLayer('https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png', {
    maxZoom: 18,
    attribution: '© CartoDB'
}).addTo(map);




let cities = new Set()
let correctCities = new Set()
let userInput = document.getElementById("userInput")
let geoJSONLayer = L.layerGroup().addTo(map)
let metroarea = "bayarea"


function populateCities() {
    $.getJSON("clipped_boundaries/" + metroarea + ".geojson", function(data) {
        console.log(data)
        for(let feature of data.features) {
            cities.add(feature.properties.name.toLowerCase())
        }
    });
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
                    return {color: "#222", weight: 0.25}
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

function updateHTML() {
    document.getElementById("score").innerHTML = `${correctCities.size}/${correctCities.size + cities.size}`
}

populateCities()
loadGeoJSON()

$('#userInput').keyup(function() {
    let input = userInput.value.toLowerCase()
    if(cities.has(input) && !correctCities.has(input)) {
        correctCities.add(input)
        cities.delete(input)
        userInput.value = ""
        loadGeoJSON()
        updateHTML()
    }
})
