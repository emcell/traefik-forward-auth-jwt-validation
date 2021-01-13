import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  TEST_JSON_SCHEMA,
  TEST_JSON_SCHEMA_INVALID,
  TEST_TOKEN,
} from '../src/app.service.spec';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    await app.init();
  });

  it('/validate/jwt (GET) without token returns 401', () => {
    return request(app.getHttpServer()).get('/validate/jwt').expect(401);
  });
  it('/validate/jwt (GET) with token returns 200', () => {
    return request(app.getHttpServer())
      .get('/validate/jwt')
      .set('x-auth-request-access-token', TEST_TOKEN)
      .expect(200);
  });
  it('/validate/jwt (GET) copyTokenToBearer', async () => {
    const res = await request(app.getHttpServer())
      .get('/validate/jwt?copyTokenToAuthorizationHeader=true')
      .set('x-auth-request-access-token', TEST_TOKEN)
      .expect(200);
    expect(res.headers['authorization']).toBeTruthy();
    expect(res.headers['authorization']).toBe('Bearer ' + TEST_TOKEN);
  });
  it('/validate/jwt (GET) garbage token returns 201', async () => {
    await request(app.getHttpServer())
      .get('/validate/jwt')
      .set('x-auth-request-access-token', 'garbage')
      .expect(401);
  });
  it('/validate/jwt (GET) valid schema', async () => {
    await request(app.getHttpServer())
      .get('/validate/jwt?jsonSchema=' + encodeURIComponent(TEST_JSON_SCHEMA))
      .set('x-auth-request-access-token', TEST_TOKEN)
      .expect(200);
  });
  it('/validate/jwt (GET) invalid schema 403', async () => {
    await request(app.getHttpServer())
      .get(
        '/validate/jwt?jsonSchema=' +
          encodeURIComponent(TEST_JSON_SCHEMA_INVALID),
      )
      .set('x-auth-request-access-token', TEST_TOKEN)
      .expect(403);
  });
  it('/validate/jwt (GET) garbage schema 403', async () => {
    await request(app.getHttpServer())
      .get('/validate/jwt?jsonSchema=' + encodeURIComponent('garbage'))
      .set('x-auth-request-access-token', TEST_TOKEN)
      .expect(403);
  });
  it('/validate/jwt (GET) copy headers', async () => {
    const res = await request(app.getHttpServer())
      .get(
        '/validate/jwt?extractAsHeader=' +
          encodeURIComponent('x-1|$.realm_access.roles'),
      )
      .set('x-auth-request-access-token', TEST_TOKEN)
      .expect(200);
    expect(res.header['x-1']).toBeTruthy();
  });
  it('/validate/jwt (GET) copy headers multiple', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/validate/jwt?extractAsHeader=${encodeURIComponent(
          'x-1|$.realm_access.roles',
        )}&extractAsHeader=${encodeURIComponent('x-2|$.realm_access.roles')}`,
      )
      .set('x-auth-request-access-token', TEST_TOKEN)
      .expect(200);
    expect(res.header['x-1']).toBeTruthy();
    expect(res.header['x-2']).toBeTruthy();
  });

  it('/redirect (GET)', async () => {
    const testLink = 'this_text_ist_definitly_not_in_the_html';
    const res = await request(app.getHttpServer())
      .get(`/redirect?to=${testLink}`)
      .expect(200);
    expect(res.text).toContain(testLink);
  });
});
