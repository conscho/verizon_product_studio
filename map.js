
var drawingManager;

function initMap() {


    
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.740914, lng: -74.0043697},
        zoom: 15,
        disableDefaultUI: true,
    });
    
    show_clustering()
    // show_heatmap()
    // show_infowindow()

    // [Chris] Plot drawing layer: https://developers.google.com/maps/documentation/javascript/examples/drawing-tools
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.CIRCLE,
        drawingControl: false,

        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 0.3,
            strokeWeight: 1,
            clickable: false,
            editable: false,
            zIndex: 1
        }
    });

    // Bind button to the drawing layer
    google.maps.event.addListener(drawingManager, 'circlecomplete', function( circle ) {
     drawingManager.setMap(null);
 });

    google.maps.event.addDomListener(document.getElementById('btn-source'), 'click', drawSource);
    function drawSource() {
        if (drawingManager.map == null) {
            drawingManager.setMap(map);
            drawingManager.setOptions({
                circleOptions: {
                    fillColor: '#ff0000',
                    fillOpacity: 0.3,
                    strokeWeight: 1,
                    clickable: false,
                    editable: false,
                    zIndex: 1
                }
            });
        } else {
            drawingManager.setMap(null);
        }
    }

    google.maps.event.addDomListener(document.getElementById('btn-evacuation'), 'click', drawEvacuation);
    function drawEvacuation() {
        if (drawingManager.map == null) {
            drawingManager.setMap(map);
            drawingManager.setOptions({
                circleOptions: {
                    fillColor: '#ffe600',
                    fillOpacity: 0.3,
                    strokeWeight: 1,
                    clickable: false,
                    editable: false,
                    zIndex: 1
                }
            });
        } else {
            drawingManager.setMap(null);
        }
    }


    // [Chris] Plot visualization (heatmap) layer: https://developers.google.com/maps/documentation/javascript/heatmaplayer#load_the_visualization_library
    function show_heatmap(){    
        var heatmapData = [
        new google.maps.LatLng(40.741, -74.005),
        new google.maps.LatLng(40.741, -74.006),
        new google.maps.LatLng(40.741, -74.007),
        new google.maps.LatLng(40.743, -74.005),
        new google.maps.LatLng(40.743, -74.006),
        new google.maps.LatLng(40.743, -74.007)
        ];
        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData
        });
        heatmap.setMap(map);

    }

    //[Chris] Info window: https://developers.google.com/maps/documentation/javascript/infowindows
    function show_infowindow(){
        var contentString = 'This is a Info window';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        var marker = new google.maps.Marker({
            position: {lat: 40.741, lng: -74.005},
            map: map,
            title: 'Chelsea '
        });

        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
    }

    //[Chris] Marker clustering
    function show_clustering() {
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        var markers = locations.map(function(location, i) {
            return new google.maps.Marker({
              position: location,
              label: labels[i % labels.length]
          });
        });

        var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'images/m'});

    }
}


var locations = [
{lat: 40.741161, lng: -74.000816},
{lat: 40.741234, lng: -74.001557},
{lat: 40.741754, lng: -74.004228},
{lat: 40.740405, lng: -74.003273},
{lat: 40.740665, lng: -73.999465},
{lat: 40.739706, lng: -73.997941},
{lat: 40.739519, lng: -74.000623},
{lat: 40.740559, lng: -74.003112},
{lat: 40.74199, lng: -74.001696},
{lat: 40.740575, lng: -74.004464},
{lat: 40.740299, lng: -74.003134},
{lat: 40.739535, lng: -74.00058},
{lat: 40.741307, lng: -74.000967},
{lat: 40.743648, lng: -74.001417},
{lat: 40.743876, lng: -74.004207},
{lat: 40.742689, lng: -74.006824},
{lat: 40.741778, lng: -74.00661},
{lat: 40.741242, lng: -74.006717},
{lat: 40.740234, lng: -74.006352},
{lat: 40.7396, lng: -74.006546},
{lat: 40.739486, lng: -74.004121},
{lat: 40.740055, lng: -74.004571},
{lat: 40.740348, lng: -74.003735},
{lat: 40.740787, lng: -74.003048},
{lat: 40.741973, lng: -74.002447},
{lat: 40.743225, lng: -74.002812},
{lat: 40.744331, lng: -74.003842},
{lat: 40.743518, lng: -74.005215},
{lat: 40.74303, lng: -74.004979},
{lat: 40.74251, lng: -74.00691},
{lat: 40.740153, lng: -74.004185},
{lat: 40.739958, lng: -74.001825},
{lat: 40.74012, lng: -74.000881},
{lat: 40.740559, lng: -73.999357},
{lat: 40.741535, lng: -73.999121},
{lat: 40.742624, lng: -73.999035},
{lat: 40.742721, lng: -74.000366},
{lat: 40.743177, lng: -74.002233},
{lat: 40.743827, lng: -74.00249},
{lat: 40.742364, lng: -74.001825},
{lat: 40.739226, lng: -74.00146},
{lat: 40.739958, lng: -74.002748},
{lat: 40.737226, lng: -74.002039},
{lat: 40.739779, lng: -74.00131},
{lat: 40.739811, lng: -74.000022},
{lat: 40.742006, lng: -74.002705},
{lat: 40.739356, lng: -74.00279},
{lat: 40.739925, lng: -74.002361},
{lat: 40.740982, lng: -74.001696},
{lat: 40.741778, lng: -74.000173},
{lat: 40.740657, lng: -74.000752},
{lat: 40.739421, lng: -74.002125},
{lat: 40.73921, lng: -74.003048},
{lat: 40.739958, lng: -74.002748},
{lat: 40.740201, lng: -74.001975},
{lat: 40.739632, lng: -74.002426},
{lat: 40.739681, lng: -74.002855},
{lat: 40.739892, lng: -74.002275},
{lat: 40.738072, lng: -73.998263},
{lat: 40.737535, lng: -73.998671},
{lat: 40.737568, lng: -73.998156},
{lat: 40.73799, lng: -73.997898},
{lat: 40.738364, lng: -73.998349},
{lat: 40.740852, lng: -73.998692},
{lat: 40.741502, lng: -73.998263},
{lat: 40.741518, lng: -73.997619},
{lat: 40.740998, lng: -73.997405},
{lat: 40.740039, lng: -74.004142},

]




