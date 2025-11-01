document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const cityInput = document.getElementById('city');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['weatherApiKey', 'city'], (data) => {
    if (data.weatherApiKey) {
      apiKeyInput.value = data.weatherApiKey;
    }
    if (data.city) {
      cityInput.value = data.city;
    }
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const city = cityInput.value;
    chrome.storage.sync.set({ weatherApiKey: apiKey, city: city }, () => {
      statusDiv.textContent = 'Settings saved!';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    });
  });
});