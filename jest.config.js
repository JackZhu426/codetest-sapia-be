const { defaults: tsjPresets } = require('ts-jest/presets');
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: tsjPresets.transform,
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
};
