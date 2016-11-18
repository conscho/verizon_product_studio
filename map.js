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
                    instructions  = (deltaLng>=0) ? '<b>Explosion on 23rd street and 6th avenue</b><br>Head north on Xth avenue': '<b>Explosion on 23rd street and 6th avenue</b><br>Head west on Xth street';
                } else {
                    instructions  = (deltaLng>=0) ? '<b>Explosion on 23rd street and 6th avenue</b><br>Head east on Xth street': '<b>Explosion on 23rd street and 6th avenue</b><br>Head south on Xth avenue';
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
    {lat: 40.741161, lng: -74.000816 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741234, lng: -74.001557 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741754, lng: -74.004228 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740405, lng: -74.003273 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740665, lng: -73.999465 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739706, lng: -73.997941 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739519, lng: -74.000623 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740559, lng: -74.003112 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74199, lng: -74.001696 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740575, lng: -74.004464 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740299, lng: -74.003134 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739535, lng: -74.00058 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741307, lng: -74.000967 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743648, lng: -74.001417 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743876, lng: -74.004207 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742689, lng: -74.006824 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741778, lng: -74.00661 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741242, lng: -74.006717 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740234, lng: -74.006352 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7396, lng: -74.006546 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739486, lng: -74.004121 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740055, lng: -74.004571 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740348, lng: -74.003735 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740787, lng: -74.003048 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741973, lng: -74.002447 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743225, lng: -74.002812 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744331, lng: -74.003842 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743518, lng: -74.005215 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74303, lng: -74.004979 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74251, lng: -74.00691 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740153, lng: -74.004185 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739958, lng: -74.001825 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74012, lng: -74.000881 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740559, lng: -73.999357 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741535, lng: -73.999121 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742624, lng: -73.999035 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742721, lng: -74.000366 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743177, lng: -74.002233 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743827, lng: -74.00249 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742364, lng: -74.001825 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739226, lng: -74.00146 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739958, lng: -74.002748 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737226, lng: -74.002039 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739779, lng: -74.00131 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739811, lng: -74.000022 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742006, lng: -74.002705 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739356, lng: -74.00279 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739925, lng: -74.002361 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740982, lng: -74.001696 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741778, lng: -74.000173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740657, lng: -74.000752 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739421, lng: -74.002125 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73921, lng: -74.003048 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739958, lng: -74.002748 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740201, lng: -74.001975 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739632, lng: -74.002426 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739681, lng: -74.002855 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739892, lng: -74.002275 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738072, lng: -73.998263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737535, lng: -73.998671 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737568, lng: -73.998156 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73799, lng: -73.997898 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738364, lng: -73.998349 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740852, lng: -73.998692 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741502, lng: -73.998263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741518, lng: -73.997619 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740998, lng: -73.997405 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740039, lng: -74.004142 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74225, lng: -74.001889 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740835, lng: -73.999271 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739616, lng: -73.999786 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738787, lng: -74.001181 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738202, lng: -74.003434 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739535, lng: -74.005365 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741632, lng: -74.002769 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741453, lng: -74.003842 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740803, lng: -74.002962 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740965, lng: -74.000473 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741762, lng: -74.00573 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742542, lng: -74.005473 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74238, lng: -74.004786 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742494, lng: -74.006245 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741632, lng: -74.006009 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741827, lng: -73.999851 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740396, lng: -73.999679 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738819, lng: -73.999743 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739031, lng: -74.000409 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73973, lng: -74.000924 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73921, lng: -73.997126 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741486, lng: -73.995473 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739941, lng: -73.994443 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74251, lng: -73.994229 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744038, lng: -73.999078 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743518, lng: -74.002941 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744119, lng: -74.002082 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739616, lng: -74.003477 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738576, lng: -74.001074 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738185, lng: -73.999186 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737633, lng: -73.997512 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737047, lng: -73.995924 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.736462, lng: -73.994508 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735844, lng: -73.993435 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.736104, lng: -73.994207 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.736364, lng: -73.99498 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.736722, lng: -73.995709 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737275, lng: -73.996439 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7376, lng: -73.997254 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737893, lng: -73.998199 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738348, lng: -73.999443 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738608, lng: -74.000344 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739096, lng: -73.999357 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740071, lng: -73.998671 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740689, lng: -73.998241 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741404, lng: -73.997555 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74212, lng: -73.996868 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742608, lng: -73.99807 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743485, lng: -73.999701 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742705, lng: -74.00013 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741827, lng: -74.000902 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743583, lng: -73.999658 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739096, lng: -74.00249 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737795, lng: -74.004722 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.736852, lng: -74.005322 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735616, lng: -74.006696 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.734934, lng: -74.00485 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735551, lng: -74.001846 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735616, lng: -74.006696 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737795, lng: -74.000645 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739096, lng: -74.001632 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739811, lng: -74.001718 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740527, lng: -74.001589 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742152, lng: -74.000473 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741047, lng: -73.997898 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739421, lng: -73.996954 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737535, lng: -73.998156 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739193, lng: -73.999228 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740462, lng: -74.002447 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740657, lng: -74.004979 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741177, lng: -74.000688 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740429, lng: -74.001245 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739974, lng: -73.999658 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739063, lng: -73.998671 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740494, lng: -73.9994 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741567, lng: -74.002619 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739811, lng: -74.000816 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739291, lng: -74.001889 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740722, lng: -73.999786 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741177, lng: -74.000731 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739779, lng: -74.00176 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741567, lng: -74.002962 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749403, lng: -73.986225 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747192, lng: -73.987083 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747452, lng: -73.984509 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748753, lng: -73.986826 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751483, lng: -73.994894 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754214, lng: -74.002876 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753434, lng: -73.999357 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751613, lng: -73.995924 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750703, lng: -73.993006 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749468, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747777, lng: -73.984509 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.746087, lng: -73.980217 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744396, lng: -73.975925 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.746282, lng: -73.981633 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748655, lng: -73.986998 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750053, lng: -73.989916 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749403, lng: -73.993821 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749663, lng: -73.987684 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748265, lng: -73.986697 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747647, lng: -73.985624 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749468, lng: -73.986053 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750216, lng: -73.995452 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.752654, lng: -73.996396 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753467, lng: -73.992319 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.752004, lng: -73.991032 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74846, lng: -73.991761 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747842, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749208, lng: -73.993607 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749208, lng: -73.994293 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749273, lng: -73.995881 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750118, lng: -73.995066 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.745014, lng: -73.982749 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748492, lng: -73.987255 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749728, lng: -73.987298 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749923, lng: -73.983908 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74924, lng: -73.981419 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754962, lng: -73.985796 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.758895, lng: -73.985152 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762341, lng: -73.985238 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.765754, lng: -73.986955 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769199, lng: -73.988671 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761041, lng: -73.986096 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760001, lng: -73.984981 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761463, lng: -73.982663 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762601, lng: -73.983393 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760098, lng: -73.987169 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759773, lng: -73.985624 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760488, lng: -73.983521 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759253, lng: -73.986826 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757725, lng: -73.987899 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756717, lng: -73.986568 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756262, lng: -73.98777 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754799, lng: -73.9891 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755255, lng: -73.987427 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754312, lng: -73.985195 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754019, lng: -73.987556 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754344, lng: -73.987126 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755255, lng: -73.987427 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755255, lng: -73.987427 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754929, lng: -73.990903 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755905, lng: -73.990817 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756782, lng: -73.989701 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757628, lng: -73.983693 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759643, lng: -73.988585 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760423, lng: -73.987813 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759025, lng: -73.984637 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760163, lng: -73.98468 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761561, lng: -73.987813 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759968, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.758375, lng: -73.988199 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757433, lng: -73.989959 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75675, lng: -73.984208 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756392, lng: -73.98541 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755092, lng: -73.98644 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755872, lng: -73.986912 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760586, lng: -73.987899 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762569, lng: -73.9782 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762179, lng: -73.979058 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762081, lng: -73.981032 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760456, lng: -73.980603 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760001, lng: -73.980002 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757628, lng: -73.978543 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.758765, lng: -73.978715 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755092, lng: -73.955584 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713826, lng: -74.009743 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709922, lng: -74.009056 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.706018, lng: -74.009743 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.705628, lng: -74.004936 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709662, lng: -74.000988 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713696, lng: -73.99704 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7189, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720982, lng: -73.986568 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.726446, lng: -73.983307 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729568, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731779, lng: -73.989143 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727617, lng: -73.99086 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731649, lng: -73.994808 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738543, lng: -73.993435 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740234, lng: -73.99807 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735291, lng: -74.00116 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729958, lng: -74.004765 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721502, lng: -74.006824 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.70784, lng: -74.00528 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.706279, lng: -74.008026 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713045, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721892, lng: -73.985195 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.728657, lng: -73.986912 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735551, lng: -73.979359 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744916, lng: -73.980904 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75753, lng: -73.972664 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.765982, lng: -73.956699 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762471, lng: -73.973866 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.778852, lng: -73.951721 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.783141, lng: -73.952751 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.781061, lng: -73.947773 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.778592, lng: -73.954296 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753369, lng: -73.983994 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738933, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.723844, lng: -73.992062 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.724494, lng: -73.982964 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729308, lng: -73.98468 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727747, lng: -73.988972 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.722803, lng: -73.990688 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.730869, lng: -73.997383 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.725275, lng: -73.997211 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731389, lng: -74.00219 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731779, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744266, lng: -73.98983 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.728917, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713696, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713956, lng: -73.994808 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7189, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721632, lng: -73.995323 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720721, lng: -74.000473 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.715257, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714216, lng: -73.999958 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709272, lng: -74.009228 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754539, lng: -73.972321 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.773782, lng: -73.970604 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.767802, lng: -73.971977 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.763901, lng: -73.98159 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753239, lng: -73.98674 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743876, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73321, lng: -73.994637 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.725145, lng: -73.98983 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747517, lng: -73.979874 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.798997, lng: -73.947258 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.806533, lng: -73.946228 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.803675, lng: -73.955154 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754799, lng: -73.97953 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.732169, lng: -73.99498 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714216, lng: -73.988113 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.723063, lng: -73.995323 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.734251, lng: -73.997383 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.745176, lng: -73.99086 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748557, lng: -73.98571 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754799, lng: -73.973694 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.764681, lng: -73.976097 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.770662, lng: -73.959961 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.780541, lng: -73.953094 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.78964, lng: -73.945885 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.767802, lng: -73.971977 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761821, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.771182, lng: -73.9785 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.780541, lng: -73.977814 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7899, lng: -73.970947 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.776382, lng: -73.978844 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.774042, lng: -73.971634 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.792629, lng: -73.959103 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.796138, lng: -73.956356 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.773002, lng: -73.972836 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769752, lng: -73.974724 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762991, lng: -73.978329 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75818, lng: -73.981247 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751939, lng: -73.986053 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744526, lng: -73.991032 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735551, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.726055, lng: -73.992062 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.724234, lng: -73.999615 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720721, lng: -73.994122 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.722413, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.730348, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739063, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748427, lng: -73.98571 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751548, lng: -73.9785 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.745566, lng: -73.981075 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739584, lng: -73.98365 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7336, lng: -73.986225 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727617, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721892, lng: -73.986912 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.715777, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709662, lng: -73.996868 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.705238, lng: -74.006138 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714997, lng: -73.998756 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.724755, lng: -73.991375 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.734993, lng: -73.995482 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.72482, lng: -74.009142 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.710898, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714802, lng: -73.991289 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.71929, lng: -73.989658 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.718835, lng: -73.990088 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727486, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.736267, lng: -73.986826 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744201, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751679, lng: -73.987169 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75623, lng: -73.988714 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762796, lng: -73.980989 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761496, lng: -73.977642 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769817, lng: -73.978157 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.775342, lng: -73.979616 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.779567, lng: -73.981762 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.777877, lng: -73.982792 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.774627, lng: -73.98468 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769232, lng: -73.986568 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.763641, lng: -73.991718 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761496, lng: -73.973436 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.783596, lng: -73.955326 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.791069, lng: -73.949575 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749403, lng: -73.986225 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747192, lng: -73.987083 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747452, lng: -73.984509 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748753, lng: -73.986826 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751483, lng: -73.994894 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754214, lng: -74.002876 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753434, lng: -73.999357 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751613, lng: -73.995924 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750703, lng: -73.993006 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749468, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747777, lng: -73.984509 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.746087, lng: -73.980217 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744396, lng: -73.975925 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.746282, lng: -73.981633 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748655, lng: -73.986998 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750053, lng: -73.989916 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749403, lng: -73.993821 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749663, lng: -73.987684 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748265, lng: -73.986697 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747647, lng: -73.985624 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749468, lng: -73.986053 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750216, lng: -73.995452 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.752654, lng: -73.996396 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753467, lng: -73.992319 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.752004, lng: -73.991032 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74846, lng: -73.991761 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747842, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749208, lng: -73.993607 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749208, lng: -73.994293 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749273, lng: -73.995881 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750118, lng: -73.995066 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.745014, lng: -73.982749 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748492, lng: -73.987255 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749728, lng: -73.987298 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.749923, lng: -73.983908 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74924, lng: -73.981419 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754962, lng: -73.985796 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.758895, lng: -73.985152 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762341, lng: -73.985238 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.765754, lng: -73.986955 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769199, lng: -73.988671 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761041, lng: -73.986096 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760001, lng: -73.984981 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761463, lng: -73.982663 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762601, lng: -73.983393 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760098, lng: -73.987169 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759773, lng: -73.985624 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760488, lng: -73.983521 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759253, lng: -73.986826 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757725, lng: -73.987899 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756717, lng: -73.986568 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756262, lng: -73.98777 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754799, lng: -73.9891 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755255, lng: -73.987427 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754312, lng: -73.985195 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754019, lng: -73.987556 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754344, lng: -73.987126 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755255, lng: -73.987427 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755255, lng: -73.987427 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754929, lng: -73.990903 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755905, lng: -73.990817 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756782, lng: -73.989701 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757628, lng: -73.983693 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759643, lng: -73.988585 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760423, lng: -73.987813 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759025, lng: -73.984637 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760163, lng: -73.98468 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761561, lng: -73.987813 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.759968, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.758375, lng: -73.988199 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757433, lng: -73.989959 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75675, lng: -73.984208 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756392, lng: -73.98541 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755092, lng: -73.98644 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755872, lng: -73.986912 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760586, lng: -73.987899 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762569, lng: -73.9782 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762179, lng: -73.979058 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762081, lng: -73.981032 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760456, lng: -73.980603 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.760001, lng: -73.980002 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.757628, lng: -73.978543 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.758765, lng: -73.978715 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.755092, lng: -73.955584 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713826, lng: -74.009743 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709922, lng: -74.009056 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.706018, lng: -74.009743 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.705628, lng: -74.004936 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709662, lng: -74.000988 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713696, lng: -73.99704 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7189, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720982, lng: -73.986568 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.726446, lng: -73.983307 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729568, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731779, lng: -73.989143 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727617, lng: -73.99086 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731649, lng: -73.994808 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738543, lng: -73.993435 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740234, lng: -73.99807 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735291, lng: -74.00116 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729958, lng: -74.004765 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721502, lng: -74.006824 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.70784, lng: -74.00528 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.706279, lng: -74.008026 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713045, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721892, lng: -73.985195 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.728657, lng: -73.986912 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735551, lng: -73.979359 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744916, lng: -73.980904 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75753, lng: -73.972664 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.765982, lng: -73.956699 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762471, lng: -73.973866 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.778852, lng: -73.951721 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.783141, lng: -73.952751 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.781061, lng: -73.947773 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.778592, lng: -73.954296 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753369, lng: -73.983994 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.738933, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.723844, lng: -73.992062 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.724494, lng: -73.982964 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729308, lng: -73.98468 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727747, lng: -73.988972 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.722803, lng: -73.990688 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.730869, lng: -73.997383 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.725275, lng: -73.997211 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731389, lng: -74.00219 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731779, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744266, lng: -73.98983 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.728917, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713696, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713956, lng: -73.994808 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7189, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721632, lng: -73.995323 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720721, lng: -74.000473 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.715257, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714216, lng: -73.999958 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709272, lng: -74.009228 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754539, lng: -73.972321 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.773782, lng: -73.970604 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.767802, lng: -73.971977 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.763901, lng: -73.98159 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753239, lng: -73.98674 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.743876, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73321, lng: -73.994637 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.725145, lng: -73.98983 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747517, lng: -73.979874 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.798997, lng: -73.947258 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.806533, lng: -73.946228 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.803675, lng: -73.955154 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754799, lng: -73.97953 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.732169, lng: -73.99498 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714216, lng: -73.988113 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.723063, lng: -73.995323 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.734251, lng: -73.997383 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.745176, lng: -73.99086 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748557, lng: -73.98571 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754799, lng: -73.973694 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.764681, lng: -73.976097 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.770662, lng: -73.959961 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.780541, lng: -73.953094 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.78964, lng: -73.945885 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.767802, lng: -73.971977 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761821, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.771182, lng: -73.9785 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.780541, lng: -73.977814 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7899, lng: -73.970947 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.776382, lng: -73.978844 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.774042, lng: -73.971634 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.792629, lng: -73.959103 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.796138, lng: -73.956356 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.773002, lng: -73.972836 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769752, lng: -73.974724 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762991, lng: -73.978329 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75818, lng: -73.981247 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751939, lng: -73.986053 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744526, lng: -73.991032 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.735551, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.726055, lng: -73.992062 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.724234, lng: -73.999615 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720721, lng: -73.994122 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.722413, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.730348, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739063, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748427, lng: -73.98571 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751548, lng: -73.9785 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.745566, lng: -73.981075 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739584, lng: -73.98365 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7336, lng: -73.986225 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727617, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721892, lng: -73.986912 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.715777, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.709662, lng: -73.996868 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.705238, lng: -74.006138 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714997, lng: -73.998756 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.724755, lng: -73.991375 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.734993, lng: -73.995482 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.72482, lng: -74.009142 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.710898, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.714802, lng: -73.991289 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.71929, lng: -73.989658 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.718835, lng: -73.990088 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727486, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.736267, lng: -73.986826 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744201, lng: -73.988457 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751679, lng: -73.987169 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75623, lng: -73.988714 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.762796, lng: -73.980989 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761496, lng: -73.977642 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769817, lng: -73.978157 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.775342, lng: -73.979616 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.779567, lng: -73.981762 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.777877, lng: -73.982792 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.774627, lng: -73.98468 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.769232, lng: -73.986568 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.763641, lng: -73.991718 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761496, lng: -73.973436 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.783596, lng: -73.955326 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.791069, lng: -73.949575 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761171, lng: -73.980904 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.754669, lng: -73.985796 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.747972, lng: -73.991289 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74277, lng: -73.992662 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.741144, lng: -73.994637 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.733405, lng: -73.99807 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.721892, lng: -74.00176 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.707189, lng: -74.005451 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.710052, lng: -74.005451 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.717534, lng: -73.998585 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720201, lng: -73.996611 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.726055, lng: -73.993435 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73386, lng: -73.990173 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.74277, lng: -73.987169 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750573, lng: -73.98777 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.764421, lng: -73.979101 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753629, lng: -73.983307 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.761821, lng: -73.980818 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.765136, lng: -73.979959 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.767217, lng: -73.97953 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.7873, lng: -73.934212 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.787105, lng: -73.959017 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.804324, lng: -73.946829 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.814199, lng: -73.940649 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.823812, lng: -73.94125 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.831931, lng: -73.941679 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.82706, lng: -73.944855 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.822513, lng: -73.950262 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.82011, lng: -73.949318 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.814784, lng: -73.954725 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.811406, lng: -73.942022 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.802375, lng: -73.949146 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.794383, lng: -73.945026 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.785026, lng: -73.9464 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.775212, lng: -73.948288 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.765396, lng: -73.951206 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748492, lng: -73.98571 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.756165, lng: -73.994379 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748037, lng: -74.00485 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740429, lng: -73.985968 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727942, lng: -73.992748 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713565, lng: -73.996439 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713305, lng: -74.002018 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.717274, lng: -73.999014 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720787, lng: -74.000902 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.726511, lng: -73.997898 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729828, lng: -73.996782 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.733275, lng: -73.993692 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737437, lng: -73.991203 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742055, lng: -73.988714 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.746672, lng: -73.986139 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753629, lng: -73.983307 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.752816, lng: -73.987684 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.751061, lng: -73.990345 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748948, lng: -73.994379 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744949, lng: -73.999271 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.740494, lng: -73.999057 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.734836, lng: -73.997083 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.727909, lng: -73.99292 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720331, lng: -73.993435 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.719616, lng: -73.991117 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.716688, lng: -73.992233 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.713403, lng: -73.990517 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.712232, lng: -73.999701 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.712232, lng: -74.007039 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.717176, lng: -74.005365 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.722022, lng: -74.004078 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.726868, lng: -74.00279 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.729649, lng: -74.001331 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73243, lng: -73.999872 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.73521, lng: -73.998413 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.737454, lng: -73.994572 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.739746, lng: -73.990731 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.742803, lng: -73.987405 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.745859, lng: -73.984079 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.748915, lng: -73.980753 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.750451, lng: -73.979917 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.752158, lng: -73.979884 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.753865, lng: -73.979788 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.763641, lng: -73.973694 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.774562, lng: -73.970947 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.795618, lng: -73.956184 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.803675, lng: -73.944855 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.792759, lng: -73.950005 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.764161, lng: -73.970261 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.752459, lng: -73.987083 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.775862, lng: -73.953094 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.780541, lng: -73.950348 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.785741, lng: -73.947601 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.790939, lng: -73.952065 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.783921, lng: -73.973007 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.776902, lng: -73.979874 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.767802, lng: -73.971977 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.767802, lng: -73.971977 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75584, lng: -73.971977 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.744136, lng: -73.977127 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.728267, lng: -73.985367 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731909, lng: -73.989143 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.715517, lng: -73.99292 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.720721, lng: -73.99807 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.728007, lng: -73.993263 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.734511, lng: -73.995323 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.722803, lng: -73.99395 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.717079, lng: -73.985367 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.731909, lng: -73.989143 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.75688, lng: -73.9888 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.774042, lng: -73.951378 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
    {lat: 40.806014, lng: -73.947258 , label: 'Explosion on 23rd street and 6th avenue', text: 'Please avoid the area'},
]
