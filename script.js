 const API_KEY = '7194dfb4f9b54afd991164927240509';
    const BASE_URL = 'https://api.weatherapi.com/v1';
    
   
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    const useLocationButton = document.getElementById('useLocation');
    const currentWeatherContainer = document.querySelector('#currentWeather .weather-info');
    const forecastContainer = document.querySelector('#forecast .forecast-container');
    const historicalContainer = document.querySelector('#historicalWeather .historical-container');
    const alertsContainer = document.querySelector('#alerts .alerts-container');
    const unitToggle = document.getElementById('unitToggle');
    const themeToggle = document.getElementById('themeToggle');
    
    let units = 'metric';
    
   
    searchButton.addEventListener('click', () => getWeatherData(searchInput.value));
    useLocationButton.addEventListener('click', getUserLocation);
    unitToggle.addEventListener('click', toggleUnits);
    themeToggle.addEventListener('click', toggleTheme);
    
   
    async function getWeatherData(location) {
        try {
            const currentWeather = await fetchData(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}`);
            const forecast = await fetchData(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=3`);
            const history = await fetchData(`${BASE_URL}/history.json?key=${API_KEY}&q=${location}&dt=${getLastWeekDate()}`);
    
            displayCurrentWeather(currentWeather);
            displayForecast(forecast);
            displayHistoricalWeather(history);
            displayAlerts(forecast.alerts);

            initWeatherMap(currentWeather.location.lat, currentWeather.location.lon);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            displayError("Unable to fetch weather data. Please try again.");
        }
    }
    
    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
    
    function displayCurrentWeather(data) {
        const { location, current } = data;
        const html = `
            <h3>${location.name}, ${location.country}</h3>
            <p>Temperature: ${current.temp_c}°C / ${current.temp_f}°F</p>
            <p>Condition: ${current.condition.text}</p>
           <img src="https:${current.condition.icon}" alt="${current.condition.text}">
            <p>Humidity: ${current.humidity}%</p>
            <p>Wind: ${current.wind_kph} km/h</p>
        `;
        currentWeatherContainer.innerHTML = html;
    }
    
    function displayForecast(data) {
        const { forecast } = data;
        let html = '';
        forecast.forecastday.forEach(day => {
            html += `
                <div class="forecast-day">
                    <h4>${new Date(day.date).toLocaleDateString()}</h4>
                   <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <p>High: ${day.day.maxtemp_c}°C / ${day.day.maxtemp_f}°F</p>
                    <p>Low: ${day.day.mintemp_c}°C / ${day.day.mintemp_f}°F</p>
                    <p>${day.day.condition.text}</p>
                </div>
            `;
        });
        forecastContainer.innerHTML = html;
    }
    
    function displayHistoricalWeather(data) {
        const { forecast } = data;
        let html = '';
        forecast.forecastday.forEach(day => {
            html += `
                <div class="historical-day">
                    <h4>${new Date(day.date).toLocaleDateString()}</h4>
                    <p>Avg Temp: ${day.day.avgtemp_c}°C / ${day.day.avgtemp_f}°F</p>
                    <p>${day.day.condition.text}</p>
                </div>
            `;
        });
        historicalContainer.innerHTML = html;
    }
    
    function displayAlerts(alerts) {
        if (alerts && alerts.length > 0) {
            let html = '<ul>';
            alerts.forEach(alert => {
                html += `<li>${alert.headline}</li>`;
            });
            html += '</ul>';
            alertsContainer.innerHTML = html;
        } else {
            alertsContainer.innerHTML = '<p>No current weather alerts.</p>';
        }
    }
    
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => getWeatherData(`${position.coords.latitude},${position.coords.longitude}`),
                error => {
                    console.error('Error getting user location:', error);
                    displayError("Unable to get your location. Please enter a city manually.");
                    promptForCity();
                }
            );
        } else {
            displayError("Geolocation is not supported by this browser. Please enter a city manually.");
            promptForCity();
        }
    }
    
    function promptForCity() {
        const city = prompt("Please enter a city name:");
        if (city) {
            getWeatherData(city);
        } else {
            displayError("No city entered. Please try again.");
        }
    }
    
    function toggleUnits() {
        units = units === 'metric' ? 'imperial' : 'metric';
   
        const lastSearched = searchInput.value;
        if (lastSearched) {
            getWeatherData(lastSearched);
        }
    }
    
    function toggleTheme() {
        const body = document.body;
        const button = document.getElementById('themeToggle');
    
        body.classList.toggle('dark-theme');
    
        if (body.classList.contains('dark-theme')) {
            button.textContent = '🌞';
        } else {
            button.textContent = '🌙'; 
        }
    }
    
    
    function getLastWeekDate() {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    }
    

function initWeatherMap(lat, lon) {
    const map = L.map('map').setView([lat, lon], 10); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const weatherLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
        maxZoom: 18
    }).addTo(map);
}


    function displayError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.querySelector('.container').prepend(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
    }
    
 
    window.addEventListener('load', getUserLocation);