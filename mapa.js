//Crear objeto mapa
const map = L.map('map').setView([11.641, -85.578], 7);

//Enlazar mapa hibrido de Esri
// Capa satelital
const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri/cgim',
  maxZoom:19
});
// Capa de etiquetas (referencia)
const esriLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Labels © Esri',
  maxZoom:19
});
// Agrupamos ambas capas como híbrido
const esriHybrid = L.layerGroup([esriSat, esriLabels]);
//Enlazar mapa hibrido Esri


//Enlazar opentopo
// const opentopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
//   attribution: '© OpenTopoMap',
//   maxZoom: 17
//});

//Enlazar mapbox
const mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2FybG9zaXJhIiwiYSI6ImNrcDRwMnV4bzBiM3gycGt2NGpwazIzZ2UifQ.E5Y3NKk7Hq0MzhdfTUWj3g', {
  attribution: '© Mapbox/cgim',
  maxZoom: 22
});

const mapboxStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2FybG9zaXJhIiwiYSI6ImNrcDRwMnV4bzBiM3gycGt2NGpwazIzZ2UifQ.E5Y3NKk7Hq0MzhdfTUWj3g', {
  attribution: '© Mapbox',
  maxZoom: 22
});


const mapboxDark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2FybG9zaXJhIiwiYSI6ImNrcDRwMnV4bzBiM3gycGt2NGpwazIzZ2UifQ.E5Y3NKk7Hq0MzhdfTUWj3g', {
  attribution: '© Mapbox',
  maxZoom: 22
});

//Enlazar mapa OSM
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");



// =======================
// Controlador de capas
// =======================
const baseMaps = {
  "Esri Hibrid": esriHybrid,
  //"OpenTopo": opentopo,
  "Mapbox Hibrid": mapbox,
  "Mapbox Streets": mapboxStreets,
  "Mapbox oscuro": mapboxDark,
  "OpenStreetMap": osm
};

const overlayMaps = {}; // Se llenará dinámicamente

const controlCapas = L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

// Activar una capa base por defecto
esriHybrid.addTo(map);

// //Acceder a servicios WMS del geoserver
// var lotes = L.tileLayer.wms("http://localhost:8080/geoserver/Prueba1/wms?", {
//     layers: "pg_CA_Lotes_Total_100925",
//     format: "image/png",
//     transparent: true,
//     opacity: 0.5,
//     onEachFeature: popup,
//     }).addTo(map);
    
// var torres = L.tileLayer.wms("http://localhost:8080/geoserver/Prueba1/wms?", {
//     layers: "pg_torres_SIEPAC_250925",
//     format: "image/png",
//     transparent: true,
//     opacity: 0.5
//     }).addTo(map);

// Variables para capas
let capaTorres;
let capaLotes;

// =======================
// Capa de TORRES
// =======================
const torresUrl = "http://localhost:8080/geoserver/Prueba1/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Prueba1:pg_torres_SIEPAC_250925&outputFormat=application/json";

fetch(torresUrl)
  .then(res => res.json())
  .then(data => {
    capaTorres = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 3,
          fillColor: "red",
          color: "red",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        let props = feature.properties;
        let popupContent = `
          <strong>ID Torre:</strong> ${props.code}<br>
          <strong>Propietario:</strong> ${props.propietari}
        `;
        layer.bindPopup(popupContent);
      }
    });

    capaTorres.addTo(map);
    controlCapas.addOverlay(capaTorres, "Torres");
  });

// =======================
// Capa de LOTES
// =======================
const lotesUrl = "http://localhost:8080/geoserver/et_Servidumbres/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=et_Servidumbres:pg_CA_Lotes_Total&outputFormat=application/json";

fetch(lotesUrl)
  .then(res => res.json())
  .then(data => {
    capaLotes = L.geoJSON(data, {
      style: {
        color: "#063970",
        weight: 1,
        fillOpacity: 0.3
      },
      onEachFeature: function (feature, layer) {
        let props = feature.properties;
        let popupContent = `
          <strong>ID Lote:</strong> ${props.code}<br>
          <strong>Propietario:</strong> ${props.owner}<br>
          <strong>Estado:</strong> ${props.estatus}
        `;
        layer.bindPopup(popupContent);
      }
    });

    capaLotes.addTo(map);
    controlCapas.addOverlay(capaLotes, "Parcelas");
  });

// // //Controlador de capas anterior
// // var baseMaps = {
// //     //"OpenStreetMap": osm,
// //     "Esri_Hibrid": esriHybrid
// // };

// // var wms = {
// //     "Torres": torres,
// //     "Parcelas": lotes
// // };

// L.control.layers(baseMaps, wms).addTo(map);

//Funcionalidad lista desplegable de paises
document.getElementById('select-country').addEventListener('change',function(e){
 
    let value = e.target.value;

    if (value === "default") {
        // Coordenadas iniciales del mapa
        map.setView([11.641,-85.578], 6);
    } else {

    let coords = e.target.value.split(",");
    map.flyTo(coords,8);
    }
})

//Agregar plugin Minimap
var carto_light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
//var carto_light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {attribution: '©OpenStreetMap, ©CartoDB',subdomains: 'abcd',maxZoom: 24});

var minimap = new L.Control.MiniMap(carto_light,
    {
        toggleDisplay: true,
        minimized: false,
        position: "bottomleft"
    }).addTo(map);

// Agregar escala
 new L.control.scale({imperial: false}).addTo(map);

 // Configurar PopUp
function popup(feature,layer){
    if(feature.properties && feature.properties.code){
        layer.bindPopup("<strong>code: </strong>" + feature.properties.code + "<br/>" + "<strong>propietari: </strong>" + feature.properties.propietari);
    }
}

// Agregar un marcadores de oficinas EPR
var marker_EPR_ES = L.circleMarker(L.latLng(13.7020218,-89.2485611), {
    radius: 6,
    fillColor: "#ff0000",
    color: "blue",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6,
}).addTo(map);

var marker_EPR_CR = L.circleMarker(L.latLng(9.9312740,-84.1021172), {
    radius: 6,
    fillColor: "#ff0000",
    color: "blue",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6,
}).addTo(map);

var marker_EPR_GU = L.circleMarker(L.latLng(14.630568, -90.512691), {
    radius: 6,
    fillColor: "#ff0000",
    color: "blue",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6,
}).addTo(map);

var marker_EPR_HO = L.circleMarker(L.latLng(14.102701863023317, -87.19442684642614), {
    radius: 6,
    fillColor: "#ff0000",
    color: "blue",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6,
}).addTo(map);

var marker_EPR_NIC = L.circleMarker(L.latLng(12.12212928677416, -86.28434047657375), {
    radius: 6,
    fillColor: "#ff0000",
    color: "blue",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6,
}).addTo(map);

var marker_EPR_PA = L.circleMarker(L.latLng(8.429836317307553, -82.42835591026305), {
    radius: 6,
    fillColor: "#ff0000",
    color: "blue",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6,
}).addTo(map);

// Agrupamos todas las sucursales
var sucursales = L.layerGroup([marker_EPR_ES, marker_EPR_CR, marker_EPR_GU, marker_EPR_HO, marker_EPR_NIC, marker_EPR_PA]);

// Agregar la leyenda
const legend = L.control.Legend({
    title: 'Leyenda del mapa',
    position: "bottomright",
    collapsed: false,
    symbolWidth: 24,
    opacity:1,
    column:1,
    legends: [
        {
            label: "Sucursales EPR",
            type: "circle",
            radius: 6,
            color: "blue",
            fillColor: "#FF0000",
            fillOpacity: 0.6,
            weight: 2,
            layers: [sucursales],
            inactive: false,
        }, {
            label: "Torres SIEPAC",
            type: "circle",
            radius: 6,
            color: "#FF0000",
            fillColor: "#FF0000",
            weight: 2,
            layers: capaTorres,
        },  {
            label: "Lotes servidumbre",
            type: "rectangle",
            color: "#0074f0",
            fillColor: "#8a9093ff",
            weight: 2,
            layers: capaLotes,
        }, {
            label: "Marcador",
            type: "image",
            url: "Leaflet.Legend-master/examples/marker/purple.png"
        },{
            label: "Linea Punteada",
            type: "polyline",
            color: "#0000FF",
            fillColor: "#0000FF",
            dashArray: [5, 5],
            weight: 2
        }, {
            label: "Poligono",
            type: "polygon",
            sides: 5,
            color: "#FF0000",
            fillColor: "#FF0000",
            weight: 2
        }]
    }).addTo(map);


