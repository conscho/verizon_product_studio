function initMap() {
    var markers;

    var evacuationActive = false;
    var center = new google.maps.LatLng(0,0);
    var radius = 0;

    // Global speed of dots
    var speed = 0.000005;
    var framerate = 100;

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.751809, lng: -73.958416},
        zoom: 13,
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
            clickable: false,
            editable: false,
            zIndex: 1
        }
    });

    google.maps.event.addListener(drawingManager, 'circlecomplete', function( circle ) {
        drawingManager.setMap(null);
        center = circle.getCenter();
        radius = circle.getRadius();
        evacuationActive = true;
    });

    google.maps.event.addDomListener(document.getElementById('btn-source'), 'click', drawSource);
    function drawSource() {
        if (drawingManager.map == null) {
            drawingManager.setMap(map);
            drawingManager.setOptions({
                circleOptions: {
                    fillColor: '#ff2626',
                    fillOpacity: 0.7,
                    strokeWeight: 0,
                    zIndex: 2
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
                    fillColor: '#ff0000',
                    fillOpacity: 0.3,
                    strokeWeight: 0,
                    zIndex: 1
                }
            });
        } else {
            drawingManager.setMap(null);
        }
    }

    // Moving marker demo
    function createMarker(input) {
        //var contentString = '<b>'+input.label+'</b><br>'+input.text;
        var marker = new google.maps.Marker({
            position: {lat: input.lat, lng: input.lng},
            map: map,
            direction: Math.round(Math.random()*360),
            stepSize: Math.random()*speed,
            steps: 0,
            changeDirectionAfter: Math.round(Math.random()* 100 + 50),
            changeStepSizeAfter: Math.round(Math.random()* 300 + 100),
            icon: 'images/marker.png',
            title: '<b>'+input.label+'</b><br>'+input.text
        });

        infowindow = new google.maps.InfoWindow({});

        marker.addListener('click', function() {
            infowindow.setContent(marker.title);
            infowindow.open(map, marker);
        });
        return marker;
    }

    function moveMarkerBy(marker, deltaLng = 0, deltaLat = 0) {
        if (marker.getPosition().lng() < -74.01 || marker.getPosition().lng() > -73.97) {
            marker.direction = (marker.direction + 180);
        }
        latlng = new google.maps.LatLng(marker.getPosition().lat() + deltaLat, marker.getPosition().lng() + deltaLng);
        marker.setPosition(latlng);
    }

    // Distance between to points in defined units
    function distance(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        if (unit=="M") { dist = dist * 1609.344 }
        return dist
    }

    function moveMarkers(markers, clustering, step) {
        for (var i = 0; i < markers.length; i++) {
            dist = distance(center.lat(), center.lng(), markers[i].getPosition().lat(), markers[i].getPosition().lng(), 'M')
            if (evacuationActive && (dist < radius)) {
                deltaLng = Math.sign(markers[i].getPosition().lng() - center.lng()) * speed;
                deltaLat = Math.sign(markers[i].getPosition().lat() - center.lat()) * speed;
                moveMarkerBy(markers[i], deltaLng, deltaLat);
                var instructions;
                if (deltaLat>=0) { //N
                    instructions  = (deltaLat>=0) ? 'Head towards NE': 'Head towards NW';
                } else {
                    instructions  = (deltaLng>=0) ? 'Head towards SE': 'Head towards SW';
                }
                //console.log(instructions)
                markers[i].title = instructions;
            } else {
                // Threshhold after which to change direction and speed
                if (step % markers[i].changeDirectionAfter == 0) {
                    markers[i].direction = (markers[i].direction + (Math.random() * 2 - 1) * 20) % 360;
                }
                if (step % markers[i].changeStepSizeAfter == 0) {
                    markers[i].stepSize = Math.random()*speed;
                }
                moveMarkerBy(markers[i], markers[i].stepSize * Math.sin(markers[i].direction), markers[i].stepSize * Math.sin(90 - markers[i].direction));
            }
            markers[i].steps += 1;
        }
        // Update clusters
        if (clustering) {
            clustering.repaint();
        }
    }

    //[Chris] Marker clustering
    function createClusters(markers) {
        var clusterStyles = [
            {
                textColor: 'black',
                url: 'images/m2.png',
                height: 41,
                width: 41
            },
            {
                textColor: 'black',
                url: 'images/m3.png',
                height: 56,
                width: 55
            }
        ];

        var mcOptions = {
            styles: clusterStyles
        };

        var markerCluster = new MarkerClusterer(map, markers, mcOptions);
        return markerCluster;
    }

    // Initialize markers
    var markers = locations.map(createMarker);

    // Clustering on
    var clustering = createClusters(markers);
    // Clustering off
    // var clustering = null;

    // Move all markers
    for (var i=0;i<=10000;i++) {
        (function(ind) {
            setTimeout(function(){moveMarkers(markers, clustering, ind);}, framerate * ind);
        })(i);
    }

}

var locations = [
    {lat: 40.741161, lng: -74.000816 , label: 'Test', text: 'This is a test'},
{lat: 40.741234, lng: -74.001557 , label: 'Test', text: 'This is a test'},
{lat: 40.741754, lng: -74.004228 , label: 'Test', text: 'This is a test'},
{lat: 40.740405, lng: -74.003273 , label: 'Test', text: 'This is a test'},
{lat: 40.740665, lng: -73.999465 , label: 'Test', text: 'This is a test'},
{lat: 40.739706, lng: -73.997941 , label: 'Test', text: 'This is a test'},
{lat: 40.739519, lng: -74.000623 , label: 'Test', text: 'This is a test'},
{lat: 40.740559, lng: -74.003112 , label: 'Test', text: 'This is a test'},
{lat: 40.74199, lng: -74.001696 , label: 'Test', text: 'This is a test'},
{lat: 40.740575, lng: -74.004464 , label: 'Test', text: 'This is a test'},
{lat: 40.740299, lng: -74.003134 , label: 'Test', text: 'This is a test'},
{lat: 40.739535, lng: -74.00058 , label: 'Test', text: 'This is a test'},
{lat: 40.741307, lng: -74.000967 , label: 'Test', text: 'This is a test'},
{lat: 40.743648, lng: -74.001417 , label: 'Test', text: 'This is a test'},
{lat: 40.743876, lng: -74.004207 , label: 'Test', text: 'This is a test'},
{lat: 40.742689, lng: -74.006824 , label: 'Test', text: 'This is a test'},
{lat: 40.741778, lng: -74.00661 , label: 'Test', text: 'This is a test'},
{lat: 40.741242, lng: -74.006717 , label: 'Test', text: 'This is a test'},
{lat: 40.740234, lng: -74.006352 , label: 'Test', text: 'This is a test'},
{lat: 40.7396, lng: -74.006546 , label: 'Test', text: 'This is a test'},
{lat: 40.739486, lng: -74.004121 , label: 'Test', text: 'This is a test'},
{lat: 40.740055, lng: -74.004571 , label: 'Test', text: 'This is a test'},
{lat: 40.740348, lng: -74.003735 , label: 'Test', text: 'This is a test'},
{lat: 40.740787, lng: -74.003048 , label: 'Test', text: 'This is a test'},
{lat: 40.741973, lng: -74.002447 , label: 'Test', text: 'This is a test'},
{lat: 40.743225, lng: -74.002812 , label: 'Test', text: 'This is a test'},
{lat: 40.744331, lng: -74.003842 , label: 'Test', text: 'This is a test'},
{lat: 40.743518, lng: -74.005215 , label: 'Test', text: 'This is a test'},
{lat: 40.74303, lng: -74.004979 , label: 'Test', text: 'This is a test'},
{lat: 40.74251, lng: -74.00691 , label: 'Test', text: 'This is a test'},
{lat: 40.740153, lng: -74.004185 , label: 'Test', text: 'This is a test'},
{lat: 40.739958, lng: -74.001825 , label: 'Test', text: 'This is a test'},
{lat: 40.74012, lng: -74.000881 , label: 'Test', text: 'This is a test'},
{lat: 40.740559, lng: -73.999357 , label: 'Test', text: 'This is a test'},
{lat: 40.741535, lng: -73.999121 , label: 'Test', text: 'This is a test'},
{lat: 40.742624, lng: -73.999035 , label: 'Test', text: 'This is a test'},
{lat: 40.742721, lng: -74.000366 , label: 'Test', text: 'This is a test'},
{lat: 40.743177, lng: -74.002233 , label: 'Test', text: 'This is a test'},
{lat: 40.743827, lng: -74.00249 , label: 'Test', text: 'This is a test'},
{lat: 40.742364, lng: -74.001825 , label: 'Test', text: 'This is a test'},
{lat: 40.739226, lng: -74.00146 , label: 'Test', text: 'This is a test'},
{lat: 40.739958, lng: -74.002748 , label: 'Test', text: 'This is a test'},
{lat: 40.737226, lng: -74.002039 , label: 'Test', text: 'This is a test'},
{lat: 40.739779, lng: -74.00131 , label: 'Test', text: 'This is a test'},
{lat: 40.739811, lng: -74.000022 , label: 'Test', text: 'This is a test'},
{lat: 40.742006, lng: -74.002705 , label: 'Test', text: 'This is a test'},
{lat: 40.739356, lng: -74.00279 , label: 'Test', text: 'This is a test'},
{lat: 40.739925, lng: -74.002361 , label: 'Test', text: 'This is a test'},
{lat: 40.740982, lng: -74.001696 , label: 'Test', text: 'This is a test'},
{lat: 40.741778, lng: -74.000173 , label: 'Test', text: 'This is a test'},
{lat: 40.740657, lng: -74.000752 , label: 'Test', text: 'This is a test'},
{lat: 40.739421, lng: -74.002125 , label: 'Test', text: 'This is a test'},
{lat: 40.73921, lng: -74.003048 , label: 'Test', text: 'This is a test'},
{lat: 40.739958, lng: -74.002748 , label: 'Test', text: 'This is a test'},
{lat: 40.740201, lng: -74.001975 , label: 'Test', text: 'This is a test'},
{lat: 40.739632, lng: -74.002426 , label: 'Test', text: 'This is a test'},
{lat: 40.739681, lng: -74.002855 , label: 'Test', text: 'This is a test'},
{lat: 40.739892, lng: -74.002275 , label: 'Test', text: 'This is a test'},
{lat: 40.738072, lng: -73.998263 , label: 'Test', text: 'This is a test'},
{lat: 40.737535, lng: -73.998671 , label: 'Test', text: 'This is a test'},
{lat: 40.737568, lng: -73.998156 , label: 'Test', text: 'This is a test'},
{lat: 40.73799, lng: -73.997898 , label: 'Test', text: 'This is a test'},
{lat: 40.738364, lng: -73.998349 , label: 'Test', text: 'This is a test'},
{lat: 40.740852, lng: -73.998692 , label: 'Test', text: 'This is a test'},
{lat: 40.741502, lng: -73.998263 , label: 'Test', text: 'This is a test'},
{lat: 40.741518, lng: -73.997619 , label: 'Test', text: 'This is a test'},
{lat: 40.740998, lng: -73.997405 , label: 'Test', text: 'This is a test'},
{lat: 40.740039, lng: -74.004142 , label: 'Test', text: 'This is a test'},
{lat: 40.74225, lng: -74.001889 , label: 'Test', text: 'This is a test'},
{lat: 40.740835, lng: -73.999271 , label: 'Test', text: 'This is a test'},
{lat: 40.739616, lng: -73.999786 , label: 'Test', text: 'This is a test'},
{lat: 40.738787, lng: -74.001181 , label: 'Test', text: 'This is a test'},
{lat: 40.738202, lng: -74.003434 , label: 'Test', text: 'This is a test'},
{lat: 40.739535, lng: -74.005365 , label: 'Test', text: 'This is a test'},
{lat: 40.741632, lng: -74.002769 , label: 'Test', text: 'This is a test'},
{lat: 40.741453, lng: -74.003842 , label: 'Test', text: 'This is a test'},
{lat: 40.740803, lng: -74.002962 , label: 'Test', text: 'This is a test'},
{lat: 40.740965, lng: -74.000473 , label: 'Test', text: 'This is a test'},
{lat: 40.741762, lng: -74.00573 , label: 'Test', text: 'This is a test'},
{lat: 40.742542, lng: -74.005473 , label: 'Test', text: 'This is a test'},
{lat: 40.74238, lng: -74.004786 , label: 'Test', text: 'This is a test'},
{lat: 40.742494, lng: -74.006245 , label: 'Test', text: 'This is a test'},
{lat: 40.741632, lng: -74.006009 , label: 'Test', text: 'This is a test'},
{lat: 40.741827, lng: -73.999851 , label: 'Test', text: 'This is a test'},
{lat: 40.740396, lng: -73.999679 , label: 'Test', text: 'This is a test'},
{lat: 40.738819, lng: -73.999743 , label: 'Test', text: 'This is a test'},
{lat: 40.739031, lng: -74.000409 , label: 'Test', text: 'This is a test'},
{lat: 40.73973, lng: -74.000924 , label: 'Test', text: 'This is a test'},
{lat: 40.73921, lng: -73.997126 , label: 'Test', text: 'This is a test'},
{lat: 40.741486, lng: -73.995473 , label: 'Test', text: 'This is a test'},
{lat: 40.739941, lng: -73.994443 , label: 'Test', text: 'This is a test'},
{lat: 40.74251, lng: -73.994229 , label: 'Test', text: 'This is a test'},
{lat: 40.744038, lng: -73.999078 , label: 'Test', text: 'This is a test'},
{lat: 40.743518, lng: -74.002941 , label: 'Test', text: 'This is a test'},
{lat: 40.744119, lng: -74.002082 , label: 'Test', text: 'This is a test'},
{lat: 40.739616, lng: -74.003477 , label: 'Test', text: 'This is a test'},
{lat: 40.738576, lng: -74.001074 , label: 'Test', text: 'This is a test'},
{lat: 40.738185, lng: -73.999186 , label: 'Test', text: 'This is a test'},
{lat: 40.737633, lng: -73.997512 , label: 'Test', text: 'This is a test'},
{lat: 40.737047, lng: -73.995924 , label: 'Test', text: 'This is a test'},
{lat: 40.736462, lng: -73.994508 , label: 'Test', text: 'This is a test'},
{lat: 40.735844, lng: -73.993435 , label: 'Test', text: 'This is a test'},
{lat: 40.736104, lng: -73.994207 , label: 'Test', text: 'This is a test'},
{lat: 40.736364, lng: -73.99498 , label: 'Test', text: 'This is a test'},
{lat: 40.736722, lng: -73.995709 , label: 'Test', text: 'This is a test'},
{lat: 40.737275, lng: -73.996439 , label: 'Test', text: 'This is a test'},
{lat: 40.7376, lng: -73.997254 , label: 'Test', text: 'This is a test'},
{lat: 40.737893, lng: -73.998199 , label: 'Test', text: 'This is a test'},
{lat: 40.738348, lng: -73.999443 , label: 'Test', text: 'This is a test'},
{lat: 40.738608, lng: -74.000344 , label: 'Test', text: 'This is a test'},
{lat: 40.739096, lng: -73.999357 , label: 'Test', text: 'This is a test'},
{lat: 40.740071, lng: -73.998671 , label: 'Test', text: 'This is a test'},
{lat: 40.740689, lng: -73.998241 , label: 'Test', text: 'This is a test'},
{lat: 40.741404, lng: -73.997555 , label: 'Test', text: 'This is a test'},
{lat: 40.74212, lng: -73.996868 , label: 'Test', text: 'This is a test'},
{lat: 40.742608, lng: -73.99807 , label: 'Test', text: 'This is a test'},
{lat: 40.743485, lng: -73.999701 , label: 'Test', text: 'This is a test'},
{lat: 40.742705, lng: -74.00013 , label: 'Test', text: 'This is a test'},
{lat: 40.741827, lng: -74.000902 , label: 'Test', text: 'This is a test'},
{lat: 40.743583, lng: -73.999658 , label: 'Test', text: 'This is a test'},
{lat: 40.739096, lng: -74.00249 , label: 'Test', text: 'This is a test'},
{lat: 40.737795, lng: -74.004722 , label: 'Test', text: 'This is a test'},
{lat: 40.736852, lng: -74.005322 , label: 'Test', text: 'This is a test'},
{lat: 40.735616, lng: -74.006696 , label: 'Test', text: 'This is a test'},
{lat: 40.734934, lng: -74.00485 , label: 'Test', text: 'This is a test'},
{lat: 40.735551, lng: -74.001846 , label: 'Test', text: 'This is a test'},
{lat: 40.735616, lng: -74.006696 , label: 'Test', text: 'This is a test'},
{lat: 40.737795, lng: -74.000645 , label: 'Test', text: 'This is a test'},
{lat: 40.739096, lng: -74.001632 , label: 'Test', text: 'This is a test'},
{lat: 40.739811, lng: -74.001718 , label: 'Test', text: 'This is a test'},
{lat: 40.740527, lng: -74.001589 , label: 'Test', text: 'This is a test'},
{lat: 40.742152, lng: -74.000473 , label: 'Test', text: 'This is a test'},
{lat: 40.741047, lng: -73.997898 , label: 'Test', text: 'This is a test'},
{lat: 40.739421, lng: -73.996954 , label: 'Test', text: 'This is a test'},
{lat: 40.737535, lng: -73.998156 , label: 'Test', text: 'This is a test'},
{lat: 40.739193, lng: -73.999228 , label: 'Test', text: 'This is a test'},
{lat: 40.740462, lng: -74.002447 , label: 'Test', text: 'This is a test'},
{lat: 40.740657, lng: -74.004979 , label: 'Test', text: 'This is a test'},
{lat: 40.741177, lng: -74.000688 , label: 'Test', text: 'This is a test'},
{lat: 40.740429, lng: -74.001245 , label: 'Test', text: 'This is a test'},
{lat: 40.739974, lng: -73.999658 , label: 'Test', text: 'This is a test'},
{lat: 40.739063, lng: -73.998671 , label: 'Test', text: 'This is a test'},
{lat: 40.740494, lng: -73.9994 , label: 'Test', text: 'This is a test'},
{lat: 40.741567, lng: -74.002619 , label: 'Test', text: 'This is a test'},
{lat: 40.739811, lng: -74.000816 , label: 'Test', text: 'This is a test'},
{lat: 40.739291, lng: -74.001889 , label: 'Test', text: 'This is a test'},
{lat: 40.740722, lng: -73.999786 , label: 'Test', text: 'This is a test'},
{lat: 40.741177, lng: -74.000731 , label: 'Test', text: 'This is a test'},
{lat: 40.739779, lng: -74.00176 , label: 'Test', text: 'This is a test'},
{lat: 40.741567, lng: -74.002962 , label: 'Test', text: 'This is a test'},

{lat: 40.749403, lng: -73.986225 , label: 'Test', text: 'This is a test'},
{lat: 40.747192, lng: -73.987083 , label: 'Test', text: 'This is a test'},
{lat: 40.747452, lng: -73.984509 , label: 'Test', text: 'This is a test'},
{lat: 40.748753, lng: -73.986826 , label: 'Test', text: 'This is a test'},
{lat: 40.751483, lng: -73.994894 , label: 'Test', text: 'This is a test'},
{lat: 40.754214, lng: -74.002876 , label: 'Test', text: 'This is a test'},
{lat: 40.753434, lng: -73.999357 , label: 'Test', text: 'This is a test'},
{lat: 40.751613, lng: -73.995924 , label: 'Test', text: 'This is a test'},
{lat: 40.750703, lng: -73.993006 , label: 'Test', text: 'This is a test'},
{lat: 40.749468, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.747777, lng: -73.984509 , label: 'Test', text: 'This is a test'},
{lat: 40.746087, lng: -73.980217 , label: 'Test', text: 'This is a test'},
{lat: 40.744396, lng: -73.975925 , label: 'Test', text: 'This is a test'},
{lat: 40.746282, lng: -73.981633 , label: 'Test', text: 'This is a test'},
{lat: 40.748655, lng: -73.986998 , label: 'Test', text: 'This is a test'},
{lat: 40.750053, lng: -73.989916 , label: 'Test', text: 'This is a test'},
{lat: 40.749403, lng: -73.993821 , label: 'Test', text: 'This is a test'},
{lat: 40.749663, lng: -73.987684 , label: 'Test', text: 'This is a test'},
{lat: 40.748265, lng: -73.986697 , label: 'Test', text: 'This is a test'},
{lat: 40.747647, lng: -73.985624 , label: 'Test', text: 'This is a test'},
{lat: 40.749468, lng: -73.986053 , label: 'Test', text: 'This is a test'},
{lat: 40.750216, lng: -73.995452 , label: 'Test', text: 'This is a test'},
{lat: 40.752654, lng: -73.996396 , label: 'Test', text: 'This is a test'},
{lat: 40.753467, lng: -73.992319 , label: 'Test', text: 'This is a test'},
{lat: 40.752004, lng: -73.991032 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.74846, lng: -73.991761 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.747842, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.749208, lng: -73.993607 , label: 'Test', text: 'This is a test'},
{lat: 40.749208, lng: -73.994293 , label: 'Test', text: 'This is a test'},
{lat: 40.749273, lng: -73.995881 , label: 'Test', text: 'This is a test'},
{lat: 40.750118, lng: -73.995066 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.745014, lng: -73.982749 , label: 'Test', text: 'This is a test'},
{lat: 40.748492, lng: -73.987255 , label: 'Test', text: 'This is a test'},
{lat: 40.749728, lng: -73.987298 , label: 'Test', text: 'This is a test'},
{lat: 40.749923, lng: -73.983908 , label: 'Test', text: 'This is a test'},
{lat: 40.74924, lng: -73.981419 , label: 'Test', text: 'This is a test'},
{lat: 40.754962, lng: -73.985796 , label: 'Test', text: 'This is a test'},
{lat: 40.758895, lng: -73.985152 , label: 'Test', text: 'This is a test'},
{lat: 40.762341, lng: -73.985238 , label: 'Test', text: 'This is a test'},
{lat: 40.765754, lng: -73.986955 , label: 'Test', text: 'This is a test'},
{lat: 40.769199, lng: -73.988671 , label: 'Test', text: 'This is a test'},
{lat: 40.761041, lng: -73.986096 , label: 'Test', text: 'This is a test'},
{lat: 40.760001, lng: -73.984981 , label: 'Test', text: 'This is a test'},
{lat: 40.761463, lng: -73.982663 , label: 'Test', text: 'This is a test'},
{lat: 40.762601, lng: -73.983393 , label: 'Test', text: 'This is a test'},
{lat: 40.760098, lng: -73.987169 , label: 'Test', text: 'This is a test'},
{lat: 40.759773, lng: -73.985624 , label: 'Test', text: 'This is a test'},
{lat: 40.760488, lng: -73.983521 , label: 'Test', text: 'This is a test'},
{lat: 40.759253, lng: -73.986826 , label: 'Test', text: 'This is a test'},
{lat: 40.757725, lng: -73.987899 , label: 'Test', text: 'This is a test'},
{lat: 40.756717, lng: -73.986568 , label: 'Test', text: 'This is a test'},
{lat: 40.756262, lng: -73.98777 , label: 'Test', text: 'This is a test'},
{lat: 40.754799, lng: -73.9891 , label: 'Test', text: 'This is a test'},
{lat: 40.755255, lng: -73.987427 , label: 'Test', text: 'This is a test'},
{lat: 40.754312, lng: -73.985195 , label: 'Test', text: 'This is a test'},
{lat: 40.754019, lng: -73.987556 , label: 'Test', text: 'This is a test'},
{lat: 40.754344, lng: -73.987126 , label: 'Test', text: 'This is a test'},
{lat: 40.755255, lng: -73.987427 , label: 'Test', text: 'This is a test'},
{lat: 40.755255, lng: -73.987427 , label: 'Test', text: 'This is a test'},
{lat: 40.754929, lng: -73.990903 , label: 'Test', text: 'This is a test'},
{lat: 40.755905, lng: -73.990817 , label: 'Test', text: 'This is a test'},
{lat: 40.756782, lng: -73.989701 , label: 'Test', text: 'This is a test'},
{lat: 40.757628, lng: -73.983693 , label: 'Test', text: 'This is a test'},
{lat: 40.759643, lng: -73.988585 , label: 'Test', text: 'This is a test'},
{lat: 40.760423, lng: -73.987813 , label: 'Test', text: 'This is a test'},
{lat: 40.759025, lng: -73.984637 , label: 'Test', text: 'This is a test'},
{lat: 40.760163, lng: -73.98468 , label: 'Test', text: 'This is a test'},
{lat: 40.761561, lng: -73.987813 , label: 'Test', text: 'This is a test'},
{lat: 40.759968, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.758375, lng: -73.988199 , label: 'Test', text: 'This is a test'},
{lat: 40.757433, lng: -73.989959 , label: 'Test', text: 'This is a test'},
{lat: 40.75675, lng: -73.984208 , label: 'Test', text: 'This is a test'},
{lat: 40.756392, lng: -73.98541 , label: 'Test', text: 'This is a test'},
{lat: 40.755092, lng: -73.98644 , label: 'Test', text: 'This is a test'},
{lat: 40.755872, lng: -73.986912 , label: 'Test', text: 'This is a test'},
{lat: 40.760586, lng: -73.987899 , label: 'Test', text: 'This is a test'},
{lat: 40.762569, lng: -73.9782 , label: 'Test', text: 'This is a test'},
{lat: 40.762179, lng: -73.979058 , label: 'Test', text: 'This is a test'},
{lat: 40.762081, lng: -73.981032 , label: 'Test', text: 'This is a test'},
{lat: 40.760456, lng: -73.980603 , label: 'Test', text: 'This is a test'},
{lat: 40.760001, lng: -73.980002 , label: 'Test', text: 'This is a test'},
{lat: 40.757628, lng: -73.978543 , label: 'Test', text: 'This is a test'},
{lat: 40.758765, lng: -73.978715 , label: 'Test', text: 'This is a test'},
{lat: 40.755092, lng: -73.955584 , label: 'Test', text: 'This is a test'},
{lat: 40.713826, lng: -74.009743 , label: 'Test', text: 'This is a test'},
{lat: 40.709922, lng: -74.009056 , label: 'Test', text: 'This is a test'},
{lat: 40.706018, lng: -74.009743 , label: 'Test', text: 'This is a test'},
{lat: 40.705628, lng: -74.004936 , label: 'Test', text: 'This is a test'},
{lat: 40.709662, lng: -74.000988 , label: 'Test', text: 'This is a test'},
{lat: 40.713696, lng: -73.99704 , label: 'Test', text: 'This is a test'},
{lat: 40.7189, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.720982, lng: -73.986568 , label: 'Test', text: 'This is a test'},
{lat: 40.726446, lng: -73.983307 , label: 'Test', text: 'This is a test'},
{lat: 40.729568, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.731779, lng: -73.989143 , label: 'Test', text: 'This is a test'},
{lat: 40.727617, lng: -73.99086 , label: 'Test', text: 'This is a test'},
{lat: 40.731649, lng: -73.994808 , label: 'Test', text: 'This is a test'},
{lat: 40.738543, lng: -73.993435 , label: 'Test', text: 'This is a test'},
{lat: 40.740234, lng: -73.99807 , label: 'Test', text: 'This is a test'},
{lat: 40.735291, lng: -74.00116 , label: 'Test', text: 'This is a test'},
{lat: 40.729958, lng: -74.004765 , label: 'Test', text: 'This is a test'},
{lat: 40.721502, lng: -74.006824 , label: 'Test', text: 'This is a test'},
{lat: 40.70784, lng: -74.00528 , label: 'Test', text: 'This is a test'},
{lat: 40.706279, lng: -74.008026 , label: 'Test', text: 'This is a test'},
{lat: 40.713045, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.721892, lng: -73.985195 , label: 'Test', text: 'This is a test'},
{lat: 40.728657, lng: -73.986912 , label: 'Test', text: 'This is a test'},
{lat: 40.735551, lng: -73.979359 , label: 'Test', text: 'This is a test'},
{lat: 40.744916, lng: -73.980904 , label: 'Test', text: 'This is a test'},
{lat: 40.75753, lng: -73.972664 , label: 'Test', text: 'This is a test'},
{lat: 40.765982, lng: -73.956699 , label: 'Test', text: 'This is a test'},
{lat: 40.762471, lng: -73.973866 , label: 'Test', text: 'This is a test'},
{lat: 40.778852, lng: -73.951721 , label: 'Test', text: 'This is a test'},
{lat: 40.783141, lng: -73.952751 , label: 'Test', text: 'This is a test'},
{lat: 40.781061, lng: -73.947773 , label: 'Test', text: 'This is a test'},
{lat: 40.778592, lng: -73.954296 , label: 'Test', text: 'This is a test'},
{lat: 40.753369, lng: -73.983994 , label: 'Test', text: 'This is a test'},
{lat: 40.738933, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.723844, lng: -73.992062 , label: 'Test', text: 'This is a test'},
{lat: 40.724494, lng: -73.982964 , label: 'Test', text: 'This is a test'},
{lat: 40.729308, lng: -73.98468 , label: 'Test', text: 'This is a test'},
{lat: 40.727747, lng: -73.988972 , label: 'Test', text: 'This is a test'},
{lat: 40.722803, lng: -73.990688 , label: 'Test', text: 'This is a test'},
{lat: 40.730869, lng: -73.997383 , label: 'Test', text: 'This is a test'},
{lat: 40.725275, lng: -73.997211 , label: 'Test', text: 'This is a test'},
{lat: 40.731389, lng: -74.00219 , label: 'Test', text: 'This is a test'},
{lat: 40.731779, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.744266, lng: -73.98983 , label: 'Test', text: 'This is a test'},
{lat: 40.728917, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.713696, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.713956, lng: -73.994808 , label: 'Test', text: 'This is a test'},
{lat: 40.7189, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.721632, lng: -73.995323 , label: 'Test', text: 'This is a test'},
{lat: 40.720721, lng: -74.000473 , label: 'Test', text: 'This is a test'},
{lat: 40.715257, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.714216, lng: -73.999958 , label: 'Test', text: 'This is a test'},
{lat: 40.709272, lng: -74.009228 , label: 'Test', text: 'This is a test'},
{lat: 40.754539, lng: -73.972321 , label: 'Test', text: 'This is a test'},
{lat: 40.773782, lng: -73.970604 , label: 'Test', text: 'This is a test'},
{lat: 40.767802, lng: -73.971977 , label: 'Test', text: 'This is a test'},
{lat: 40.763901, lng: -73.98159 , label: 'Test', text: 'This is a test'},
{lat: 40.753239, lng: -73.98674 , label: 'Test', text: 'This is a test'},
{lat: 40.743876, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.73321, lng: -73.994637 , label: 'Test', text: 'This is a test'},
{lat: 40.725145, lng: -73.98983 , label: 'Test', text: 'This is a test'},
{lat: 40.747517, lng: -73.979874 , label: 'Test', text: 'This is a test'},
{lat: 40.798997, lng: -73.947258 , label: 'Test', text: 'This is a test'},
{lat: 40.806533, lng: -73.946228 , label: 'Test', text: 'This is a test'},
{lat: 40.803675, lng: -73.955154 , label: 'Test', text: 'This is a test'},
{lat: 40.754799, lng: -73.97953 , label: 'Test', text: 'This is a test'},
{lat: 40.732169, lng: -73.99498 , label: 'Test', text: 'This is a test'},
{lat: 40.714216, lng: -73.988113 , label: 'Test', text: 'This is a test'},
{lat: 40.723063, lng: -73.995323 , label: 'Test', text: 'This is a test'},
{lat: 40.734251, lng: -73.997383 , label: 'Test', text: 'This is a test'},
{lat: 40.745176, lng: -73.99086 , label: 'Test', text: 'This is a test'},
{lat: 40.748557, lng: -73.98571 , label: 'Test', text: 'This is a test'},
{lat: 40.754799, lng: -73.973694 , label: 'Test', text: 'This is a test'},
{lat: 40.764681, lng: -73.976097 , label: 'Test', text: 'This is a test'},
{lat: 40.770662, lng: -73.959961 , label: 'Test', text: 'This is a test'},
{lat: 40.780541, lng: -73.953094 , label: 'Test', text: 'This is a test'},
{lat: 40.78964, lng: -73.945885 , label: 'Test', text: 'This is a test'},
{lat: 40.767802, lng: -73.971977 , label: 'Test', text: 'This is a test'},
{lat: 40.761821, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.771182, lng: -73.9785 , label: 'Test', text: 'This is a test'},
{lat: 40.780541, lng: -73.977814 , label: 'Test', text: 'This is a test'},
{lat: 40.7899, lng: -73.970947 , label: 'Test', text: 'This is a test'},
{lat: 40.776382, lng: -73.978844 , label: 'Test', text: 'This is a test'},
{lat: 40.774042, lng: -73.971634 , label: 'Test', text: 'This is a test'},
{lat: 40.792629, lng: -73.959103 , label: 'Test', text: 'This is a test'},
{lat: 40.796138, lng: -73.956356 , label: 'Test', text: 'This is a test'},
{lat: 40.773002, lng: -73.972836 , label: 'Test', text: 'This is a test'},
{lat: 40.769752, lng: -73.974724 , label: 'Test', text: 'This is a test'},
{lat: 40.762991, lng: -73.978329 , label: 'Test', text: 'This is a test'},
{lat: 40.75818, lng: -73.981247 , label: 'Test', text: 'This is a test'},
{lat: 40.751939, lng: -73.986053 , label: 'Test', text: 'This is a test'},
{lat: 40.744526, lng: -73.991032 , label: 'Test', text: 'This is a test'},
{lat: 40.735551, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.726055, lng: -73.992062 , label: 'Test', text: 'This is a test'},
{lat: 40.724234, lng: -73.999615 , label: 'Test', text: 'This is a test'},
{lat: 40.720721, lng: -73.994122 , label: 'Test', text: 'This is a test'},
{lat: 40.722413, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.730348, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.739063, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.748427, lng: -73.98571 , label: 'Test', text: 'This is a test'},
{lat: 40.751548, lng: -73.9785 , label: 'Test', text: 'This is a test'},
{lat: 40.745566, lng: -73.981075 , label: 'Test', text: 'This is a test'},
{lat: 40.739584, lng: -73.98365 , label: 'Test', text: 'This is a test'},
{lat: 40.7336, lng: -73.986225 , label: 'Test', text: 'This is a test'},
{lat: 40.727617, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.721892, lng: -73.986912 , label: 'Test', text: 'This is a test'},
{lat: 40.715777, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.709662, lng: -73.996868 , label: 'Test', text: 'This is a test'},
{lat: 40.705238, lng: -74.006138 , label: 'Test', text: 'This is a test'},
{lat: 40.714997, lng: -73.998756 , label: 'Test', text: 'This is a test'},
{lat: 40.724755, lng: -73.991375 , label: 'Test', text: 'This is a test'},
{lat: 40.734993, lng: -73.995482 , label: 'Test', text: 'This is a test'},
{lat: 40.72482, lng: -74.009142 , label: 'Test', text: 'This is a test'},
{lat: 40.710898, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.714802, lng: -73.991289 , label: 'Test', text: 'This is a test'},
{lat: 40.71929, lng: -73.989658 , label: 'Test', text: 'This is a test'},
{lat: 40.718835, lng: -73.990088 , label: 'Test', text: 'This is a test'},
{lat: 40.727486, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.736267, lng: -73.986826 , label: 'Test', text: 'This is a test'},
{lat: 40.744201, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.751679, lng: -73.987169 , label: 'Test', text: 'This is a test'},
{lat: 40.75623, lng: -73.988714 , label: 'Test', text: 'This is a test'},
{lat: 40.762796, lng: -73.980989 , label: 'Test', text: 'This is a test'},
{lat: 40.761496, lng: -73.977642 , label: 'Test', text: 'This is a test'},
{lat: 40.769817, lng: -73.978157 , label: 'Test', text: 'This is a test'},
{lat: 40.775342, lng: -73.979616 , label: 'Test', text: 'This is a test'},
{lat: 40.779567, lng: -73.981762 , label: 'Test', text: 'This is a test'},
{lat: 40.777877, lng: -73.982792 , label: 'Test', text: 'This is a test'},
{lat: 40.774627, lng: -73.98468 , label: 'Test', text: 'This is a test'},
{lat: 40.769232, lng: -73.986568 , label: 'Test', text: 'This is a test'},
{lat: 40.763641, lng: -73.991718 , label: 'Test', text: 'This is a test'},
{lat: 40.761496, lng: -73.973436 , label: 'Test', text: 'This is a test'},
{lat: 40.783596, lng: -73.955326 , label: 'Test', text: 'This is a test'},
{lat: 40.791069, lng: -73.949575 , label: 'Test', text: 'This is a test'},
{lat: 40.749403, lng: -73.986225 , label: 'Test', text: 'This is a test'},
{lat: 40.747192, lng: -73.987083 , label: 'Test', text: 'This is a test'},
{lat: 40.747452, lng: -73.984509 , label: 'Test', text: 'This is a test'},
{lat: 40.748753, lng: -73.986826 , label: 'Test', text: 'This is a test'},
{lat: 40.751483, lng: -73.994894 , label: 'Test', text: 'This is a test'},
{lat: 40.754214, lng: -74.002876 , label: 'Test', text: 'This is a test'},
{lat: 40.753434, lng: -73.999357 , label: 'Test', text: 'This is a test'},
{lat: 40.751613, lng: -73.995924 , label: 'Test', text: 'This is a test'},
{lat: 40.750703, lng: -73.993006 , label: 'Test', text: 'This is a test'},
{lat: 40.749468, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.747777, lng: -73.984509 , label: 'Test', text: 'This is a test'},
{lat: 40.746087, lng: -73.980217 , label: 'Test', text: 'This is a test'},
{lat: 40.744396, lng: -73.975925 , label: 'Test', text: 'This is a test'},
{lat: 40.746282, lng: -73.981633 , label: 'Test', text: 'This is a test'},
{lat: 40.748655, lng: -73.986998 , label: 'Test', text: 'This is a test'},
{lat: 40.750053, lng: -73.989916 , label: 'Test', text: 'This is a test'},
{lat: 40.749403, lng: -73.993821 , label: 'Test', text: 'This is a test'},
{lat: 40.749663, lng: -73.987684 , label: 'Test', text: 'This is a test'},
{lat: 40.748265, lng: -73.986697 , label: 'Test', text: 'This is a test'},
{lat: 40.747647, lng: -73.985624 , label: 'Test', text: 'This is a test'},
{lat: 40.749468, lng: -73.986053 , label: 'Test', text: 'This is a test'},
{lat: 40.750216, lng: -73.995452 , label: 'Test', text: 'This is a test'},
{lat: 40.752654, lng: -73.996396 , label: 'Test', text: 'This is a test'},
{lat: 40.753467, lng: -73.992319 , label: 'Test', text: 'This is a test'},
{lat: 40.752004, lng: -73.991032 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.74846, lng: -73.991761 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.747842, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.749208, lng: -73.993607 , label: 'Test', text: 'This is a test'},
{lat: 40.749208, lng: -73.994293 , label: 'Test', text: 'This is a test'},
{lat: 40.749273, lng: -73.995881 , label: 'Test', text: 'This is a test'},
{lat: 40.750118, lng: -73.995066 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.745014, lng: -73.982749 , label: 'Test', text: 'This is a test'},
{lat: 40.748492, lng: -73.987255 , label: 'Test', text: 'This is a test'},
{lat: 40.749728, lng: -73.987298 , label: 'Test', text: 'This is a test'},
{lat: 40.749923, lng: -73.983908 , label: 'Test', text: 'This is a test'},
{lat: 40.74924, lng: -73.981419 , label: 'Test', text: 'This is a test'},
{lat: 40.754962, lng: -73.985796 , label: 'Test', text: 'This is a test'},
{lat: 40.758895, lng: -73.985152 , label: 'Test', text: 'This is a test'},
{lat: 40.762341, lng: -73.985238 , label: 'Test', text: 'This is a test'},
{lat: 40.765754, lng: -73.986955 , label: 'Test', text: 'This is a test'},
{lat: 40.769199, lng: -73.988671 , label: 'Test', text: 'This is a test'},
{lat: 40.761041, lng: -73.986096 , label: 'Test', text: 'This is a test'},
{lat: 40.760001, lng: -73.984981 , label: 'Test', text: 'This is a test'},
{lat: 40.761463, lng: -73.982663 , label: 'Test', text: 'This is a test'},
{lat: 40.762601, lng: -73.983393 , label: 'Test', text: 'This is a test'},
{lat: 40.760098, lng: -73.987169 , label: 'Test', text: 'This is a test'},
{lat: 40.759773, lng: -73.985624 , label: 'Test', text: 'This is a test'},
{lat: 40.760488, lng: -73.983521 , label: 'Test', text: 'This is a test'},
{lat: 40.759253, lng: -73.986826 , label: 'Test', text: 'This is a test'},
{lat: 40.757725, lng: -73.987899 , label: 'Test', text: 'This is a test'},
{lat: 40.756717, lng: -73.986568 , label: 'Test', text: 'This is a test'},
{lat: 40.756262, lng: -73.98777 , label: 'Test', text: 'This is a test'},
{lat: 40.754799, lng: -73.9891 , label: 'Test', text: 'This is a test'},
{lat: 40.755255, lng: -73.987427 , label: 'Test', text: 'This is a test'},
{lat: 40.754312, lng: -73.985195 , label: 'Test', text: 'This is a test'},
{lat: 40.754019, lng: -73.987556 , label: 'Test', text: 'This is a test'},
{lat: 40.754344, lng: -73.987126 , label: 'Test', text: 'This is a test'},
{lat: 40.755255, lng: -73.987427 , label: 'Test', text: 'This is a test'},
{lat: 40.755255, lng: -73.987427 , label: 'Test', text: 'This is a test'},
{lat: 40.754929, lng: -73.990903 , label: 'Test', text: 'This is a test'},
{lat: 40.755905, lng: -73.990817 , label: 'Test', text: 'This is a test'},
{lat: 40.756782, lng: -73.989701 , label: 'Test', text: 'This is a test'},
{lat: 40.757628, lng: -73.983693 , label: 'Test', text: 'This is a test'},
{lat: 40.759643, lng: -73.988585 , label: 'Test', text: 'This is a test'},
{lat: 40.760423, lng: -73.987813 , label: 'Test', text: 'This is a test'},
{lat: 40.759025, lng: -73.984637 , label: 'Test', text: 'This is a test'},
{lat: 40.760163, lng: -73.98468 , label: 'Test', text: 'This is a test'},
{lat: 40.761561, lng: -73.987813 , label: 'Test', text: 'This is a test'},
{lat: 40.759968, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.758375, lng: -73.988199 , label: 'Test', text: 'This is a test'},
{lat: 40.757433, lng: -73.989959 , label: 'Test', text: 'This is a test'},
{lat: 40.75675, lng: -73.984208 , label: 'Test', text: 'This is a test'},
{lat: 40.756392, lng: -73.98541 , label: 'Test', text: 'This is a test'},
{lat: 40.755092, lng: -73.98644 , label: 'Test', text: 'This is a test'},
{lat: 40.755872, lng: -73.986912 , label: 'Test', text: 'This is a test'},
{lat: 40.760586, lng: -73.987899 , label: 'Test', text: 'This is a test'},
{lat: 40.762569, lng: -73.9782 , label: 'Test', text: 'This is a test'},
{lat: 40.762179, lng: -73.979058 , label: 'Test', text: 'This is a test'},
{lat: 40.762081, lng: -73.981032 , label: 'Test', text: 'This is a test'},
{lat: 40.760456, lng: -73.980603 , label: 'Test', text: 'This is a test'},
{lat: 40.760001, lng: -73.980002 , label: 'Test', text: 'This is a test'},
{lat: 40.757628, lng: -73.978543 , label: 'Test', text: 'This is a test'},
{lat: 40.758765, lng: -73.978715 , label: 'Test', text: 'This is a test'},
{lat: 40.755092, lng: -73.955584 , label: 'Test', text: 'This is a test'},
{lat: 40.713826, lng: -74.009743 , label: 'Test', text: 'This is a test'},
{lat: 40.709922, lng: -74.009056 , label: 'Test', text: 'This is a test'},
{lat: 40.706018, lng: -74.009743 , label: 'Test', text: 'This is a test'},
{lat: 40.705628, lng: -74.004936 , label: 'Test', text: 'This is a test'},
{lat: 40.709662, lng: -74.000988 , label: 'Test', text: 'This is a test'},
{lat: 40.713696, lng: -73.99704 , label: 'Test', text: 'This is a test'},
{lat: 40.7189, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.720982, lng: -73.986568 , label: 'Test', text: 'This is a test'},
{lat: 40.726446, lng: -73.983307 , label: 'Test', text: 'This is a test'},
{lat: 40.729568, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.731779, lng: -73.989143 , label: 'Test', text: 'This is a test'},
{lat: 40.727617, lng: -73.99086 , label: 'Test', text: 'This is a test'},
{lat: 40.731649, lng: -73.994808 , label: 'Test', text: 'This is a test'},
{lat: 40.738543, lng: -73.993435 , label: 'Test', text: 'This is a test'},
{lat: 40.740234, lng: -73.99807 , label: 'Test', text: 'This is a test'},
{lat: 40.735291, lng: -74.00116 , label: 'Test', text: 'This is a test'},
{lat: 40.729958, lng: -74.004765 , label: 'Test', text: 'This is a test'},
{lat: 40.721502, lng: -74.006824 , label: 'Test', text: 'This is a test'},
{lat: 40.70784, lng: -74.00528 , label: 'Test', text: 'This is a test'},
{lat: 40.706279, lng: -74.008026 , label: 'Test', text: 'This is a test'},
{lat: 40.713045, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.721892, lng: -73.985195 , label: 'Test', text: 'This is a test'},
{lat: 40.728657, lng: -73.986912 , label: 'Test', text: 'This is a test'},
{lat: 40.735551, lng: -73.979359 , label: 'Test', text: 'This is a test'},
{lat: 40.744916, lng: -73.980904 , label: 'Test', text: 'This is a test'},
{lat: 40.75753, lng: -73.972664 , label: 'Test', text: 'This is a test'},
{lat: 40.765982, lng: -73.956699 , label: 'Test', text: 'This is a test'},
{lat: 40.762471, lng: -73.973866 , label: 'Test', text: 'This is a test'},
{lat: 40.778852, lng: -73.951721 , label: 'Test', text: 'This is a test'},
{lat: 40.783141, lng: -73.952751 , label: 'Test', text: 'This is a test'},
{lat: 40.781061, lng: -73.947773 , label: 'Test', text: 'This is a test'},
{lat: 40.778592, lng: -73.954296 , label: 'Test', text: 'This is a test'},
{lat: 40.753369, lng: -73.983994 , label: 'Test', text: 'This is a test'},
{lat: 40.738933, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.723844, lng: -73.992062 , label: 'Test', text: 'This is a test'},
{lat: 40.724494, lng: -73.982964 , label: 'Test', text: 'This is a test'},
{lat: 40.729308, lng: -73.98468 , label: 'Test', text: 'This is a test'},
{lat: 40.727747, lng: -73.988972 , label: 'Test', text: 'This is a test'},
{lat: 40.722803, lng: -73.990688 , label: 'Test', text: 'This is a test'},
{lat: 40.730869, lng: -73.997383 , label: 'Test', text: 'This is a test'},
{lat: 40.725275, lng: -73.997211 , label: 'Test', text: 'This is a test'},
{lat: 40.731389, lng: -74.00219 , label: 'Test', text: 'This is a test'},
{lat: 40.731779, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.744266, lng: -73.98983 , label: 'Test', text: 'This is a test'},
{lat: 40.728917, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.713696, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.713956, lng: -73.994808 , label: 'Test', text: 'This is a test'},
{lat: 40.7189, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.721632, lng: -73.995323 , label: 'Test', text: 'This is a test'},
{lat: 40.720721, lng: -74.000473 , label: 'Test', text: 'This is a test'},
{lat: 40.715257, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.714216, lng: -73.999958 , label: 'Test', text: 'This is a test'},
{lat: 40.709272, lng: -74.009228 , label: 'Test', text: 'This is a test'},
{lat: 40.754539, lng: -73.972321 , label: 'Test', text: 'This is a test'},
{lat: 40.773782, lng: -73.970604 , label: 'Test', text: 'This is a test'},
{lat: 40.767802, lng: -73.971977 , label: 'Test', text: 'This is a test'},
{lat: 40.763901, lng: -73.98159 , label: 'Test', text: 'This is a test'},
{lat: 40.753239, lng: -73.98674 , label: 'Test', text: 'This is a test'},
{lat: 40.743876, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.73321, lng: -73.994637 , label: 'Test', text: 'This is a test'},
{lat: 40.725145, lng: -73.98983 , label: 'Test', text: 'This is a test'},
{lat: 40.747517, lng: -73.979874 , label: 'Test', text: 'This is a test'},
{lat: 40.798997, lng: -73.947258 , label: 'Test', text: 'This is a test'},
{lat: 40.806533, lng: -73.946228 , label: 'Test', text: 'This is a test'},
{lat: 40.803675, lng: -73.955154 , label: 'Test', text: 'This is a test'},
{lat: 40.754799, lng: -73.97953 , label: 'Test', text: 'This is a test'},
{lat: 40.732169, lng: -73.99498 , label: 'Test', text: 'This is a test'},
{lat: 40.714216, lng: -73.988113 , label: 'Test', text: 'This is a test'},
{lat: 40.723063, lng: -73.995323 , label: 'Test', text: 'This is a test'},
{lat: 40.734251, lng: -73.997383 , label: 'Test', text: 'This is a test'},
{lat: 40.745176, lng: -73.99086 , label: 'Test', text: 'This is a test'},
{lat: 40.748557, lng: -73.98571 , label: 'Test', text: 'This is a test'},
{lat: 40.754799, lng: -73.973694 , label: 'Test', text: 'This is a test'},
{lat: 40.764681, lng: -73.976097 , label: 'Test', text: 'This is a test'},
{lat: 40.770662, lng: -73.959961 , label: 'Test', text: 'This is a test'},
{lat: 40.780541, lng: -73.953094 , label: 'Test', text: 'This is a test'},
{lat: 40.78964, lng: -73.945885 , label: 'Test', text: 'This is a test'},
{lat: 40.767802, lng: -73.971977 , label: 'Test', text: 'This is a test'},
{lat: 40.761821, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.771182, lng: -73.9785 , label: 'Test', text: 'This is a test'},
{lat: 40.780541, lng: -73.977814 , label: 'Test', text: 'This is a test'},
{lat: 40.7899, lng: -73.970947 , label: 'Test', text: 'This is a test'},
{lat: 40.776382, lng: -73.978844 , label: 'Test', text: 'This is a test'},
{lat: 40.774042, lng: -73.971634 , label: 'Test', text: 'This is a test'},
{lat: 40.792629, lng: -73.959103 , label: 'Test', text: 'This is a test'},
{lat: 40.796138, lng: -73.956356 , label: 'Test', text: 'This is a test'},
{lat: 40.773002, lng: -73.972836 , label: 'Test', text: 'This is a test'},
{lat: 40.769752, lng: -73.974724 , label: 'Test', text: 'This is a test'},
{lat: 40.762991, lng: -73.978329 , label: 'Test', text: 'This is a test'},
{lat: 40.75818, lng: -73.981247 , label: 'Test', text: 'This is a test'},
{lat: 40.751939, lng: -73.986053 , label: 'Test', text: 'This is a test'},
{lat: 40.744526, lng: -73.991032 , label: 'Test', text: 'This is a test'},
{lat: 40.735551, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.726055, lng: -73.992062 , label: 'Test', text: 'This is a test'},
{lat: 40.724234, lng: -73.999615 , label: 'Test', text: 'This is a test'},
{lat: 40.720721, lng: -73.994122 , label: 'Test', text: 'This is a test'},
{lat: 40.722413, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.730348, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.739063, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.748427, lng: -73.98571 , label: 'Test', text: 'This is a test'},
{lat: 40.751548, lng: -73.9785 , label: 'Test', text: 'This is a test'},
{lat: 40.745566, lng: -73.981075 , label: 'Test', text: 'This is a test'},
{lat: 40.739584, lng: -73.98365 , label: 'Test', text: 'This is a test'},
{lat: 40.7336, lng: -73.986225 , label: 'Test', text: 'This is a test'},
{lat: 40.727617, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.721892, lng: -73.986912 , label: 'Test', text: 'This is a test'},
{lat: 40.715777, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.709662, lng: -73.996868 , label: 'Test', text: 'This is a test'},
{lat: 40.705238, lng: -74.006138 , label: 'Test', text: 'This is a test'},
{lat: 40.714997, lng: -73.998756 , label: 'Test', text: 'This is a test'},
{lat: 40.724755, lng: -73.991375 , label: 'Test', text: 'This is a test'},
{lat: 40.734993, lng: -73.995482 , label: 'Test', text: 'This is a test'},
{lat: 40.72482, lng: -74.009142 , label: 'Test', text: 'This is a test'},
{lat: 40.710898, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.714802, lng: -73.991289 , label: 'Test', text: 'This is a test'},
{lat: 40.71929, lng: -73.989658 , label: 'Test', text: 'This is a test'},
{lat: 40.718835, lng: -73.990088 , label: 'Test', text: 'This is a test'},
{lat: 40.727486, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.736267, lng: -73.986826 , label: 'Test', text: 'This is a test'},
{lat: 40.744201, lng: -73.988457 , label: 'Test', text: 'This is a test'},
{lat: 40.751679, lng: -73.987169 , label: 'Test', text: 'This is a test'},
{lat: 40.75623, lng: -73.988714 , label: 'Test', text: 'This is a test'},
{lat: 40.762796, lng: -73.980989 , label: 'Test', text: 'This is a test'},
{lat: 40.761496, lng: -73.977642 , label: 'Test', text: 'This is a test'},
{lat: 40.769817, lng: -73.978157 , label: 'Test', text: 'This is a test'},
{lat: 40.775342, lng: -73.979616 , label: 'Test', text: 'This is a test'},
{lat: 40.779567, lng: -73.981762 , label: 'Test', text: 'This is a test'},
{lat: 40.777877, lng: -73.982792 , label: 'Test', text: 'This is a test'},
{lat: 40.774627, lng: -73.98468 , label: 'Test', text: 'This is a test'},
{lat: 40.769232, lng: -73.986568 , label: 'Test', text: 'This is a test'},
{lat: 40.763641, lng: -73.991718 , label: 'Test', text: 'This is a test'},
{lat: 40.761496, lng: -73.973436 , label: 'Test', text: 'This is a test'},
{lat: 40.783596, lng: -73.955326 , label: 'Test', text: 'This is a test'},
{lat: 40.791069, lng: -73.949575 , label: 'Test', text: 'This is a test'},
{lat: 40.761171, lng: -73.980904 , label: 'Test', text: 'This is a test'},
{lat: 40.754669, lng: -73.985796 , label: 'Test', text: 'This is a test'},
{lat: 40.747972, lng: -73.991289 , label: 'Test', text: 'This is a test'},
{lat: 40.74277, lng: -73.992662 , label: 'Test', text: 'This is a test'},
{lat: 40.741144, lng: -73.994637 , label: 'Test', text: 'This is a test'},
{lat: 40.733405, lng: -73.99807 , label: 'Test', text: 'This is a test'},
{lat: 40.721892, lng: -74.00176 , label: 'Test', text: 'This is a test'},
{lat: 40.707189, lng: -74.005451 , label: 'Test', text: 'This is a test'},
{lat: 40.710052, lng: -74.005451 , label: 'Test', text: 'This is a test'},
{lat: 40.717534, lng: -73.998585 , label: 'Test', text: 'This is a test'},
{lat: 40.720201, lng: -73.996611 , label: 'Test', text: 'This is a test'},
{lat: 40.726055, lng: -73.993435 , label: 'Test', text: 'This is a test'},
{lat: 40.73386, lng: -73.990173 , label: 'Test', text: 'This is a test'},
{lat: 40.74277, lng: -73.987169 , label: 'Test', text: 'This is a test'},
{lat: 40.750573, lng: -73.98777 , label: 'Test', text: 'This is a test'},
{lat: 40.764421, lng: -73.979101 , label: 'Test', text: 'This is a test'},
{lat: 40.753629, lng: -73.983307 , label: 'Test', text: 'This is a test'},
{lat: 40.761821, lng: -73.980818 , label: 'Test', text: 'This is a test'},
{lat: 40.765136, lng: -73.979959 , label: 'Test', text: 'This is a test'},
{lat: 40.767217, lng: -73.97953 , label: 'Test', text: 'This is a test'},
{lat: 40.7873, lng: -73.934212 , label: 'Test', text: 'This is a test'},
{lat: 40.787105, lng: -73.959017 , label: 'Test', text: 'This is a test'},
{lat: 40.804324, lng: -73.946829 , label: 'Test', text: 'This is a test'},
{lat: 40.814199, lng: -73.940649 , label: 'Test', text: 'This is a test'},
{lat: 40.823812, lng: -73.94125 , label: 'Test', text: 'This is a test'},
{lat: 40.831931, lng: -73.941679 , label: 'Test', text: 'This is a test'},
{lat: 40.82706, lng: -73.944855 , label: 'Test', text: 'This is a test'},
{lat: 40.822513, lng: -73.950262 , label: 'Test', text: 'This is a test'},
{lat: 40.82011, lng: -73.949318 , label: 'Test', text: 'This is a test'},
{lat: 40.814784, lng: -73.954725 , label: 'Test', text: 'This is a test'},
{lat: 40.811406, lng: -73.942022 , label: 'Test', text: 'This is a test'},
{lat: 40.802375, lng: -73.949146 , label: 'Test', text: 'This is a test'},
{lat: 40.794383, lng: -73.945026 , label: 'Test', text: 'This is a test'},
{lat: 40.785026, lng: -73.9464 , label: 'Test', text: 'This is a test'},
{lat: 40.775212, lng: -73.948288 , label: 'Test', text: 'This is a test'},
{lat: 40.765396, lng: -73.951206 , label: 'Test', text: 'This is a test'},
{lat: 40.748492, lng: -73.98571 , label: 'Test', text: 'This is a test'},
{lat: 40.756165, lng: -73.994379 , label: 'Test', text: 'This is a test'},
{lat: 40.748037, lng: -74.00485 , label: 'Test', text: 'This is a test'},
{lat: 40.740429, lng: -73.985968 , label: 'Test', text: 'This is a test'},
{lat: 40.727942, lng: -73.992748 , label: 'Test', text: 'This is a test'},
{lat: 40.713565, lng: -73.996439 , label: 'Test', text: 'This is a test'},
{lat: 40.713305, lng: -74.002018 , label: 'Test', text: 'This is a test'},
{lat: 40.717274, lng: -73.999014 , label: 'Test', text: 'This is a test'},
{lat: 40.720787, lng: -74.000902 , label: 'Test', text: 'This is a test'},
{lat: 40.726511, lng: -73.997898 , label: 'Test', text: 'This is a test'},
{lat: 40.729828, lng: -73.996782 , label: 'Test', text: 'This is a test'},
{lat: 40.733275, lng: -73.993692 , label: 'Test', text: 'This is a test'},
{lat: 40.737437, lng: -73.991203 , label: 'Test', text: 'This is a test'},
{lat: 40.742055, lng: -73.988714 , label: 'Test', text: 'This is a test'},
{lat: 40.746672, lng: -73.986139 , label: 'Test', text: 'This is a test'},
{lat: 40.753629, lng: -73.983307 , label: 'Test', text: 'This is a test'},
{lat: 40.752816, lng: -73.987684 , label: 'Test', text: 'This is a test'},
{lat: 40.751061, lng: -73.990345 , label: 'Test', text: 'This is a test'},
{lat: 40.748948, lng: -73.994379 , label: 'Test', text: 'This is a test'},
{lat: 40.744949, lng: -73.999271 , label: 'Test', text: 'This is a test'},
{lat: 40.740494, lng: -73.999057 , label: 'Test', text: 'This is a test'},
{lat: 40.734836, lng: -73.997083 , label: 'Test', text: 'This is a test'},
{lat: 40.727909, lng: -73.99292 , label: 'Test', text: 'This is a test'},
{lat: 40.720331, lng: -73.993435 , label: 'Test', text: 'This is a test'},
{lat: 40.719616, lng: -73.991117 , label: 'Test', text: 'This is a test'},
{lat: 40.716688, lng: -73.992233 , label: 'Test', text: 'This is a test'},
{lat: 40.713403, lng: -73.990517 , label: 'Test', text: 'This is a test'},
{lat: 40.712232, lng: -73.999701 , label: 'Test', text: 'This is a test'},
{lat: 40.712232, lng: -74.007039 , label: 'Test', text: 'This is a test'},
{lat: 40.717176, lng: -74.005365 , label: 'Test', text: 'This is a test'},
{lat: 40.722022, lng: -74.004078 , label: 'Test', text: 'This is a test'},
{lat: 40.726868, lng: -74.00279 , label: 'Test', text: 'This is a test'},
{lat: 40.729649, lng: -74.001331 , label: 'Test', text: 'This is a test'},
{lat: 40.73243, lng: -73.999872 , label: 'Test', text: 'This is a test'},
{lat: 40.73521, lng: -73.998413 , label: 'Test', text: 'This is a test'},
{lat: 40.737454, lng: -73.994572 , label: 'Test', text: 'This is a test'},
{lat: 40.739746, lng: -73.990731 , label: 'Test', text: 'This is a test'},
{lat: 40.742803, lng: -73.987405 , label: 'Test', text: 'This is a test'},
{lat: 40.745859, lng: -73.984079 , label: 'Test', text: 'This is a test'},
{lat: 40.748915, lng: -73.980753 , label: 'Test', text: 'This is a test'},
{lat: 40.750451, lng: -73.979917 , label: 'Test', text: 'This is a test'},
{lat: 40.752158, lng: -73.979884 , label: 'Test', text: 'This is a test'},
{lat: 40.753865, lng: -73.979788 , label: 'Test', text: 'This is a test'},
{lat: 40.763641, lng: -73.973694 , label: 'Test', text: 'This is a test'},
{lat: 40.774562, lng: -73.970947 , label: 'Test', text: 'This is a test'},
{lat: 40.795618, lng: -73.956184 , label: 'Test', text: 'This is a test'},
{lat: 40.803675, lng: -73.944855 , label: 'Test', text: 'This is a test'},
{lat: 40.792759, lng: -73.950005 , label: 'Test', text: 'This is a test'},
{lat: 40.764161, lng: -73.970261 , label: 'Test', text: 'This is a test'},
{lat: 40.752459, lng: -73.987083 , label: 'Test', text: 'This is a test'},
{lat: 40.775862, lng: -73.953094 , label: 'Test', text: 'This is a test'},
{lat: 40.780541, lng: -73.950348 , label: 'Test', text: 'This is a test'},
{lat: 40.785741, lng: -73.947601 , label: 'Test', text: 'This is a test'},
{lat: 40.790939, lng: -73.952065 , label: 'Test', text: 'This is a test'},
{lat: 40.783921, lng: -73.973007 , label: 'Test', text: 'This is a test'},
{lat: 40.776902, lng: -73.979874 , label: 'Test', text: 'This is a test'},
{lat: 40.767802, lng: -73.971977 , label: 'Test', text: 'This is a test'},
{lat: 40.767802, lng: -73.971977 , label: 'Test', text: 'This is a test'},
{lat: 40.75584, lng: -73.971977 , label: 'Test', text: 'This is a test'},
{lat: 40.744136, lng: -73.977127 , label: 'Test', text: 'This is a test'},
{lat: 40.728267, lng: -73.985367 , label: 'Test', text: 'This is a test'},
{lat: 40.731909, lng: -73.989143 , label: 'Test', text: 'This is a test'},
{lat: 40.715517, lng: -73.99292 , label: 'Test', text: 'This is a test'},
{lat: 40.720721, lng: -73.99807 , label: 'Test', text: 'This is a test'},
{lat: 40.728007, lng: -73.993263 , label: 'Test', text: 'This is a test'},
{lat: 40.734511, lng: -73.995323 , label: 'Test', text: 'This is a test'},
{lat: 40.722803, lng: -73.99395 , label: 'Test', text: 'This is a test'},
{lat: 40.717079, lng: -73.985367 , label: 'Test', text: 'This is a test'},
{lat: 40.731909, lng: -73.989143 , label: 'Test', text: 'This is a test'},
{lat: 40.75688, lng: -73.9888 , label: 'Test', text: 'This is a test'},
{lat: 40.774042, lng: -73.951378 , label: 'Test', text: 'This is a test'},
{lat: 40.806014, lng: -73.947258 , label: 'Test', text: 'This is a test'},
]
