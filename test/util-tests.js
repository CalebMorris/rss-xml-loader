import { expect } from 'chai';

import { stripSingleItemArrayFromXMLObject } from '../src/util';

describe('stripSingleItemArrayFromXMLObject', () => {
  describe('loaded', () => {
    it('should check if a function', () => {
      const testType = typeof stripSingleItemArrayFromXMLObject;
      expect (testType).to.equal('function', 'Unexpected Type');
    });
  });
});
