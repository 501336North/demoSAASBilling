import JSDOMEnvironment from 'jest-environment-jsdom';
import type { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';

export default class CustomEnvironment extends JSDOMEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    // Copy Node.js Web API globals to JSDOM environment
    // These are needed for NextRequest/NextResponse to work
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.Headers = Headers;
    this.global.fetch = fetch;

    // Mock window.location.assign to prevent JSDOM navigation errors
    // Use plain functions since jest is not available here
    const locationMock = {
      assign: () => {},
      href: '',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      replace: () => {},
      reload: () => {},
      toString: () => 'http://localhost:3000/',
    };

    // Delete the original location property and redefine it
    delete (this.global.window as any).location;
    (this.global.window as any).location = locationMock;
  }
}
