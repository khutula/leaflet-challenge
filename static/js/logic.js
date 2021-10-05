// Set link for GEOjson data on M4.5+ Earthquakes past 30 days
var link = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5";

// Function to set color of marker based on earthquake depth
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

    // Call function to create features for map
    createFeatures(data.features);
});

// Create features for map using data
function createFeatures(earthquakeData) {

    // Create GeoJSON layer with the retrieved data
    var earthquakes = L.geoJSON(earthquakeData, {

        // Styling each earthquake for color (depth) and size (magnitude)
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

        // Add toolitp with magnitude, location, and depth for each earthquake
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h1> Magnitude " + feature.properties.mag + "</h1> <hr> <h2>" + feature.properties.place + "</h2> <h2> Depth: " + feature.geometry.coordinates[2] + "</h2>");
        }
    });

    // Call function to create map using GeoJSON layer
    createMap(earthquakes);
}

// Create map and layers
function createMap(earthquakes) {

    // Create the base layers
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    var topography = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create baseMaps object
    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topography
    };

    // Create overlays object.
    var overlayMaps = {
        "Earthquake Map": earthquakes
    };

    // Create map and set center, zoom, and layers
    var myMap = L.map("map", {
        center: [19, -17],
        zoom: 3,
        layers: [street, earthquakes]
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 30, 50, 70, 90, 110]
        
        div.innerHTML = "<strong>Legend: Depth</strong> <br>"

        // loop through our depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + depthToColor(grades[i]) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Add legend to map
    legend.addTo(myMap);
}