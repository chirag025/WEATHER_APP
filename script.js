const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
// const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const userInfoContainer = document.querySelector(".user-info-container");
const loadingScreen = document.querySelector(".loading-container");

const notFound = document.querySelector(".not-found");


let currentTab = userTab;   // currently kis tab pr hain - user or search tab
const API_KEY = '6d9c802c59514e85891f015a29f18979';
currentTab.classList.add("current-tab");

// initially kya kaam krna pdega ??
getfromSessionStorage();

function switchTab(clickedTab){
    notFound.classList.remove('active');

    if(clickedTab != currentTab){   // if current tab and clicked tab same hai to kuch krne ki need nhi
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
    
        if(!searchForm.classList.contains("active")){
            // kya search form vala container is invisible, if YES then make it visible
            grantAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // main phle search vale tab pr tha, ab your weather tab visible krna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // ab main your weather tab pr aa gya, to weather bhi display krna pdega, so let's check local storage first for coordinates, if we have saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => { 
    // pass clicked tab as input parameter
    switchTab(userTab);
})

searchTab.addEventListener('click', () => { 
    // pass clicked tab as input parameter
    switchTab(searchTab);
})

//  check if coordinates are already present in session storage 
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // agar local coordinates nhi mile
        grantAccessContainer.classList.add("active");
    }
    else{
        // agar local coordinates mile, toh uska coordinates user-info-container pr display krna hai
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}


async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // ab hm API call krenge....but usse phle loader dikhana pdega
    // aur usse phle grant container ko invisible krna pdega

    grantAccessContainer.classList.remove('active');

    // now make loader visible
    loadingScreen.classList.add('active');
    
    // API Call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        // ab loader ko hta denge
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');

        // data me se values nikalke user info container me put in krega..
        renderWeatherInfo(data);
    } 
    catch (err) {
        loadingScreen.classList.remove('active');
        // HW    
        notFound.classList.add('active');

    }
}


// function to render weather info
function renderWeatherInfo(weatherInfo) {
    // firstly we have to fetch the elements
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const desc = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temperature = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');

    // fetch values from weatherInfo object and put into UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.main;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temperature.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`; 
}

function getLocation() {
    // first checking if geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
      } 
      else {
        // HW - show an alert for no geolocation support available
        alert("No geolocation support available!");
      }
       
}

const messageText = document.querySelector('[data-messageText]');
// Handle errors if user refuse to give location or some other error
function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
}


function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
  

const grantAccessButton = document.querySelector('[data-grantAccess]');
grantAccessButton.addEventListener('click', getLocation);


let searchInput = document.querySelector('[data-searchInput]');
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "") return;
    fetchSearchWeatherInfo(cityName);
    searchInput.value = "";
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessButton.classList.remove('active');

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if(!data.sys){
            throw data;
        }

        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');

        // data me se values nikalke user info container me put in krega..
        renderWeatherInfo(data);
    } 
    catch (err) {
        loadingScreen.classList.remove('active');
        // HW
        notFound.classList.add('active');
    }
}