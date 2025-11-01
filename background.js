// Function to update the badge with fee text
function updateBadge(feeText) {
  console.log('updateBadge called with feeText:', feeText);
  try {
    let temperatureText;
    if (feeText === 'Error') {
      temperatureText = 'Err';
    } else {
      const numTemp = parseFloat(feeText);
      temperatureText = numTemp.toFixed(0) + '°'; // Display temperature with degree symbol
    }

    chrome.action.setBadgeText({ text: temperatureText });
    chrome.action.setBadgeBackgroundColor({ color: '#222222' }); // Dark grey
    console.log('Badge updated with:', temperatureText);
  } catch (error) {
    console.error('Error updating badge:', error);
    chrome.action.setBadgeText({ text: 'Err' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }); // Red for error
  }
}

const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';

function fetchWeatherData(forceUpdate = false) {
  console.log('fetchWeatherData called');
  chrome.storage.sync.get(['weatherApiKey', 'city'], (data) => {
    const WEATHER_API_KEY = data.weatherApiKey;
    const CITY = data.city;

    if (!WEATHER_API_KEY) {
      console.error('WeatherAPI.com API Key not set. Please set it in the extension options.');
      updateBadge('Key?');
      return;
    }

    if (!CITY) {
      console.error('City not set. Please set it in the extension options.');
      updateBadge('City?');
      return;
    }

    chrome.storage.local.get(['temperature', 'lastUpdate'], (result) => {
      console.log('Storage data retrieved:', result);

      const now = Date.now();
      const lastUpdate = result.lastUpdate || 0;

      console.log('Current time:', now, 'Last update:', lastUpdate);

      if ((now - lastUpdate > 30 * 60 * 1000) || forceUpdate) {
        console.log('Fetching new weather data for city:', CITY);
        getWeather(WEATHER_API_KEY, CITY);
      } else if (result.temperature && result.feelsLike && result.conditionText && result.cloudCoverage && result.uvIndex) {
        console.log('Using cached weather data:', result.temperature);
        updateBadge(result.temperature);
        updateActionTitle(result.temperature, result.feelsLike, result.conditionText, result.cloudCoverage, result.uvIndex);
      } else {
        console.log('No complete cached weather data available, fetching new data.');
        getWeather(WEATHER_API_KEY, CITY); // Fetch new data if cached data is incomplete
      }
    });
  });
}

function getWeather(apiKey, city) {
  const url = `${WEATHER_API_URL}?key=${apiKey}&q=${city}`;
  fetch(url)
    .then(response => {
      console.log('Weather API response status:', response.status);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Weather API response data:', data);
      const newTemperature = data.current.temp_c;
      const weatherConditionCode = data.current.condition.code; // Assuming WeatherAPI provides a code
      const isDay = data.current.is_day; // 1 for day, 0 for night

      console.log('New temperature:', newTemperature);
      console.log('Weather condition code:', weatherConditionCode);
      console.log('Is day:', isDay);

      const feelsLike = data.current.feelslike_c;
      const conditionText = data.current.condition.text;
      const cloudCoverage = data.current.cloud;
      const uvIndex = data.current.uv;

      chrome.storage.local.set({
        temperature: newTemperature,
        lastUpdate: Date.now(),
        feelsLike: feelsLike,
        conditionText: conditionText,
        cloudCoverage: cloudCoverage,
        uvIndex: uvIndex
      }, () => {
        console.log('Weather data saved to storage');
      });
      updateBadge(newTemperature);
      updateIcon(weatherConditionCode, isDay);
      updateActionTitle(newTemperature, feelsLike, conditionText, cloudCoverage, uvIndex);
    })
    .catch(error => {
      console.error('Fetch weather error:', error);
      updateBadge('Error');
      updateIcon(null, null); // Set a default error icon
    });
}

const weatherIconMap = {
  // Clear
  1000: { day: 'clear-day', night: 'clear-night' },
  // Cloudy
  1003: { day: 'cloudy-1-day', night: 'cloudy-1-night' }, // Partly cloudy
  1006: { day: 'cloudy-2-day', night: 'cloudy-2-night' }, // Cloudy
  1009: { day: 'cloudy-3-day', night: 'cloudy-3-night' }, // Overcast
  // Fog
  1030: { day: 'fog-day', night: 'fog-night' }, // Mist
  1135: { day: 'fog-day', night: 'fog-night' }, // Fog
  1147: { day: 'fog-day', night: 'fog-night' }, // Freezing fog
  // Rain
  1063: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Patchy light drizzle
  1072: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Patchy light drizzle
  1150: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Patchy light drizzle
  1153: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Light drizzle
  1168: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Freezing drizzle
  1171: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Heavy freezing drizzle
  1180: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Patchy light rain
  1183: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Light rain
  1186: { day: 'rainy-2-day', night: 'rainy-2-night' }, // Moderate rain at times
  1189: { day: 'rainy-2-day', night: 'rainy-2-night' }, // Moderate rain
  1192: { day: 'rainy-3-day', night: 'rainy-3-night' }, // Heavy rain at times
  1195: { day: 'rainy-3-day', night: 'rainy-3-night' }, // Heavy rain
  1204: { day: 'rain-and-sleet-mix', night: 'rain-and-sleet-mix' }, // Light sleet
  1207: { day: 'rain-and-sleet-mix', night: 'rain-and-sleet-mix' }, // Moderate or heavy sleet
  1240: { day: 'rainy-1-day', night: 'rainy-1-night' }, // Light rain shower
  1243: { day: 'rainy-2-day', night: 'rainy-2-night' }, // Moderate or heavy rain shower
  1246: { day: 'rainy-3-day', night: 'rainy-3-night' }, // Torrential rain shower
  // Snow
  1066: { day: 'snowy-1-day', night: 'snowy-1-night' }, // Patchy light snow
  1069: { day: 'snow-and-sleet-mix', night: 'snow-and-sleet-mix' }, // Patchy sleet
  1114: { day: 'snowy-1-day', night: 'snowy-1-night' }, // Blowing snow
  1117: { day: 'snowy-2-day', night: 'snowy-2-night' }, // Blizzard
  1210: { day: 'snowy-1-day', night: 'snowy-1-night' }, // Light snow
  1213: { day: 'snowy-1-day', night: 'snowy-1-night' }, // Patchy moderate snow
  1216: { day: 'snowy-2-day', night: 'snowy-2-night' }, // Moderate snow
  1219: { day: 'snowy-2-day', night: 'snowy-2-night' }, // Patchy heavy snow
  1222: { day: 'snowy-3-day', night: 'snowy-3-night' }, // Heavy snow
  1225: { day: 'snowy-3-day', night: 'snowy-3-night' }, // Heavy snow
  1255: { day: 'snowy-1-day', night: 'snowy-1-night' }, // Light snow showers
  1258: { day: 'snowy-2-day', night: 'snowy-2-night' }, // Moderate or heavy snow showers
  // Thunder
  1087: { day: 'scattered-thunderstorms-day', night: 'scattered-thunderstorms-night' }, // Thundery outbreaks in nearby
  1273: { day: 'isolated-thunderstorms-day', night: 'isolated-thunderstorms-night' }, // Patchy light rain with thunder
  1276: { day: 'thunderstorms', night: 'thunderstorms' }, // Moderate or heavy rain with thunder
  1279: { day: 'snow-and-sleet-mix', night: 'snow-and-sleet-mix' }, // Patchy light snow with thunder
  1282: { day: 'snow-and-sleet-mix', night: 'snow-and-sleet-mix' }, // Moderate or heavy snow with thunder
};

function updateIcon(conditionCode, isDay) {
  let iconName = 'clear-day'; // Default icon
  if (conditionCode && weatherIconMap[conditionCode]) {
    iconName = isDay ? weatherIconMap[conditionCode].day : weatherIconMap[conditionCode].night;
  } else if (isDay === 0) { // If night and no specific icon, use clear-night
    iconName = 'clear-night';
  }

  chrome.action.setIcon({
    path: {
      "16": `icons/icon16_${iconName}.png`,
      "48": `icons/icon48_${iconName}.png`,
      "128": `icons/icon128_${iconName}.png`
    }
  });
  console.log('Icon updated to:', iconName);
}

function updateActionTitle(temperature, feelsLike, conditionText, cloudCoverage, uvIndex) {
  const title = `Temperature: ${temperature}°C\nFeels like: ${feelsLike}°C\nCondition: ${conditionText}\nCloud coverage: ${cloudCoverage}%\nUV Index: ${uvIndex}`;
  chrome.action.setTitle({ title: title });
  console.log('Action title updated to:', title);
}

chrome.action.onClicked.addListener(() => {
  console.log('Icon clicked, refreshing weather data');
  fetchWeatherData(true);
});

console.log('Extension loaded, initiating first fetch');
fetchWeatherData();

console.log('Creating alarm for periodic updates');
chrome.alarms.create('updateWeather', { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  if (alarm.name === 'updateWeather') {
    fetchWeatherData();
  }
});