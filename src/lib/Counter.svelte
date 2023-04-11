<script lang="ts">
  import L from 'leaflet';

  let map;

  window.onload = function() {
    map = L.map('map', {
      closePopupOnClick: false,
    }).setView([33.272689, -10.96875], 2.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }

  if (window.localStorage.getItem('count') === null) {
    window.localStorage.setItem('count', '0')
  }

  let count = parseInt(window.localStorage.getItem('count'))

  const increment = () => {
    count += 1
    window.localStorage.setItem('count', count.toString())
  }

  function getCountryFromGeoIP() {
    const requestOptions = {
      method: 'GET',
    };

    fetch(`https://api.geoapify.com/v1/ipinfo?&apiKey=${process.env.GEO_API_KEY}`, requestOptions)
      .then(response => response.json())
      .then(async result => {
        console.log(result);
        document.getElementById('country').innerHTML = result.country.name;
        const lat = result.location.latitude;
        const long = result.location.longitude;
        const state = await getStateFromLatLng(lat, long);
        L.circle([lat, long], {radius: 100}).addTo(map)
          .bindPopup(state + ", " + result.country.name + ` ${count}`)
          .openPopup();
      })
      .catch(error => console.log('error', error));

    async function getStateFromLatLng(lat, lng) {
      const response = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`);
      const data = await response.json();
      console.log(data);
      const state = data.address.state;
      document.getElementById('state').innerHTML = state;
      return state;
    }
  };

  function showClickText() {
    setTimeout(() => {
      document.getElementById('clickText').style.display = 'block';
    }, 300);
  };
</script>

<button on:click={increment} on:click={getCountryFromGeoIP} on:click={showClickText}>
  count is {count}
</button>
