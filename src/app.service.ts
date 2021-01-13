/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import Ajv, { ErrorObject } from 'ajv';
import { query } from 'jsonpath';
export interface JsonPathHeaderMapping {
  jsonPath: string;
  header: string;
}

@Injectable()
export class AppService {
  private ajv = new Ajv();

  getTokenPayload(token: string): object | undefined {
    const spl = token.split(/\./);
    const payload = spl[1];
    if (!payload) {
      return undefined;
    }
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString());
    } catch (e) {
      return undefined;
    }
  }

  areAllChildrenStringsOrNumbers(array: unknown[]): boolean {
    for (const item of array) {
      if (typeof item !== 'string' && typeof item !== 'number') {
        return false;
      }
    }
    return true;
  }

  extractToken(
    headers: { [P: string]: string },
    tokenHeader?: string,
  ): string | undefined {
    if (tokenHeader) {
      return headers[tokenHeader];
    }
    if (headers['authorization']) {
      const value = headers['authorization'];
      const matchResult = value.match(/Bearer\s+(.*)/);
      if (!matchResult) return undefined;
      return matchResult[1];
    }
    if (headers['x-auth-request-access-token']) {
      return headers['x-auth-request-access-token'];
    }
    return undefined;
  }

  /**
   * Tries to extract json path from the tokenPayload and adds the result
   * to the headerMap with the given header.
   * the jsonpath result will be modified to match criteria to be sent
   * as a header
   *
   * string -> string
   * array of strings or numbers -> items joined by ,
   * object -> base64(json)
   * nullish -> stringify value ('undefined', 'null')
   * @param headerMap map of headers
   * @param tokenPayload payload of jwt token to extract data from
   * @param jsonPath this jsonpath will be extracted
   * @param header this header will be added to
   */
  addHeaderOrOmitIfRuleDoesNotMatch(
    headerMap: Map<string, string>,
    tokenPayload: unknown,
    { jsonPath, header }: JsonPathHeaderMapping,
  ): void {
    try {
      const result = query(tokenPayload, jsonPath);
      if (!result.length) {
        return;
      }
      if (this.areAllChildrenStringsOrNumbers(result)) {
        headerMap.set(header, result.join(','));
      } else {
        headerMap.set(
          header,
          Buffer.from(JSON.stringify(result)).toString('base64'),
        );
      }
    } catch (e) {
      return;
    }
  }

  public getHeadersToCopy(
    jsonPathHeaderMappings: JsonPathHeaderMapping[],
    tokenPayload: object,
  ): Map<string, string> {
    const headerMap = new Map<string, string>();
    jsonPathHeaderMappings.forEach((jsonPathHeaderMapping) =>
      this.addHeaderOrOmitIfRuleDoesNotMatch(
        headerMap,
        tokenPayload,
        jsonPathHeaderMapping,
      ),
    );
    return headerMap;
  }

  convertToJsonPathHeaderMapping(
    parameterValue: string,
  ): JsonPathHeaderMapping | undefined {
    const matchResult = parameterValue.match(/([-_0-9A-Za-z]+)\|(.*)/);
    if (matchResult) {
      return {
        header: matchResult[1],
        jsonPath: matchResult[2],
      };
    }
    return undefined;
  }

  public convertToJsonPathHeadersMappings(
    jsonPathHeaderParameter: string[],
  ): JsonPathHeaderMapping[] {
    const mappings: JsonPathHeaderMapping[] = [];
    jsonPathHeaderParameter.forEach((item) => {
      const jsonPathHeaderMapping = this.convertToJsonPathHeaderMapping(item);
      if (jsonPathHeaderMapping) {
        mappings.push(jsonPathHeaderMapping);
      }
    });
    return mappings;
  }

  public validateToken(
    tokenPayload: Object,
    jsonSchema: string,
  ): boolean | ErrorObject[] {
    try {
      const validate = this.ajv.compile(JSON.parse(jsonSchema));
      if (validate(tokenPayload)) {
        return true;
      }
      /* istanbul ignore else */
      if (validate.errors) {
        return validate.errors;
      }
    } catch (e) {
      //empty
    }
    return false;
  }
}
