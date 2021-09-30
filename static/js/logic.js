// Set link for GEOjson data on M4.5+ Earthquakes past 30 days
var link = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5";

function depthToColor(depth) {
    if (depth < 10) return "#65eb34";
    else if (depth < 30) return "#b4eb34";
    else if (depth < 50) return "#ebeb34";
    else if (depth < 70) return "#ebc334";
    else if (depth < 90) return "#eb8f34";
    else if (depth < 110) return "#eb6b34";
    else return "#FF0000";
}

// Get GeoJSON data
d3.json(link).then(function(data) {

    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Create GeoJSON layer with the retrieved data
    var earthquakes = L.geoJSON(earthquakeData, {

        // Styling each feature (in this case, a neighborhood)
        pointToLayer: function(feature, latlng) {
            var myStyle = {
                fillColor: depthToColor(feature.geometry.coordinates[2]),
                color: "black",
                opacity: .8,
                fillOpacity: .7,
                radius: (feature.properties.mag**2) - 10
            };
            return L.circleMarker(latlng, myStyle);
        },

        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h1> Magnitude " + feature.properties.mag + "</h1> <hr> <h2>" + feature.properties.place + "</h2>");
        }
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the base layers.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    var topography = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topography
    };

    // Create an overlays object.
    var overlayMaps = {
        "Earthquake Map": earthquakes
    };

    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    var myMap = L.map("map", {
        center: [19, -17],
        zoom: 3,
        layers: [street, earthquakes]
    });

    // Create a layer control that contains our baseMaps.
    // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 30, 50, 70, 90, 110],
            labels = [];

        
        div.innerHTML = "<strong>Legend: Depth</strong> <br>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + depthToColor(grades[i]) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}