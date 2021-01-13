import {
  Controller,
  Get,
  Query,
  Headers,
  Res,
  Req,
  Render,
  ValidationPipe,
} from '@nestjs/common';
import express from 'express';
import { AppService } from './app.service';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

class ValidateJwtQuery {
  /**
   * Specifies the header where the jwt token is placed.
   * If this parameter is not present we're searching in the following headers:
   * - Authorization: Bearer <jwt-token>
   * - X-Auth-Request-Access-Token: <jwt-token>
   */
  tokenHeader?: string;
  /**
   * jsonSchema which the jwt token will be validated against
   * if not present no validation will be performed
   */
  jsonSchema?: string;
  /**
   * list of header extractions in the following format:
   * <http_response_header>|<jsonpath>
   * e.g.
   * X-Roles|$.realm_access.roles[*]
   * Copies the realm access roles to the X-Roles header
   *
   * This is used to pass information of the jwt token to the
   * application behind the forward-auth. With this the application
   * doesn't have to know about jwt tokens. you can just pass user_id and
   * roles as a header to the application.
   */
  extractAsHeader?: string[] | string;
  /**
   * copies the JWT token to the Authorization header
   *
   * Authorization: Bearer <jwt_token>
   */
  copyTokenToAuthorizationHeader?: string;
}

/**
 * Query paramter for /redirect
 */
class RedirectQuery {
  /**
   * The Page will redirect the browser to the given url
   */
  @IsNotEmpty()
  to: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * reutrns a page that tries to redirect the user to the given page using
   * javascript
   * @param query query parameter of the url
   */
  @Get('/redirect')
  @Render('redirect')
  redirect(@Query(ValidationPipe) query: RedirectQuery): unknown {
    return {
      redirectTo: query.to,
    };
  }

  /**
   * inspects the extractAsHeader property of the {@link ValidateJwtQuery}
   * and converts the given value always to a string[]
   * @param extractAsHeader parameter from the query
   * @return array of given items or an empty array if none exist
   */
  getExtractAsHeader(
    extractAsHeader: ValidateJwtQuery['extractAsHeader'],
  ): string[] {
    if (!extractAsHeader) {
      return [];
    } else if (typeof extractAsHeader === 'string') {
      return [extractAsHeader];
    }
    return extractAsHeader;
  }

  /**
   * validates the jwt token that has to be present in the request http headers
   * against a given jsonSchema
   *
   * Also copies contents of the jwt token to the response headers
   * of this request if specified correctly.
   *
   * @param query
   * @param headers
   * @param response
   */
  @Get('/validate/jwt')
  validateJwt(
    @Query(ValidationPipe) query: ValidateJwtQuery,
    @Headers() headers: { [P: string]: string },
    @Res() response: express.Response,
  ): void {
    const token = this.appService.extractToken(headers, query.tokenHeader);
    if (!token) {
      response.status(401);
      response.send(`Could not find a JWT`);
      return;
    }
    if (query.copyTokenToAuthorizationHeader === 'true') {
      response.setHeader('Authorization', `Bearer ${token}`);
    }
    const payload = this.appService.getTokenPayload(token);
    if (!payload) {
      response.status(401);
      response.send(`unable to extract payload from token`);
      return;
    }
    if (query.jsonSchema) {
      const tokenValidationResult = this.appService.validateToken(
        payload,
        query.jsonSchema,
      );
      if (tokenValidationResult !== true) {
        response.status(403);
        response.send(
          `Schema validation failed with:\n ${JSON.stringify(
            tokenValidationResult,
            null,
            4,
          )}\n tokenPayload: ${JSON.stringify(payload, null, 4)}\n schema: ${
            query.jsonSchema
          }`,
        );
        return;
      }
    }
    const headersToCopy = this.appService.getHeadersToCopy(
      this.appService.convertToJsonPathHeadersMappings(
        this.getExtractAsHeader(query.extractAsHeader),
      ),
      payload,
    );
    headersToCopy.forEach((value, key) => response.setHeader(key, value));
    response.send('ok');
  }
}
