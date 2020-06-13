var stylelayer = {
  defecto: {
    color: "green",
    opacity: 1,
    fillcolor: "green",
    fillOpacity: 0.1,
    weight: 0.5
  },
  reset: {
    color: "red",
    opacity: 0.4,
    weight: 1
  },
  highlight: {
    weight: 2,
    color: 'yellow',
    dashArray: '',
    fillOpacity: 0.5
  },
  selected: {
    color: "yellow",
    opacity: 0.3,
    weight: 0.5
  }

}

/*Initial map and add layer for mapbox*/
var map = L.map('map').setView([52.9491828,-4.8406001], 3);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'my company',
    id: 'mapbox.light'
}).addTo(map);

/*declarando variables globales*/
var placenames = new Array();
var zipcodes = new Object();

$.each(statesData.features, function(index, feature) {
    var name = `${feature.properties.zipcode} ${feature.properties.municipality}  ( ${feature.properties.province} -  ${feature.properties.town})`
    placenames.push(name);
    zipcodes[name] = feature.properties.zipcode;
});

/* area de busqueda */
$('#places').typeahead({
    source: placenames,
    afterSelect: function(b) {
        redraw(b)
    }
});

var arrayBounds = [];
function redraw(b) {
    geojson.eachLayer(function(layer) {
        if (layer.feature.properties.zipcode == zipcodes[b]) {
            selectTypeaheadFeature(layer)
        }
    })
}

var geojson = L.geoJson(statesData, {
    style: stylelayer.defecto,
    onEachFeature: onEachFeature
}).addTo(map);

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
            //dblclick : selectFeature
    });
}

var popupLayer;
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(stylelayer.highlight);
    var popup = L.popup()
    .setLatLng(e.latlng)
    .setContent((layer.feature.properties ? `
        <strong>${layer.feature.properties.name_long}</strong>
        <br>Continent : ${layer.feature.properties.continent}
        <br><a target=\"blank\" href=\"https://en.wikipedia.org/wiki/${layer.feature.properties.name_long}\">More infos</a>` : 'Hover over a state'))
    .openOn(map);
}


function resetHighlight(e) {
    var layer = e.target;
    var feature = e.target.feature;
    if (checkExistsLayers(feature)) {
        setStyleLayer(layer, stylelayer.highlight)
    } else {
        setStyleLayer(layer, stylelayer.defecto)
    }
    /* Para agregar evento al la capa y mostrar detalles */
    /* popupLayer.on('mouseout', function(e) {
                this.closePopup();
            })*/
}

var featuresSelected = []
function zoomToFeature(e) {

    var layer = e.target;
    var feature = e.target.feature;

    if (checkExistsLayers(feature)) {
        removerlayers(feature, setStyleLayer, layer, stylelayer.defecto)
        removeBounds(layer)

    } else {
        addLayers(feature, setStyleLayer, layer, stylelayer.highlight)
        addBounds(layer)
    }
    map.fitBounds(arrayBounds);
    

}


function selectTypeaheadFeature(layer) {
    var layer = layer;
    var feature = layer.feature;

    if (checkExistsLayers(feature)) {
        removerlayers(feature, setStyleLayer, layer, stylelayer.defecto)

        removeBounds(layer)

    } else {
        addLayers(feature, setStyleLayer, layer, stylelayer.highlight)
        addBounds(layer)
    }
    map.fitBounds(arrayBounds.length != 0 ? arrayBounds : initbounds)
   

}

var corner1 = L.latLng(53.62, 2.931),
    corner2 = L.latLng(50.763, 7.182)
var initbounds = L.latLngBounds(corner1, corner2)
var arrayBounds = [];

function addBounds(layer) {
    arrayBounds.push(layer.getBounds())
}

function removeBounds(layer) {
    arrayBounds = arrayBounds.filter(bounds => bounds != layer.getBounds())
}

function setStyleLayer(layer, styleSelected) {
    layer.setStyle(styleSelected)
}

function removerlayers(feature, callback) {
    featuresSelected = featuresSelected.filter(obj => obj.zipcode != feature.properties.zipcode)
    callback(arguments[2], arguments[3])
}

function addLayers(feature, callback) {
    featuresSelected.push({
        zipcode: feature.properties.zipcode,
        feature: feature
    })
    callback(arguments[2], arguments[3])
}

function checkExistsLayers(feature) {
    var result = false
    for (var i = 0; i < featuresSelected.length; i++) {
        if (featuresSelected[i].zipcode == feature.properties.zipcode) {
            result = true;
            break;
        }

    };
    return result
}





function dellayer(zipcode) {
    geojson.eachLayer(function(layer) {
        if (layer.feature.properties.zipcode == zipcode) {
            selectTypeaheadFeature(layer)
        }
    })
}
