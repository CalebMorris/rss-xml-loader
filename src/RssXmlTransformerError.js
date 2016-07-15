import ExtendableError from 'es6-error';

const defaultExceptionMessage = 'Failed to parse RSS feed';

class RssXmlTransformerError extends ExtendableError {
  // constructor is optional; you should omit it if you just want a custom error
  // type for inheritance and type checking
  constructor(message: string = defaultExceptionMessage) {
    super(message);
  }
}

export default RssXmlTransformerError;
