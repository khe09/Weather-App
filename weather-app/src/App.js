import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=metric`
            );
            setWeather(response.data);
            getForecast(response.data.name);
          } catch (error) {
            console.error('Error fetching weather by location:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to access your location. Please enter a city manually.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const getCitySuggestions = async (input) => {
    if (input.length > 1) {
      try {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&type=city&limit=5&format=json&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
        );
        setSuggestions(response.data.results);
      } catch (error) {
        console.log('Error fetching city suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    getCitySuggestions(value);
  };

  const handleSuggestionClick = (cityName) => {
    setCity(cityName);
    setSuggestions([]);
  };

  const getForecast = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=metric`
      );
      setForecast(response.data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  const getWeatherForCity = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=metric`
      );
      setWeather(response.data);
      getForecast(cityName); // Fetch 5-day forecast for the selected city
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className="App">
      {/* Title Section */}
      <div className="title-section">
        <h1>Welcome</h1>
        <h3>Check out today's weather</h3>
      </div>

      {/* Main Content Section */}
      <div className="main-content">
        {/* Search and Main Weather Section */}
        <div className="search-weather-section">
          <div className="autocomplete-container">
            <input
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={handleCityChange}
              className="search-bar"
            />
            <button onClick={() => getWeatherForCity(city)} className="search-button">
              Search
            </button>
            {suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionClick(suggestion.city)}
                  >
                    {suggestion.city}, {suggestion.country}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Display any location errors */}
          {locationError && <p>{locationError}</p>}

          {/* Display the main weather info */}
          {weather && (
            <div className="weather-info">
              <h2>{weather.name}</h2>
              {/* Display weather icon */}
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="weather-icon"
              />
              <p>Temperature: {weather.main.temp} °C</p>
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Weather: {weather.weather[0].description}</p>
              <p>Wind Speed: {weather.wind.speed} m/s</p>
            </div>
          )}
        </div>

        {/* 5-Day Forecast Section */}
        <div className="forecast-section">
          {forecast && (
            <div className="forecast-info">
              <h2>5-Day Forecast</h2>
              <div className="forecast-container">
                {forecast.list
                  .filter((_, index) => index % 8 === 0)
                  .map((item) => (
                    <div key={item.dt} className="forecast-item">
                      <p>{new Date(item.dt * 1000).toLocaleDateString()}</p>
                      <div className="forecast-additional">
                        <p>Temp: {item.main.temp} °C</p>
                        <p>Humidity: {item.main.humidity}%</p>
                        <p>Wind: {item.wind.speed} m/s</p>
                        <img
                          src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                          alt={item.weather[0].description}
                          className="weather-icon"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
