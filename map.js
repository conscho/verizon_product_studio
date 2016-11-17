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
            strokeWeight: 0.1,
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

    // Moving marker demo
    function createMarker(latlng, label, text) {
        var contentString = '<b>'+label+'</b><br>'+text;
        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: label,
            zIndex: Math.round(latlng.lat()*-100000)<<5
        });
        marker.myname = label;

        infowindow = new google.maps.InfoWindow({});

        marker.addListener('click', function() {
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });
        return marker;
    }

    latlng = new google.maps.LatLng(40.744, -74.009)
    marker = createMarker(latlng, 'test', 'green');


    function moveMarkerBy(deltaX = 0, deltaY = 0) {
        latlng = new google.maps.LatLng(marker.getPosition().lat() + deltaX, marker.getPosition().lng() + deltaY);
        marker.setPosition(latlng);
    }

    for (var i=0;i<=100;i++) {
        (function(ind) {
            setTimeout(function(){moveMarkerBy(0.0001);}, 100 * ind);
        })(i);
    }

}
