<script lang="ts">
  import L from 'leaflet';
  import { getFirestore, collection, getDoc, setDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
  import { initializeApp } from "firebase/app";
  import DataTable from 'datatables.net-dt';

  let map;
  let country;
  let state;
  let lat;
  let long;
  let count = 0;

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDYiTOfZ8UdCsSbK2jlC5EYz31W_ZqurPM",
    authDomain: "lh-challenge-1-afd33.firebaseapp.com",
    projectId: "lh-challenge-1-afd33",
    storageBucket: "lh-challenge-1-afd33.appspot.com",
    messagingSenderId: "691953850897",
    appId: "1:691953850897:web:e8fd770c703e52226a6fb0"
  };

  // Initialize Firebase
  let Firebase;

  if (!Firebase) {
    Firebase = initializeApp(firebaseConfig);
  };

  const db = getFirestore(Firebase);

  window.onload = function() {
    map = L.map('map', {
      closePopupOnClick: false,
    }).setView([33.272689, -10.96875], 2.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    getCountryFromGeoIP();
    showClickText();
    let table = new DataTable('#table', {
      data: [],
      columns: [
        { title: "State" },
        { title: "Country" },
        { title: "Clicks" },
      ],
      order: [[2, 'desc']],
    });
    // Add map circles for all locations in DB
    onSnapshot(collection(db, "locations"), (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            const element = data[key];
            // check if the circle is already on the map
            let exists = false;
            map.eachLayer(function (layer) {
              if (layer._latlng !== undefined) {
                if (layer._latlng.lat === element.lat && layer._latlng.lng === element.long) {
                  exists = true;
                  return false;
                }
              }
            });
            // make the radius of the circle proportional to the number of clicks
            const radius = Math.sqrt(element.count) * 10000;
            // if the circle is not on the map, add it
            if (!exists) {
              const circle = L.circle([element.lat, element.long], {radius: radius}).addTo(map)
                .bindPopup(element.state + ", " + element.country + `: ${element.count} Clicks`);
            }
            // update size of each circle
            else {
              map.eachLayer(function (layer) {
                if (layer._latlng !== undefined) {
                  if (layer._latlng.lat === element.lat && layer._latlng.lng === element.long) {
                    layer.setRadius(radius);
                    layer.setPopupContent(element.state + ", " + element.country + `: ${element.count} Clicks`);
                  }
                }
              });
            }

            // if the table does not already have the data, add it
            if (table.rows().data().toArray().filter(row => row[0] === element.state && row[1] === element.country).length === 0) {
              table.row.add([element.state, element.country, element.count]).draw();
            }
            // update the table if the data is already there, and reorder the table
            else {
              table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                const data = this.data();
                if (data[0] === element.state && data[1] === element.country) {
                  this.data([element.state, element.country, element.count]);
                  return false;
                }
              });
              table.order([2, 'desc']).draw();
            }
          }
        }
      });
    });
  }

  // add a local counter using localstorage
  if (window.localStorage.getItem('localCount') === null) {
    window.localStorage.setItem('localCount', '0')
  }

  let localCount = parseInt(window.localStorage.getItem('localCount'))

  const localIncrement = () => {
    count += 1
    window.localStorage.setItem('localCount', count.toString())
  }

  // Get count from current country in DB
  async function getCountFromDB() {
    const docRef = getDoc(doc(db, "locations", country));
    if ((await docRef).data() !== undefined && (await docRef).data()[state] !== undefined) {
      count = (await docRef).data()[state].count;
    } else {
      count = 0;
    }
  }

  // Increment count in DB
  async function increment() {
    const docRef = getDoc(doc(db, "locations", country));
    if ((await docRef).exists) {
      const currentStateData = (await docRef).data()[state];
      const updatedStateData = { ...currentStateData, count: currentStateData.count + 1 };
      const updateObj = {};
      updateObj[state] = updatedStateData;
      updateDoc(doc(db, "locations", country), updateObj);
      count = updatedStateData.count;
    }
    // update the current popup layer
    map.eachLayer(function (layer) {
      if (layer._latlng !== undefined) {
        if (layer._latlng.lat === lat && layer._latlng.lng === long) {
          layer.setPopupContent(state + ", " + country + `: ${count} Clicks`);
        }
      }
    });
}


  // Get geo location
  function getCountryFromGeoIP() {
    const requestOptions = {
      method: 'GET',
    };

    fetch(`https://api.geoapify.com/v1/ipinfo?&apiKey=7a1694e0f3234f6dad7d472e18468f57`, requestOptions)
      .then(response => response.json())
      .then(async result => {
        lat = result.location.latitude;
        long = result.location.longitude;
        country = result.country.name;
        document.getElementById('country').innerHTML = country;
        state = await getStateFromLatLng(lat, long);
        const unsub = await onSnapshot(doc(db, "locations", country), (doc) => {
          console.log("Current data: ", doc.data());
        });
        await getCountFromDB();
        map.eachLayer(function (layer) {
          if (layer._latlng !== undefined) {
            if (layer._latlng.lat === lat && layer._latlng.lng === long) {
              layer.openPopup();
            }
          }
        });
        await addOrUpdateDB();
      })
      .catch(error => console.log('error', error));

    async function getStateFromLatLng(lat, lng) {
      const response = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const state = data.address.state;
      document.getElementById('state').innerHTML = state;
      return state;
    }

    
  };

  function showClickText() {
    setTimeout(() => {
      document.getElementById('clickText').style.display = 'block';
    }, 500);
  };

  async function addOrUpdateDB() {
    if ((await getDoc(doc(db, "locations", country))).data() !== undefined) {
      const currentData = (await getDoc(doc(db, "locations", country))).data();
      updateDoc(doc(db, "locations", country), {
        [state]: {
          state: state,
          country: country,
          count: count,
          lat: lat,
          long: long,
        },
      });
    } else {
      setDoc(doc(db, "locations", country), {
        [state]: {
          state: state,
          country: country,
          count: count,
          lat: lat,
          long: long,
        },
      });
    }
  }
</script>

<button on:click={increment} on:click={localIncrement}>
  count is {localCount}
</button>
