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

function defaultStyle(feature) {return {color: "#222", weight: 0.25}}
function correctStyle(feature) {return {color: "red", weight: 0.5}}
function style(feature) {
    if(correctCities.has(feature.properties.name.toLowerCase())) {
        return correctStyle(feature);
    } else {
        return defaultStyle(feature);
    }
}




let cities = new Set()
let correctCities = new Set()
let userInput = document.getElementById("userInput")
let geoJSONLayer = L.layerGroup().addTo(map)

function loadGeoJSON() {
    // Load GeoJSON data
    $.getJSON("clipped_boundaries/bayarea.geojson", function(data) {
        // Add GeoJSON layer to the map
        console.log(data)
        for(let feature of data.features) {
            cities.add(feature.properties.name.toLowerCase())
        }
        geoJSONLayer.clearLayers()
        L.geoJson(data, {style: style}).addTo(geoJSONLayer);
    });
}
loadGeoJSON()

$('#userInput').keyup(function() {
    let input = userInput.value.toLowerCase()
    if(cities.has(input) && !correctCities.has(input)) {
        correctCities.add(input)
        userInput.value = ""
        loadGeoJSON()
    }
})
