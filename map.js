function initMap() {
    var markers;

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
    function createMarker(input) {
        var contentString = '<b>'+input.label+'</b><br>'+input.text;
        var marker = new google.maps.Marker({
            position: {lat: input.lat, lng: input.lng},
            map: map,
            direction: Math.random()*360,
            speed: Math.random()*0.00005,
            steps: 0,
            maxSteps: Math.random()*50,
            icon: 'images/marker.png'
        });

        infowindow = new google.maps.InfoWindow({});

        marker.addListener('click', function() {
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });
        return marker;
    }

    function moveMarkerBy(marker, deltaX = 0, deltaY = 0) {
        latlng = new google.maps.LatLng(marker.getPosition().lat() + deltaX, marker.getPosition().lng() + deltaY);
        marker.setPosition(latlng);
    }

    function moveMarkers(markers, clustering) {
        for (var i = 0; i < markers.length; i++) {
            if (true) {
                Math.seedrandom(i);
            }
            moveMarkerBy(markers[i], 0, (Math.random()*2 - 1)*0.00005, (Math.random()*2 - 1)*0.00005);
        }
        // Update clusters
        if (clustering) {
            clustering.repaint();
        }
    }

    //[Chris] Marker clustering
    function createClusters(markers) {
        var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'images/m'});
        return markerCluster;
    }

    // Initialize markers
    var markers = locations.map(createMarker);

    // Clustering on
    var clustering = createClusters(markers);
    // Clustering off
    // var clustering = null;

    // Move all markers
    for (var i=0;i<=1000;i++) {
        (function(ind) {
            setTimeout(function(){moveMarkers(markers, clustering);}, 200 * ind);
        })(i);
    }

}

var locations = [
    {lat: 40.741161, lng: -74.000816 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741234, lng: -74.001557 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741754, lng: -74.004228 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740405, lng: -74.003273 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740665, lng: -73.999465 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739706, lng: -73.997941 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739519, lng: -74.000623 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740559, lng: -74.003112 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.74199, lng: -74.001696 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740575, lng: -74.004464 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740299, lng: -74.003134 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739535, lng: -74.00058 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741307, lng: -74.000967 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.743648, lng: -74.001417 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.743876, lng: -74.004207 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.742689, lng: -74.006824 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741778, lng: -74.00661 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741242, lng: -74.006717 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740234, lng: -74.006352 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.7396, lng: -74.006546 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739486, lng: -74.004121 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740055, lng: -74.004571 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740348, lng: -74.003735 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740787, lng: -74.003048 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741973, lng: -74.002447 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.743225, lng: -74.002812 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.744331, lng: -74.003842 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.743518, lng: -74.005215 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.74303, lng: -74.004979 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.74251, lng: -74.00691 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740153, lng: -74.004185 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739958, lng: -74.001825 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.74012, lng: -74.000881 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740559, lng: -73.999357 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741535, lng: -73.999121 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.742624, lng: -73.999035 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.742721, lng: -74.000366 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.743177, lng: -74.002233 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.743827, lng: -74.00249 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.742364, lng: -74.001825 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739226, lng: -74.00146 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739958, lng: -74.002748 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.737226, lng: -74.002039 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739779, lng: -74.00131 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739811, lng: -74.000022 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.742006, lng: -74.002705 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739356, lng: -74.00279 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739925, lng: -74.002361 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740982, lng: -74.001696 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741778, lng: -74.000173 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740657, lng: -74.000752 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739421, lng: -74.002125 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.73921, lng: -74.003048 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739958, lng: -74.002748 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740201, lng: -74.001975 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739632, lng: -74.002426 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739681, lng: -74.002855 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.739892, lng: -74.002275 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.738072, lng: -73.998263 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.737535, lng: -73.998671 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.737568, lng: -73.998156 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.73799, lng: -73.997898 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.738364, lng: -73.998349 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740852, lng: -73.998692 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741502, lng: -73.998263 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.741518, lng: -73.997619 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740998, lng: -73.997405 , label: 'Test Label', text: 'This is a test'},
    {lat: 40.740039, lng: -74.004142 , label: 'Test Label', text: 'This is a test'},
]
