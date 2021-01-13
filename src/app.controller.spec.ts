import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('/validate/jwt', () => {
    describe('getExtractAsHeader', () => {
      it('extractAsHeader not given returns []', () => {
        expect(appController.getExtractAsHeader(undefined)).toStrictEqual([]);
      });
      it('extractAsHeader simple given', () => {
        expect(appController.getExtractAsHeader(['test'])).toStrictEqual([
          'test',
        ]);
      });
      it('extract as header string given', () => {
        expect(appController.getExtractAsHeader('test')).toStrictEqual([
          'test',
        ]);
      });
    });
  });
});
