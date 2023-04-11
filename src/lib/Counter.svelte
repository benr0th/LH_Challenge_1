<script lang="ts">
  import L from 'leaflet';
  
  if (window.localStorage.getItem('count') === null) {
    window.localStorage.setItem('count', '0')
  }

  let count = parseInt(window.localStorage.getItem('count'))

  const increment = () => {
    count += 1
    window.localStorage.setItem('count', count.toString())
  }

  function getCountryFromGeoIP() {
  // Make a request to the GeoIP API
  fetch('https://geoip-db.com/json/')
    .then(response => response.json())
    .then(data => {
      // Extract the country from the response data
      const country = data.country_name;
      
      // Use the country data to create a map or perform other actions
      // For example:
      const map = L.map('mapid').setView([data.latitude, data.longitude], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      L.marker([data.latitude, data.longitude]).addTo(map)
        .bindPopup(`You are in ${country}.`).openPopup();
    })
    .catch(error => console.error(error));
}

  
</script>

<button on:click={increment} on:click={getCountryFromGeoIP}>
  count is {count}
</button>
