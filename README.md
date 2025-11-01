# Weather Extension

A simple Chrome extension that displays the current weather information based on a configured city directly on the extension icon and in a detailed hover tooltip.

## Features

- **Real-time Weather Display**: Shows the current temperature on the extension badge.
- **Detailed Hover Information**: Provides temperature, "feels like" temperature, current weather condition, cloud coverage, and UV index in a multi-line tooltip on hover.
- **Automatic Updates**: Refreshes weather data every 30 minutes.
- **Manual Refresh**: Click the extension icon to force an immediate update.
- **Error Handling**: Displays error status if API is unavailable or city/API key is not set.
- **Caching**: Stores weather data locally to minimize API calls.
- **Transparent Icons**: Weather icons have transparent backgrounds for better integration.

## Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the extension directory.
5. The Weather Extension should now appear in your extensions list.
6. Go to the extension's options page to set your WeatherAPI.com API key and desired city.

## Usage

- The extension icon will display the current temperature.
- Hover over the icon to see detailed weather information.
- Click the icon to manually refresh the weather data.
- Weather data updates automatically every 30 minutes.

## API

This extension uses the [WeatherAPI.com API](https://www.weatherapi.com/) to fetch current weather data. You will need a free API key from WeatherAPI.com.

## Permissions

- **Storage**: To cache weather data locally and store user settings (API key, city).
- **Alarms**: To schedule periodic updates.
- **Host Permissions**: Access to `https://api.weatherapi.com/*` for API calls.

## Files

- `manifest.json`: Extension manifest file.
- `background.js`: Service worker handling weather fetching, badge updates, and action title updates.
- `options.html`: HTML page for extension options (API key and city configuration).
- `options.js`: JavaScript for handling options page logic.
- `icons/`: Directory containing all weather icons (16x16, 48x48, 128x128 pixels).

## Development

To modify the extension:

1. Make changes to the source files.
2. Reload the extension in `chrome://extensions/`.
3. Test the changes.

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.