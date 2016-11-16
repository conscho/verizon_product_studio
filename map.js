function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.740914, lng: -74.0043697},
        zoom: 15,
        disableDefaultUI: true,
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
          },
          {
            featureType: 'poi',
            stylers: [{visibility: 'off'}]
          },
          {
            featureType: 'transit',
            stylers: [{visibility: 'off'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.icon',
          stylers: [{visibility: 'off'}]
        },
        ]
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
                }
            });
        } else {
            drawingManager.setMap(null);
        }
    }

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
