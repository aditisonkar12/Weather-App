const api_key = "fa38d622a1fc48157b026a42eea32e30";
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`;

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
  const lower = (condition || '').toLowerCase();
  container.classList.remove('bg-clear','bg-clouds','bg-rain','bg-mist','bg-snow');

  if (lower.includes('clear')) container.classList.add('bg-clear');
  else if (lower.includes('cloud')) container.classList.add('bg-clouds');
  else if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('thunder')) container.classList.add('bg-rain');
  else if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) container.classList.add('bg-mist');
  else if (lower.includes('snow')) container.classList.add('bg-snow');
  else container.classList.add('bg-clouds');
}

function pickLocalIcon(condition = '') {
  const lower = (condition || '').toLowerCase();
  if (lower.includes('clear')) return 'assets/clear.png';
  if (lower.includes('cloud')) return 'assets/cloud.png';
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('thunder')) return 'assets/rain.png';
  if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return 'assets/mist.png';
  if (lower.includes('snow')) return 'assets/snow.png';
  return 'assets/cloud.png';
}

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return { error: true, status: res.status, ok: false, data: null };
    }
    const data = await res.json();
    return { error: false, ok: true, data };
  } catch (err) {
    return { error: true, ok: false, message: err.message || 'fetch error' };
  }
}

async function fetchOpenWeather(city) {
  if (!OPENWEATHER_API_KEY) return { ok: false, error: true, message: 'No OpenWeather key' };

  const q = encodeURIComponent(city.trim());
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const result = await fetchJSON(url);
  if (result.ok && result.data) return { ok: true, source: 'openweather', data: result.data };
  return { ok: false, source: 'openweather', result };
}

async function fetchWeatherAPIcom(city) {
  if (!WEATHERAPI_KEY) return { ok: false, error: true, message: 'No WeatherAPI key' };

  const q = encodeURIComponent(city.trim());
  const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${q}&aqi=no`;
  const result = await fetchJSON(url);
  if (result.ok && result.data) return { ok: true, source: 'weatherapi', data: result.data };
  return { ok: false, source: 'weatherapi', result };
}

async function checkWeather(city) {
  if (!city || !city.trim()) {
    statusText.textContent = 'Please enter a city name';
    return;
  }

  showNotFound(false);
  showWeatherBody(false);
  showLoader(true, 'Fetching weather...');

  const primary = await fetchOpenWeather(city);

  let final = null;

  if (primary.ok) {
    final = { source: primary.source, payload: primary.data };
  } else {
    statusText.textContent = 'Primary API failed, trying fallback...';
    const fallback = await fetchWeatherAPIcom(city);
    if (fallback.ok) final = { source: fallback.source, payload: fallback.data };
    else {
      showLoader(false);
      showNotFound(true);
      statusText.textContent = 'Could not fetch weather data. Check your API keys or try later.';
      return;
    }
  }

  showLoader(false);
  showNotFound(false);

  if (final.source === 'openweather') {
    const d = final.payload;
    if (d.cod === '404' || d.cod === 404) {
      showNotFound(true);
      statusText.textContent = 'Location not found';
      return;
    }

    const temp = Math.round(d.main.temp); 
    const descr = d.weather[0].description || '';
    const mainCond = d.weather[0].main || descr;
    const hum = d.main.humidity;
    const wind = d.wind && d.wind.speed ? d.wind.speed : '--';
    const country = d.sys && d.sys.country ? d.sys.country : '';
    const cityName = d.name || city;

    temperature.textContent = `${temp}°C`;
    description.textContent = descr;
    humidity.textContent = `${hum}%`;
    wind_speed.textContent = `${wind} Km/H`;
    cityCountry.textContent = `${cityName}${country ? ', ' + country : ''}`;

    weather_img.src = pickLocalIcon(mainCond);
    weather_img.alt = mainCond;
    setBackgroundForMain(mainCond);
    showWeatherBody(true);

  } else if (final.source === 'weatherapi') {
    const d = final.payload;
    const temp = Math.round(d.current.temp_c);
    const descr = d.current.condition && d.current.condition.text ? d.current.condition.text : '';
    const hum = d.current.humidity;
    const wind = d.current.wind_kph ? Math.round(d.current.wind_kph) : '--';
    const cityName = d.location && d.location.name ? d.location.name : city;
    const country = d.location && d.location.country ? d.location.country : '';

    temperature.textContent = `${temp}°C`;
    description.textContent = descr;
    humidity.textContent = `${hum}%`;
    wind_speed.textContent = `${wind} Km/H`;
    cityCountry.textContent = `${cityName}${country ? ', ' + country : ''}`;

    weather_img.src = pickLocalIcon(descr);
    weather_img.alt = descr;
    setBackgroundForMain(descr);
    showWeatherBody(true);
  }
}

searchBtn.addEventListener('click', () => {
  const city = inputBox.value;
  checkWeather(city);
  inputBox.value = '';
});

inputBox.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    const city = inputBox.value;
    checkWeather(city);
    inputBox.value = '';
  }
});


