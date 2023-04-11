import './app.css'
import App from './App.svelte'
import { initializeApp } from "firebase/app";

const app = new App({
  target: document.getElementById('app'),
})

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIRE_API_KEY,
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

export default app
