const { defaults: tsjPreset } = require('ts-jest/presets');
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: tsjPreset.transform,
  preset: '@shelf/jest-mongodb',
  clearMocks: true,
};
