import { AppController } from './app.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService, JsonPathHeaderMapping } from './app.service';

export const TEST_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICItUGRQbVYyb0dYUzRxS3hScXVHcFdUVWRfeFAwZmxpVG8xeDVmMjFGdmhzIn0.eyJleHAiOjE2MTA0Njk5MDEsImlhdCI6MTYxMDQ2OTg0MSwiYXV0aF90aW1lIjoxNjEwNDY5ODQxLCJqdGkiOiI4ZjliYjU3ZC1mNWM0LTQ3ZTgtYjAxZi05OWYxYjI2OGM2YTAiLCJpc3MiOiJodHRwOi8vbG9naW4ubG9jYWxob3N0LmVtY2VsbHNvZnQuZGUvYXV0aC9yZWFsbXMvbWFzdGVyIiwiYXVkIjpbIm1hc3Rlci1yZWFsbSIsImFjY291bnQiXSwic3ViIjoiY2QyOGY5NzEtOGU3OS00MzdlLTgxMDItZGFlN2E4NTQzOGI5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGVzdCIsInNlc3Npb25fc3RhdGUiOiIyYWMyNWExYi03MjZiLTQ1OWYtYTBiZC1iYTljNTY1OWExOWIiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7Im1hc3Rlci1yZWFsbSI6eyJyb2xlcyI6WyJ2aWV3LXJlYWxtIiwidmlldy1pZGVudGl0eS1wcm92aWRlcnMiLCJtYW5hZ2UtaWRlbnRpdHktcHJvdmlkZXJzIiwiaW1wZXJzb25hdGlvbiIsImNyZWF0ZS1jbGllbnQiLCJtYW5hZ2UtdXNlcnMiLCJxdWVyeS1yZWFsbXMiLCJ2aWV3LWF1dGhvcml6YXRpb24iLCJxdWVyeS1jbGllbnRzIiwicXVlcnktdXNlcnMiLCJtYW5hZ2UtZXZlbnRzIiwibWFuYWdlLXJlYWxtIiwidmlldy1ldmVudHMiLCJ2aWV3LXVzZXJzIiwidmlldy1jbGllbnRzIiwibWFuYWdlLWF1dGhvcml6YXRpb24iLCJtYW5hZ2UtY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJtYXJjZWwuc3ByaW5nZXJAZW1jZWxsc29mdC5kZSJ9.H3pNMKVQ3W3eCo0fLKCR2sQIjP_WdlJuZfMPqRiWRsOZas56VmJk9foxRWD5azX_1Ds_obgkEActCtBmFb9o88eUbR337rvSp4rN5YGMSfxoY8jv0mQZPXdT3dmLW8LMkkcF4y3nvnzHxkev5CCMhd8WUxKVdwS-9lhXUG28txoIFNdI37aHJf1TpeoM0WUhI1oSK-sqr306MU0tmsHWNGm8V8kbKVyi8JOdjUo56dfpNW373F01w2O7SRc5Jk2rLGKOt-U97O_ixO3Dgs6favDlKsV90MywrkLYB3OkDab_26EmHgf5pHy46dBov0fgjNcLi-SH6-spCmOBPvkpEQ';
/**
 * validates for the presence of $.realm_access.roles as an array that has to have an item 'offline_access'
 */
export const TEST_JSON_SCHEMA = `
{
  "type": "object",
  "required": [
    "realm_access"
  ],
  "properties": {
    "realm_access": {
      "type": "object",
      "required": [
        "roles"
      ],
      "properties": {
        "roles": {
          "type": "array",
          "contains": {
            "type": "string",
            "enum": [
              "offline_access"
            ]
          }
        }
      }
    }
  }
}
`;

export const TEST_JSON_SCHEMA_INVALID = `
{
  "type": "object",
  "required": [
    "realm_access"
  ],
  "properties": {
    "realm_access": {
      "type": "object",
      "required": [
        "roles"
      ],
      "properties": {
        "roles": {
          "type": "array",
          "contains": {
            "type": "string",
            "enum": [
              "offline_acces"
            ]
          }
        }
      }
    }
  }
}
`;


describe('AppService', () => {
  let appService: AppService;
  beforeEach(async () => {
    appService = new AppService();
  });

  describe('areAllChildrenStringsOrNumbers', () => {
    it('strings given true', () => {
      expect(appService.areAllChildrenStringsOrNumbers(['a', 'b'])).toBe(true);
    });
    it('numbers given true', () => {
      expect(appService.areAllChildrenStringsOrNumbers([1, 2])).toBe(true);
    });
    it('mix given true', () => {
      expect(appService.areAllChildrenStringsOrNumbers([1, 'b'])).toBe(true);
    });
    it('empty given true', () => {
      expect(appService.areAllChildrenStringsOrNumbers([])).toBe(true);
    });
    it('object given false', () => {
      expect(appService.areAllChildrenStringsOrNumbers(['a', {}])).toBe(false);
    });
    it('null given false', () => {
      expect(appService.areAllChildrenStringsOrNumbers(['a', null])).toBe(
        false,
      );
    });
    it('undefined given false', () => {
      expect(appService.areAllChildrenStringsOrNumbers(['a', undefined])).toBe(
        false,
      );
    });
  });

  describe('getTokenPayload', () => {
    it('valid token returns token', () => {
      expect(appService.getTokenPayload(TEST_TOKEN)).toBeTruthy();
    });
    it('invalid token returns undefined', () => {
      expect(appService.getTokenPayload('rofl')).toBe(undefined);
    });
    it('invalid base64 returns undefined', () => {
      expect(appService.getTokenPayload('rofl.rofl')).toBe(undefined);
    });
    it('invalid json returns undefined', () => {
      expect(
        appService.getTokenPayload(
          'rofl.' + Buffer.from('not_json').toString('base64'),
        ),
      ).toBe(undefined);
    });
  });

  describe('extractToken', () => {
    it('should extract token from Authorization', () => {
      expect(
        appService.extractToken({ authorization: 'Bearer ' + TEST_TOKEN }),
      ).toBe(TEST_TOKEN);
    });
    it('should only extract authorization bearer and no others', () => {
      expect(
        appService.extractToken({ authorization: 'other ' + TEST_TOKEN }),
      ).toBe(undefined);
    });
    it('should not crash if no token is found', () => {
      expect(appService.extractToken({})).toBe(undefined);
    });
    it('should extract token from x-auth-request-access-token', () => {
      expect(
        appService.extractToken({ 'x-auth-request-access-token': TEST_TOKEN }),
      ).toBe(TEST_TOKEN);
    });
    it('should extract token from given token', () => {
      expect(appService.extractToken({ 'x-test': TEST_TOKEN }, 'x-test')).toBe(
        TEST_TOKEN,
      );
    });
    it('should extract token from given token with other headers present', () => {
      expect(
        appService.extractToken(
          { c: 'd', 'x-test': TEST_TOKEN, a: 'b' },
          'x-test',
        ),
      ).toBe(TEST_TOKEN);
    });
    it('should prefer given token over defaults', () => {
      expect(
        appService.extractToken(
          {
            authorization: 'Bearer ' + 'a',
            'x-test': 'b',
            'x-auth-request-access-token': 'c',
          },
          'x-test',
        ),
      ).toBe('b');
    });
    it('should not fallback to defaults when token-name given but not present', () => {
      expect(
        appService.extractToken(
          {
            authorization: 'Bearer ' + TEST_TOKEN,
            'x-auth-request-access-token': TEST_TOKEN,
          },
          'x-test',
        ),
      ).toBe(undefined);
    });
    it('should prefer authorization header over x-auth-request-access-token', () => {
      expect(
        appService.extractToken({
          'x-auth-request-access-token': 'b',
          authorization: 'Bearer ' + 'a',
        }),
      ).toBe('a');
    });
  });

  describe('addHeaderOrOmitIfRuleDoesNotMatch', () => {
    it('should add header as simple string', () => {
      const headerMap = new Map<string, string>();
      appService.addHeaderOrOmitIfRuleDoesNotMatch(
        headerMap,
        { test: 'hello world' },
        { jsonPath: '$.test', header: 'x-test' },
      );
      expect(headerMap.get('x-test')).toBe('hello world');
    });
    it('should add array to header as joined string', () => {
      const headerMap = new Map<string, string>();
      appService.addHeaderOrOmitIfRuleDoesNotMatch(
        headerMap,
        { test: ['a', 'b'] },
        { jsonPath: '$.test[*]', header: 'x-test' },
      );
      expect(headerMap.get('x-test')).toBe('a,b');
    });
    it('should add object as base64 string', () => {
      const headerMap = new Map<string, string>();
      appService.addHeaderOrOmitIfRuleDoesNotMatch(
        headerMap,
        { test: [{ bla: 'test' }, 'a', 'b'] },
        { jsonPath: '$.test[*]', header: 'x-test' },
      );
      expect(headerMap.get('x-test')).toMatch(/[-=a-zA-Z0-9]+/);
    });
    it('should not add a header if the result is not found in token', () => {
      const headerMap = new Map<string, string>();
      appService.addHeaderOrOmitIfRuleDoesNotMatch(
        headerMap,
        { test: ['a', 'b'] },
        { jsonPath: '$.notfound', header: 'x-test' },
      );
      expect(headerMap.get('x-test')).toBe(undefined);
    });
    it('should not add a header if the jsonpath has invalid syntax', () => {
      const headerMap = new Map<string, string>();
      appService.addHeaderOrOmitIfRuleDoesNotMatch(
        headerMap,
        { test: ['a', 'b'] },
        { jsonPath: 'this_is_an_invalid_jsonpath&*()', header: 'x-test' },
      );
      expect(headerMap.get('x-test')).toBe(undefined);
    });
  });

  describe('getHeadersToCopy', () => {
    it('should iterate over all given jsonPathHeaderTokens', () => {
      const mockAddHeader = jest
        .spyOn(appService, 'addHeaderOrOmitIfRuleDoesNotMatch')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});
      const map = appService.getHeadersToCopy(
        [
          { jsonPath: '$.notfound1', header: 'x-1' },
          { jsonPath: '$.notfound2', header: 'x-2' },
          { jsonPath: '$.notfound3', header: 'x-3' },
        ],
        {},
      );
      expect(map).toBeTruthy();
      expect(mockAddHeader).toBeCalledTimes(3);
    });
  });

  describe('convertToJsonPathHeadersMapping', () => {
    it('should convert correct syntax', () => {
      expect(
        appService.convertToJsonPathHeaderMapping('x-test|$.test'),
      ).toStrictEqual(<JsonPathHeaderMapping>{
        header: 'x-test',
        jsonPath: '$.test',
      });
    });
    it('should convert correct syntax with pipe included in jsonpath', () => {
      expect(
        appService.convertToJsonPathHeaderMapping('x-test|$.tes|t'),
      ).toStrictEqual(<JsonPathHeaderMapping>{
        header: 'x-test',
        jsonPath: '$.tes|t',
      });
    });
    it('should return undefined when syntax is invalid', () => {
      expect(appService.convertToJsonPathHeaderMapping('asdf')).toBe(undefined);
    });
  });

  describe('convertToJsonPathHeadersMappings', () => {
    it('should convert all mappings', () => {
      const converted = appService.convertToJsonPathHeadersMappings([
        'x-test1|$.test1',
        'x-test2|$.test2',
        'x-test3|$.test3',
      ]);
      expect(converted).toBeTruthy();
      expect(converted.length).toBe(3);
      expect(converted[0]).toStrictEqual(<JsonPathHeaderMapping>{
        header: 'x-test1',
        jsonPath: '$.test1',
      });
      expect(converted[1]).toStrictEqual(<JsonPathHeaderMapping>{
        header: 'x-test2',
        jsonPath: '$.test2',
      });
      expect(converted[2]).toStrictEqual(<JsonPathHeaderMapping>{
        header: 'x-test3',
        jsonPath: '$.test3',
      });
    });
    it('should omit invalid mappings', () => {
      const converted = appService.convertToJsonPathHeadersMappings([
        'x-test1|$.test1',
        'this one is invalid',
        'x-test3|$.test3',
      ]);
      expect(converted).toBeTruthy();
      expect(converted.length).toBe(2);
      expect(converted[0]).toStrictEqual(<JsonPathHeaderMapping>{
        header: 'x-test1',
        jsonPath: '$.test1',
      });
      expect(converted[1]).toStrictEqual(<JsonPathHeaderMapping>{
        header: 'x-test3',
        jsonPath: '$.test3',
      });
    });
  });

  describe('validateToken', () => {
    it('should return true on valid tokens', () => {
      expect(
        appService.validateToken(
          {
            realm_access: {
              roles: [
                'something_different1',
                'offline_access',
                'something_different2',
              ],
            },
          },
          TEST_JSON_SCHEMA,
        ),
      ).toBe(true);
    });
    it('should return error on tokens that do not match', () => {
      const result = appService.validateToken(
        {
          realm_access: {
            roles: ['something_different1', 'something_different2'],
          },
        },
        TEST_JSON_SCHEMA,
      );
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
