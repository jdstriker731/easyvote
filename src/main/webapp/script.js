/* Processes data and calls functions to initialize map object */
async function showPollingLocationData() {
  const pollingLocationData = await processData();
  
  initMap(pollingLocationData);
}

/* Gets json data from datastore and processes into addresses */
const processData = () => {
  var addresses = [];
  return fetch("/list-polling-location")
  .then(response => response.json())
  .then((pollingLocations) => {
    // Get addresses parsed into strings, starbucks numbers parsed into ints
    for (pollingLocation in pollingLocations) {
      addresses.push(pollingLocations[pollingLocation].address);
    }

    return addresses;
  });
}

/* Initializes map object centered on user's address */
const initMap = (addresses) => {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 16
  });
  var infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  const geocoder = new google.maps.Geocoder(); 
  placePins(addresses, map, geocoder);
}

/* Handles user browser not supporting geolocation */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

/* Takes in list of text addresses and puts pins on map Geolocations */
const placePins = (addresses, map, geocoder) => {
  addresses.forEach((address) =>  {
    geocoder.geocode( { 'address': address }, (results, status) => {
      if(status == 'OK') {
        // Place marker
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
        console.log(results[0].geometry.location);
        console.log("OK");
      }
      else {
        alert('Geocode failed, reason: ' + status);
        console.log("Oops");
      }
    });
  });
}