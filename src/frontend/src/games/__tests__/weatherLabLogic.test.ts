import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeGame,
  getCurrentLevel,
  updateTemperature,
  updateHumidity,
  updatePressure,
  updateWindSpeed,
  updateWindDirection,
  getCurrentWeather,
  checkWeatherMatch,
  updateWeather,
  startGame,
  resetLevel,
  nextLevel,
  calculateScore,
  getWeatherInfo,
  WEATHER_CONDITIONS,
  LEVELS,
} from '../weatherLabLogic';

describe('weatherLabLogic', () => {
  describe('initializeGame', () => {
    it('should initialize game with level 1', () => {
      const state = initializeGame(1);
      expect(state.level).toBe(1);
      expect(state.weather.temperature).toBe(20);
      expect(state.weather.humidity).toBe(50);
      expect(state.weather.pressure).toBe(1013);
      expect(state.weather.windSpeed).toBe(10);
    });
  });

  describe('getCurrentLevel', () => {
    it('should return correct level', () => {
      const level = getCurrentLevel(2);
      expect(level.name).toBe('Rainy Day');
    });

    it('should return level 1 for invalid id', () => {
      const level = getCurrentLevel(999);
      expect(level.id).toBe(1);
    });
  });

  describe('WEATHER_CONDITIONS', () => {
    it('should have 8 weather conditions', () => {
      expect(WEATHER_CONDITIONS).toHaveLength(8);
    });

    it('should have unique IDs', () => {
      const ids = WEATHER_CONDITIONS.map(c => c.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('updateTemperature', () => {
    it('should increase temperature', () => {
      let state = initializeGame(1);
      const oldTemp = state.weather.temperature;
      state = updateTemperature(state, 5);
      expect(state.weather.temperature).toBe(oldTemp + 5);
    });

    it('should decrease temperature', () => {
      let state = initializeGame(1);
      const oldTemp = state.weather.temperature;
      state = updateTemperature(state, -5);
      expect(state.weather.temperature).toBe(oldTemp - 5);
    });

    it('should clamp to max 50', () => {
      let state = initializeGame(1);
      state = updateTemperature(state, 100);
      expect(state.weather.temperature).toBe(50);
    });

    it('should clamp to min -20', () => {
      let state = initializeGame(1);
      state = updateTemperature(state, -100);
      expect(state.weather.temperature).toBe(-20);
    });
  });

  describe('updateHumidity', () => {
    it('should increase humidity', () => {
      let state = initializeGame(1);
      state = updateHumidity(state, 10);
      expect(state.weather.humidity).toBe(60);
    });

    it('should clamp to 0-100', () => {
      let state = initializeGame(1);
      state = updateHumidity(state, 200);
      expect(state.weather.humidity).toBe(100);
    });
  });

  describe('updatePressure', () => {
    it('should update pressure', () => {
      let state = initializeGame(1);
      state = updatePressure(state, 10);
      expect(state.weather.pressure).toBe(1023);
    });

    it('should clamp to 950-1050', () => {
      let state = initializeGame(1);
      state = updatePressure(state, 200);
      expect(state.weather.pressure).toBe(1050);
    });
  });

  describe('updateWindSpeed', () => {
    it('should increase wind speed', () => {
      let state = initializeGame(1);
      state = updateWindSpeed(state, 20);
      expect(state.weather.windSpeed).toBe(30);
    });

    it('should clamp to 0-100', () => {
      let state = initializeGame(1);
      state = updateWindSpeed(state, 200);
      expect(state.weather.windSpeed).toBe(100);
    });
  });

  describe('updateWindDirection', () => {
    it('should update wind direction', () => {
      let state = initializeGame(1);
      state = updateWindDirection(state, 90);
      expect(state.weather.windDirection).toBe(90);
    });

    it('should wrap to 0-360', () => {
      let state = initializeGame(1);
      state = updateWindDirection(state, 400);
      expect(state.weather.windDirection).toBe(40);
    });
  });

  describe('getCurrentWeather', () => {
    it('should return sunny for hot and dry', () => {
      let state = initializeGame(1);
      state.weather.temperature = 30;
      state.weather.humidity = 20;
      const weather = getCurrentWeather(state);
      expect(weather?.id).toBe('sunny');
    });

    it('should return snowy for cold and humid', () => {
      let state = initializeGame(1);
      state.weather.temperature = -5;
      state.weather.humidity = 80;
      const weather = getCurrentWeather(state);
      expect(weather?.id).toBe('snowy');
    });

    it('should return rainy for high humidity', () => {
      let state = initializeGame(1);
      state.weather.temperature = 15;
      state.weather.humidity = 80;
      const weather = getCurrentWeather(state);
      expect(weather?.id).toBe('rainy');
    });

    it('should return stormy for high humidity and wind', () => {
      let state = initializeGame(1);
      state.weather.temperature = 22;
      state.weather.humidity = 90;
      state.weather.windSpeed = 50;
      const weather = getCurrentWeather(state);
      expect(weather?.id).toBe('stormy');
    });

    it('should return windy for high wind speed', () => {
      let state = initializeGame(1);
      state.weather.windSpeed = 50;
      const weather = getCurrentWeather(state);
      expect(weather?.id).toBe('windy');
    });
  });

  describe('checkWeatherMatch', () => {
    it('should match sunny weather', () => {
      let state = initializeGame(1);
      state.weather.temperature = 30;
      state.weather.humidity = 20;
      state = updateWeather(state);
      const match = checkWeatherMatch(state, 'sunny');
      expect(match).toBe(true);
    });

    it('should not match wrong weather', () => {
      let state = initializeGame(1);
      state.weather.temperature = -5;
      state.weather.humidity = 80;
      state = updateWeather(state);
      const match = checkWeatherMatch(state, 'sunny');
      expect(match).toBe(false);
    });
  });

  describe('startGame', () => {
    it('should set isPlaying to true', () => {
      const state = initializeGame(1);
      const newState = startGame(state);
      expect(newState.isPlaying).toBe(true);
      expect(newState.startTime).toBeGreaterThan(0);
    });
  });

  describe('resetLevel', () => {
    it('should reset to initial state', () => {
      let state = initializeGame(1);
      state = updateTemperature(state, 20);
      const resetState = resetLevel(state);
      expect(resetState.weather.temperature).toBe(20);
    });
  });

  describe('nextLevel', () => {
    it('should advance to next level', () => {
      const state = initializeGame(1);
      const newState = nextLevel(state);
      expect(newState.level).toBe(2);
    });

    it('should not advance past last level', () => {
      const state = initializeGame(5);
      const newState = nextLevel(state);
      expect(newState.level).toBe(5);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score with base value', () => {
      const score = calculateScore(5, 10000, 1);
      expect(score).toBeGreaterThan(0);
    });

    it('should penalize excessive moves', () => {
      const lowMoves = calculateScore(5, 10000, 1);
      const highMoves = calculateScore(30, 10000, 1);
      expect(highMoves).toBeLessThan(lowMoves);
    });
  });

  describe('getWeatherInfo', () => {
    it('should return info for sunny', () => {
      const info = getWeatherInfo('sunny');
      expect(info.name).toBe('Sunny');
      expect(info.emoji).toBe('☀️');
    });

    it('should return info for snowy', () => {
      const info = getWeatherInfo('snowy');
      expect(info.name).toBe('Snowy');
      expect(info.emoji).toBe('❄️');
    });
  });
});
