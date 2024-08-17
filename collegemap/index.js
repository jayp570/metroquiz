var map = L.map('map').setView([39.5, -98.3], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


let decisions = [
    {name: "University of California, Berkeley", status: "r"},
    // {name: "University of California, Los Angeles", status: "r"},
    // {name: "University of California, Davis", status: "w"},
    // {name: "University of California, San Diego", status: "r"},
    // {name: "University of California, Irvine", status: "r"},
    // {name: "University of California, Santa Cruz", status: "a"},
    // {name: "University of California, Riverside", status: "a"},
    // {name: "University of California, Merced", status: "a"},
    // {name: "University of California, Santa Barbara", status: "a"},
    // {name: "University of Texas at Austin", status: "a"},
    // {name: "Stanford University", status: "r"},
    // {name: "University of Maryland, College Park", status: "a"},
    // {name: "University of Illinois Urbana-Champaign", status: "a"},
    // {name: "University of Michigan", status: "w"},
    // {name: "California Institute of Technology", status: "r"},
    // {name: "Massachusetts Institute of Technology", status: "r"},
    // {name: "Northwestern University", status: "r"},
    // {name: "University of Southern California", status: "r"},
    // {name: "Carnegie Mellon University", status: "r"},
    // {name: "Rice University", status: "r"},
    // {name: "New York University", status: "w"},
    // {name: "Brown University", status: "r"},
    // {name: "Columbia University", status: "r"},
    // {name: "University of Pennsylvania", status: "r"},
    // {name: "Princeton University", status: "r"},
    // {name: "COrnell University", status: "r"},
]

let colors = {
    "a": "green",
    "r": "red",
    "p": "blue",
    "w": "orange"
}

let schoolData = []
let outputs = []
let markers = []

// setTimeout(function() {
//     for(let i = 0; i < decisions.length; i++) {
//         const query = decisions[i].name;
//         console.log(query)
//         fetch('https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=' + query)
//             .then(result => result.json())
//             .then(parsedResult => {
//                 outputs.push(parsedResult[0]);
//             });
//     }
// }, 3000);

setTimeout( async function() {
    let fetchPromises = [];
    for(let i = 0; i < decisions.length; i++) {
        const query = decisions[i].name;
        fetchPromises.push(
            fetch('https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=' + query)
                .then(result => result.json())
        )
    }

    let results = await Promise.all(fetchPromises);

    for(let i = 0; i < results.length; i++) {
        const parsedResult = results[i]
        if(parsedResult.length > 0) {
            outputs.push(parsedResult[0])
        }
    }
}, 1000)



setTimeout(function()  {
    for(let i = 0; i < outputs.length; i++) {
        let output = outputs[i]
        schoolData.push({
            name: decisions[i].name,
            status: decisions[i].status,
            lat: Number(output.lat),
            lon: Number(output.lon)
        })
    }
    for(let school of schoolData) {
        let marker = L.circle([school.lat, school.lon], {
            color: colors[school.status],
            fillColor: colors[school.status],
            radius: 20000
        })
        school.marker = marker
    }
    for(let school of schoolData) {
        school.marker.addTo(map)
        school.marker.bindPopup(school.name)
    }
    console.log(schoolData)
}, 100*decisions.length)


