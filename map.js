
var drawingManager;

function initMap() {
var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.740914, lng: -74.0043697},
    zoom: 15,
    disableDefaultUI: true,
});
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

    //[Chris] Info window: https://developers.google.com/maps/documentation/javascript/infowindows
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
