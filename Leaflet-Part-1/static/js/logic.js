// This dataset contains all earthquakes that have occurred over the course of the past week.
const dataURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Defining some of the basic information that will be inserted into our map when we initiate it
const htmlSelector = 'map';
const northAmericaCenter = [48.10, -100.10];
const zoomVal = 4;

// A function that returns a color based on the depth of an earthquake
function getCircleColor(depth) {
    if (depth > 200)      { return "red";         }
    else if (depth > 100) { return "tomato";      }
    else if (depth > 50)  { return "orange";      }
    else if (depth > 25)  { return "yellow";      }
    else if (depth > 10)  { return "yellowgreen"; }
    else                  { return "green";       }
}

// A function that returns the radius of the bubbles on the map based on the magnitude of the earthquake
function getCircleRadius(magnitude) {
    return magnitude * 10000;
}

// Importing Data
d3.json(dataURL).then((data) => {
    // A list of features
    const featureList = data.features;

    // Creating leaflet map
    const map = L.map(htmlSelector, {
        center : northAmericaCenter,
        zoom : zoomVal
    });

    // Adding the background map
    const tileLayer = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Initializing the list of bubbles
    const circleArray = [];

    // Creating all of the bubbles that represent the earthquakes
    for (feature of featureList) {
        // Some basic variables for bubble creation
        const location = feature.geometry.coordinates;
        const magnitude = feature.properties.mag;
        const depth = location[2];


        // Creating the circle
        const circle = L.circle([location[1], location[0]], {
            color : "black",
            weight : 0.5, 
            fillColor : getCircleColor(depth),
            fillOpacity : 0.5,
            radius : getCircleRadius(magnitude)
        });


        // Popup for the earthquake bubbles when they are clicked
        circle.bindPopup(`
            <div class="tooltip-wrapper">
                <div class="tooltip-div">
                    <h3>Magnitude</h3>
                    <p>${magnitude}</p>
                </div>
                <div class="tooltip-div">
                    <h3>Depth</h3>
                    <p>${depth}</p>
                </div>
                <div class="tooltip-div">
                    <h3>Latitude</h3>
                    <p>${location[1]}</p>
                </div>
                <div class="tooltip-div">
                    <h3>Longitude</h3>
                    <p>${location[0]}</p>
                </div>
            </div>
        `, { maxWidth : 'auto'});

        // Adding the bubble to the bubble array
        circleArray.push(circle);
    }

    // Two lists of values that will appear in the legend
    const labels = ["200+", "200-10", "100-50", "50-25", "25-10", "< 10"];
    const colors = ["red", "tomato", "orange", "yellow", "yellowgreen", "green"];

    // Creating the legend
    let legend = L.control({position : "bottomright"});
    legend.onAdd = (map) => {
        const div = L.DomUtil.create('div', 'legend-div');

        const limitsArray = [];

        for (let index = 0; index < colors.length; index++) {
            limitsArray.push(`<li class='legend-label'><div class='color-div' style='background-color: ${colors[index]}'"></div><p>${labels[index]}</p></li>`);
        }

        div.innerHTML += "<ul>" + limitsArray.join("") + "</ul>";

        return div;
    }

    // A layer group for the bubbles added to the map
    const circleLayerGroup = L.layerGroup(circleArray);

    // Adding the background map to the map
    tileLayer.addTo(map);

    // Adding the bubbles to the map 
    circleLayerGroup.addTo(map);

    // Adding the legend to the map
    legend.addTo(map);
})