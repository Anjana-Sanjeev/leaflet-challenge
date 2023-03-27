// Store API endpoint as queryUrl

let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL and then send data to createFeature

d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

// Function for popup that describes the details of the earthquake

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3> Where: " + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + 
    "<br><h2> Magnitude: " + feature.properties.mag + "</h2>" + "</p>" + "<br><h2> Depth: " + feature.geometry.coordinates[2] + "</h2>");

  }

// Function for circle marker

  function CircleMarker(feature,latlng){

    let options = {
        radius:feature.properties.mag*5,
        fillColor: depthColor(feature.geometry.coordinates[2]),
        color: depthColor(feature.geometry.coordinates[2]),
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.40
    }
    return L.circleMarker(latlng, options);

  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object and run the onEachFeature function

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: CircleMarker
  });

  // CreateMap function for earthquake layers

  createMap(earthquakes);

}

// Color circles based on magntitude

function depthColor(depth) {

  switch(true) {
      case (5 <= depth && depth <= 15):
        return "rgb(194, 30, 86)";
      case (15 <= depth && depth <= 25):
        return "rgb(124, 48, 48)";
      case (25 <= depth && depth <= 40):
        return "rgb(236, 88, 0)";
      case (40 <= depth && depth <= 60):
        return "rgb(128, 128, 0)";
      case (60 <= depth && depth <= 85):
        return "rgb(8, 24, 168)";
      case (85 <= depth && depth <= 120):
        return "rgb(128, 0, 0)";
      default:
        return "rgb(227, 66, 52)";
  }
  
}

//  Adding code for legend

let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [5, 15, 25, 40, 60, 85],
        labels = [];

    // loop through density intervals

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;

};


// Function for createMap

function createMap(earthquakes) {

  // Create the base layer

  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object

  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold overlay

  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create map giving it the streetmap and earthquakes layers to display on load

  let myMap = L.map("map", {
    center: [
      -1.0, 100.9
    ],
    zoom: 2.5,
    layers: [street, earthquakes]
  });

  // Create a layer control
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);

}
