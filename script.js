const api_key = "fa38d622a1fc48157b026a42eea32e30";

const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weather_img = document.querySelector('.weather-img');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const wind_speed = document.getElementById('wind-speed');
const cityCountry = document.querySelector('.city-country');

const location_not_found = document.querySelector('.location-not-found');
const weather_body = document.querySelector('.weather-body');
const statusText = document.querySelector('.status-text');
const loader = document.querySelector('.loader');
const container = document.querySelector('.container');

function showLoader(show = true, text = '') {
  loader.style.display = show ? 'inline-block' : 'none';
  statusText.textContent = text;
}

function showNotFound(show = true) {
  location_not_found.style.display = show ? 'block' : 'none';
}

function showWeatherBody(show = true) {
  weather_body.style.display = show ? 'flex' : 'none';
}

function setBackgroundForMain(condition = '') {
  const lower = condition.toLowerCase();
  container.classList.remove('bg-clear','bg-clouds','bg-rain','bg-mist','bg-snow');

  if (lower.includes('clear')) container.classList.add('bg-clear');
  else if (lower.includes('cloud')) container.classList.add('bg-clouds');
  else if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('thunder')) container.classList.add('bg-rain');
  else if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) container.classList.add('bg-mist');
  else if (lower.includes('snow')) container.classList.add('bg-snow');
  else container.classList.add('bg-clouds');
}

function pickLocalIcon(condition = '') {
  const lower = condition.toLowerCase();
  if (lower.includes('clear')) return 'assets/clear.png';
  if (lower.includes('cloud')) return 'assets/cloud.png';
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('thunder')) return 'assets/rain.png';
  if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return 'assets/mist.png';
  if (lower.includes('snow')) return 'assets/snow.png';
  return 'assets/cloud.png';
}

async function checkWeather(city) {
  if (!city || !city.trim()) {
    statusText.textContent = 'Please enter a city name';
    return;
  }

  showNotFound(false);
  showWeatherBody(false);
  showLoader(true, 'Loading weather...');

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');

    const d = await response.json();

    temperature.textContent = `${Math.round(d.main.temp)}°C`;
    description.textContent = d.weather[0].description;
    humidity.textContent = `${d.main.humidity}%`;
    wind_speed.textContent = `${d.wind.speed} Km/H`;
    cityCountry.textContent = `${d.name}, ${d.sys.country}`;

    weather_img.src = pickLocalIcon(d.weather[0].main);
    setBackgroundForMain(d.weather[0].main);

    showLoader(false);
    showWeatherBody(true);

  } catch (error) {
    showLoader(false);
    showNotFound(true);
    statusText.textContent = 'City not found. Try again!';
  }
}

searchBtn.addEventListener('click', () => {
  checkWeather(inputBox.value);
  inputBox.value = '';
});

inputBox.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkWeather(inputBox.value);
    inputBox.value = '';
  }
});
