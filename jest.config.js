const { defaults: tsjPresets } = require('ts-jest/presets');
module.exports = {
  clearMocks: true,
  transform: tsjPresets.transform,
  preset: '@shelf/jest-mongodb',
  // testEnvironment: 'node',
};
