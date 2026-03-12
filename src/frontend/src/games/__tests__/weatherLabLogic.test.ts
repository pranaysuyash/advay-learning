/**
 * Weather Lab Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  startChallenge,
  updateConditions,
  calculateWeather,
  checkChallenge,
  submitChallenge,
  resetChallenge,
  updateTimer,
  getWeatherInfo,
  calculateFinalScore,
  CHALLENGES,
} from '../weatherLabLogic';

describe('Weather Lab Logic', () => {
  describe('createInitialState', () => {
    it('creates state with menu status', () => {
      const state = createInitialState();
      expect(state.status).toBe('menu');
    });

    it('initializes default conditions', () => {
      const state = createInitialState();
      expect(state.conditions.temperature).toBe(20);
      expect(state.conditions.humidity).toBe(50);
      expect(state.conditions.windSpeed).toBe(20);
      expect(state.conditions.pressure).toBe(1013);
    });

    it('starts with zero score', () => {
      const state = createInitialState();
      expect(state.score).toBe(0);
    });

    it('has empty discovered weathers', () => {
      const state = createInitialState();
      expect(state.discoveredWeathers).toEqual([]);
    });
  });

  describe('startChallenge', () => {
    it('sets status to playing', () => {
      const state = startChallenge(createInitialState(), 'make-it-snow');
      expect(state.status).toBe('playing');
    });

    it('sets challenge ID', () => {
      const state = startChallenge(createInitialState(), 'desert-heat');
      expect(state.currentChallengeId).toBe('desert-heat');
    });

    it('resets conditions to defaults', () => {
      let state = createInitialState();
      state = updateConditions(state, { temperature: 35 });
      state = startChallenge(state, 'make-it-snow');
      expect(state.conditions.temperature).toBe(20);
    });

    it('resets attempts', () => {
      let state = createInitialState();
      state = { ...state, attempts: 5 };
      state = startChallenge(state, 'make-it-snow');
      expect(state.attempts).toBe(0);
    });
  });

  describe('calculateWeather', () => {
    it('returns snowy for cold + humid', () => {
      const weather = calculateWeather({
        temperature: -5,
        humidity: 80,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.type).toBe('snowy');
    });

    it('returns desert for hot + dry', () => {
      const weather = calculateWeather({
        temperature: 35,
        humidity: 20,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.type).toBe('desert');
    });

    it('returns thunderstorm for hot + very humid', () => {
      const weather = calculateWeather({
        temperature: 30,
        humidity: 90,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.type).toBe('thunderstorm');
    });

    it('returns clear winter for cold + dry', () => {
      const weather = calculateWeather({
        temperature: 0,
        humidity: 30,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.type).toBe('winter-sun');
    });

    it('returns rainy for moderate + humid', () => {
      const weather = calculateWeather({
        temperature: 15,
        humidity: 80,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.type).toBe('rainy');
    });

    it('returns stormy for low pressure + high wind', () => {
      const weather = calculateWeather({
        temperature: 20,
        humidity: 50,
        windSpeed: 70,
        pressure: 990,
      });
      expect(weather.type).toBe('stormy');
    });

    it('returns cloudy for moderate humidity', () => {
      const weather = calculateWeather({
        temperature: 20,
        humidity: 60,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.type).toBe('cloudy');
    });

    it('returns clear for low humidity', () => {
      const weather = calculateWeather({
        temperature: 20,
        humidity: 40,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.type).toBe('clear');
    });

    it('has educational content', () => {
      const weather = calculateWeather({
        temperature: -5,
        humidity: 80,
        windSpeed: 20,
        pressure: 1013,
      });
      expect(weather.educational).toContain('Snow');
    });
  });

  describe('updateConditions', () => {
    it('updates temperature', () => {
      let state = createInitialState();
      state = updateConditions(state, { temperature: 30 });
      expect(state.conditions.temperature).toBe(30);
    });

    it('updates humidity', () => {
      let state = createInitialState();
      state = updateConditions(state, { humidity: 80 });
      expect(state.conditions.humidity).toBe(80);
    });

    it('clamps temperature to max 40', () => {
      let state = createInitialState();
      state = updateConditions(state, { temperature: 50 });
      expect(state.conditions.temperature).toBe(40);
    });

    it('clamps temperature to min -10', () => {
      let state = createInitialState();
      state = updateConditions(state, { temperature: -20 });
      expect(state.conditions.temperature).toBe(-10);
    });

    it('clamps humidity to max 100', () => {
      let state = createInitialState();
      state = updateConditions(state, { humidity: 150 });
      expect(state.conditions.humidity).toBe(100);
    });

    it('clamps humidity to min 0', () => {
      let state = createInitialState();
      state = updateConditions(state, { humidity: -10 });
      expect(state.conditions.humidity).toBe(0);
    });

    it('calculates weather after update', () => {
      let state = createInitialState();
      state = updateConditions(state, { temperature: -5, humidity: 80 });
      expect(state.currentWeather).not.toBeNull();
      expect(state.currentWeather?.type).toBe('snowy');
    });

    it('adds to discovered weathers', () => {
      let state = createInitialState();
      state = updateConditions(state, { temperature: -5, humidity: 80 });
      expect(state.discoveredWeathers).toContain('snowy');
    });

    it('does not duplicate discovered weathers', () => {
      let state = createInitialState();
      state = updateConditions(state, { temperature: -5, humidity: 80 });
      state = updateConditions(state, { temperature: -6, humidity: 81 });
      expect(state.discoveredWeathers.filter((w) => w === 'snowy')).toHaveLength(1);
    });
  });

  describe('checkChallenge', () => {
    it('returns error when no challenge selected', () => {
      const state = createInitialState();
      const result = checkChallenge(state);
      expect(result.success).toBe(false);
      expect(result.feedback).toContain('No challenge');
    });

    it('detects successful snowy challenge', () => {
      let state = startChallenge(createInitialState(), 'make-it-snow');
      state = updateConditions(state, { temperature: -5, humidity: 80 });
      const result = checkChallenge(state);
      expect(result.success).toBe(true);
    });

    it('detects failed challenge with feedback', () => {
      let state = startChallenge(createInitialState(), 'make-it-snow');
      state = updateConditions(state, { temperature: 35, humidity: 20 }); // Desert instead of snow
      const result = checkChallenge(state);
      expect(result.success).toBe(false);
      expect(result.feedback).toContain('Desert');
    });

    it('detects successful desert challenge', () => {
      let state = startChallenge(createInitialState(), 'desert-heat');
      state = updateConditions(state, { temperature: 35, humidity: 20 });
      const result = checkChallenge(state);
      expect(result.success).toBe(true);
    });

    it('detects successful thunderstorm challenge', () => {
      let state = startChallenge(createInitialState(), 'thunderstorm');
      state = updateConditions(state, { temperature: 30, humidity: 90 });
      const result = checkChallenge(state);
      expect(result.success).toBe(true);
    });
  });

  describe('submitChallenge', () => {
    it('awards points on success', () => {
      let state = startChallenge(createInitialState(), 'make-it-snow');
      state = updateConditions(state, { temperature: -5, humidity: 80 });
      state = submitChallenge(state);
      expect(state.status).toBe('success');
      expect(state.score).toBeGreaterThan(0);
    });

    it('increments attempts on failure', () => {
      let state = startChallenge(createInitialState(), 'make-it-snow');
      state = updateConditions(state, { temperature: 30, humidity: 20 });
      state = submitChallenge(state);
      expect(state.status).toBe('failure');
      expect(state.attempts).toBe(1);
    });
  });

  describe('resetChallenge', () => {
    it('resets conditions', () => {
      let state = startChallenge(createInitialState(), 'make-it-snow');
      state = updateConditions(state, { temperature: -5 });
      state = resetChallenge(state);
      expect(state.conditions.temperature).toBe(20);
    });

    it('sets status to playing', () => {
      let state = startChallenge(createInitialState(), 'make-it-snow');
      state = submitChallenge(state);
      state = resetChallenge(state);
      expect(state.status).toBe('playing');
    });
  });

  describe('updateTimer', () => {
    it('increments time elapsed', () => {
      let state = createInitialState();
      state = updateTimer(state);
      expect(state.timeElapsed).toBe(1);
    });
  });

  describe('getWeatherInfo', () => {
    it('returns info for snowy', () => {
      const info = getWeatherInfo('snowy');
      expect(info.emoji).toBe('❄️');
      expect(info.name).toBe('Snowy');
    });

    it('returns info for desert', () => {
      const info = getWeatherInfo('desert');
      expect(info.emoji).toBe('🏜️');
    });

    it('returns unique colors for each type', () => {
      const types = ['clear', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy', 'desert', 'winter-sun', 'thunderstorm'] as const;
      const colors = types.map((t) => getWeatherInfo(t).color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(types.length);
    });
  });

  describe('calculateFinalScore', () => {
    it('calculates total score', () => {
      const state = { ...createInitialState(), score: 250 };
      const result = calculateFinalScore(state);
      expect(result.totalScore).toBe(250);
    });

    it('counts discovered weathers', () => {
      const state = { ...createInitialState(), discoveredWeathers: ['clear', 'cloudy', 'rainy'] };
      const result = calculateFinalScore(state);
      expect(result.weathersDiscovered).toBe(3);
    });

    it('estimates challenges completed', () => {
      const state = { ...createInitialState(), score: 250 };
      const result = calculateFinalScore(state);
      expect(result.challengesCompleted).toBe(2);
    });
  });

  describe('CHALLENGES', () => {
    it('has 6 challenges', () => {
      expect(CHALLENGES).toHaveLength(6);
    });

    it('has make-it-snow challenge', () => {
      const challenge = CHALLENGES.find((c) => c.id === 'make-it-snow');
      expect(challenge).toBeDefined();
      expect(challenge?.targetWeather).toBe('snowy');
    });

    it('each challenge has tolerance settings', () => {
      CHALLENGES.forEach((challenge) => {
        expect(challenge.tolerance).toBeDefined();
      });
    });

    it('each challenge has hint', () => {
      CHALLENGES.forEach((challenge) => {
        expect(challenge.hint).toBeTruthy();
      });
    });
  });
});
