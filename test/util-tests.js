import { expect } from 'chai';

import { randomString } from './test-utils';

import { stripSingleItemArrayFromXMLObject } from '../src/util';

describe('stripSingleItemArrayFromXMLObject', () => {
  describe('loaded', () => {
    it('should check if a function', () => {
      const testType = typeof stripSingleItemArrayFromXMLObject;
      expect (testType).to.equal('function', 'Unexpected Type');
    });
  });

  describe('unsupported and empty types', () => {
    it('should return input data', () => {
      const testData = ['test', () => 1, null, [], {}];
      testData.forEach((value) => {
        expect(stripSingleItemArrayFromXMLObject(value)).to.equal(value);
      });
    });
  });

  describe('non-stripped values', () => {
    it('multi-value array', () => {
      const data = [randomString(), randomString(), randomString()];
      const testData = { [data[0]]: [data[1], data[2]] };
      const expectedOutput = { [data[0]]: [data[1], data[2]] };
      const output = stripSingleItemArrayFromXMLObject(testData);
      expect(output)
        .to.be.an('object', typeof object)
        .to.deep.equals(expectedOutput);
    });
  });

  describe('stripped values', () => {
    it('should string single-depth array', () => {
      const data = [randomString(), randomString()];
      const testData = { [data[0]]: [data[1]] };
      const expectedOutput = { [data[0]]: data[1] };
      const output = stripSingleItemArrayFromXMLObject(testData);
      expect(output)
        .to.be.an('object', typeof object)
        .to.deep.equals(expectedOutput);
    });
    it('should string multi-depth varying array', () => {
      const data = [randomString(), randomString(), randomString()];
      const testData = { [data[0]]: { [data[1]] : [data[2]] } };
      const expectedOutput = { [data[0]]: { [data[1]]: data[2] } };
      const output = stripSingleItemArrayFromXMLObject(testData);
      expect(output)
        .to.be.an('object', typeof object)
        .to.deep.equals(expectedOutput);
    });
    it('should string multi-depth array', () => {
      const data = [randomString(), randomString(), randomString()];
      const testData = { [data[0]]: [{ [data[1]] : [data[2]] }] };
      const expectedOutput = { [data[0]]: { [data[1]]: data[2] } };
      const output = stripSingleItemArrayFromXMLObject(testData);
      expect(output)
        .to.be.an('object', typeof object)
        .to.deep.equals(expectedOutput);
    });
  });
});
