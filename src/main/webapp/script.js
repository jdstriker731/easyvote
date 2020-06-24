// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License
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

function requestTranslation() {
  const text = document.getElementById('text').value;
  const languageCode = document.getElementById('language').value;

  const resultContainer = document.getElementById('result');
  resultContainer.innerText = 'Loading...';

  const params = new URLSearchParams();
  params.append('text', text);
  params.append('languageCode', languageCode);
  
  fetch('/translate', {
    method: 'POST',
    body: params
  }).then(response => response.text())
  .then((translatedMessage) => {
    resultContainer.innerText = translatedMessage;
  });
}
