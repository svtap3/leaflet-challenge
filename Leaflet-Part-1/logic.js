// API endpoing as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// GET request to the query URL
d3.json(queryURL).then(function(data){
    // Data.features and data.features object to the createFeatures function.
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeData, platesData){

    // Popup describing the place and time of the earthquakes
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // GeoJSON layer containing the features array on the earthquakeData object
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 1.3,
        opacity: 0.8,
        fillOpacity: 0.35
       } 
       return L.circleMarker(latlng,options);
    }
    // Variable for earthquakes to house latlng, each feature for popup, and cicrle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Earthquakes layer to the createMap function - will start creating the map and add features
    createMap(earthquakes);
}

// Color palette based on mag (feature) data marker: data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
function chooseColor(mag){
    switch(true){
        case(1.0 <= mag && mag <= 2.5):
            return "#0000FF"; // Strong blue
        case (2.5 <= mag && mag <=4.0):
            return "#00FF00";
        case (4.0 <= mag && mag <=5.5):
            return "#FFFF00";
        case (5.5 <= mag && mag <= 8.0):
            return "#FF0000";
        case (8.0 <= mag && mag <=20.0):
            return "#800000";
        default:
            return "#E2FFAE";
    }
}

// Map legend to provide context for map data
let legend = L.control({position: 'bottomleft'});

legend.onAdd = function() {
    var divs = L.DomUtil.create('divs', 'info legend');
    var grade = [1.0, 2.5, 4.0, 5.5, 8.0];
    var label = [];
    var legend_information = "<h4>Magnitude</h4>";

    divs.innerHTML = legend_information

    // Cycle each magnitude item to label and color the legend
    // push to label array as list item
    for (var i = 0; i < grade.length; i++) {
          label.push('<ul style="background-color:' + chooseColor(grade[i] + 1) + '"> <span>' + grade[i] + (grade[i + 1] ? '&ndash;' + grade[i + 1] + '' : '+') + '</span></ul>');
        }

      // add each label list item to the divs under the <ul> tag
      divs.innerHTML += "<ul>" + label.join("") + "</ul>";
    
    return divs;
  };


// Create map
function createMap(earthquakes) {
   // Define outdoors and grayscalemap layers
   let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "outdoors-v11",
    accessToken: API_KEY
  })

  let grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Outdoors": streetmap,
    "Grayscale": grayscalemap
  };

  // Create overlay object to hold our overlay layer
  let overlays = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      39.8282, -98.5795
    ],
    zoom: 4,
    layers: [streetmap, earthquakes]
  });
  // Add the layer control to the map
  L.control.layers(baseMaps, overlays, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}