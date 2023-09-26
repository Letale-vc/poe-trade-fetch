import { resolve } from 'path';
import { PoeTradeFetch } from './PoeTradeFetch';
import { PoeFirstResponseType } from './Types/PoeResponseType';
import { ConfigInputType } from './Types/types';
import { DEFAULT_CONFIG, LEAGUES_NAMES, REALMS } from './constants';
import { readFileSync } from 'fs';
import { RequestBodyType } from './Types/TradeRequestBodyType';

describe('PoeTradeFetch', () => {
  const poeTradeFetch = new PoeTradeFetch(DEFAULT_CONFIG);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('poeTradeFetch define', () => {
    expect(poeTradeFetch).toBeDefined();
  });

  // add tests for method update
  describe('update', () => {
    // update method can update config if give
    test('update method can update config if give', async () => {
      const config: ConfigInputType = {
        userAgent: 'test',
        leagueName: LEAGUES_NAMES.Hardcore,
        realm: REALMS.pc,
      };
      jest.spyOn(poeTradeFetch, 'getCurrentLeagueName').mockResolvedValue('test');
      await poeTradeFetch.update(config);
      expect(poeTradeFetch.config).toEqual(config);
    });

    test('update method should be update leagueName in poeTradeFetch instance ', async () => {
      const config: ConfigInputType = {
        userAgent: 'test',
        leagueName: LEAGUES_NAMES.Current,
        realm: REALMS.pc,
      };
      jest.spyOn(poeTradeFetch, 'getCurrentLeagueName').mockResolvedValue('test');
      await poeTradeFetch.update(config);
      expect(poeTradeFetch.leagueName).toEqual('test');
      expect(poeTradeFetch.config).toEqual(config);
    });
  });

  describe('poeTradeSearchUrl', () => {
    test('should make a trade search URL request, and take data', async () => {
      // spy mock  first request
      const firstResponseMock: PoeFirstResponseType = {
        result: [
          'testId',
          'testId',
          'testId',
          'testId',
          'testId',
          'testId',
          'testId',
          'testId',
          'testId',
          'testId',
          'testId',
        ],
        id: 'testId',
        complexity: 11,
        total: 11,
      };
      const firstRequestMock = jest.spyOn(poeTradeFetch, 'firsRequest').mockResolvedValue(firstResponseMock);
      // spy and mock second request
      const secondResponseDataMock = { result: [] };
      const mockSecondRequest = jest.spyOn(poeTradeFetch, 'secondRequest').mockResolvedValue(secondResponseDataMock);
      // spy mock getTradePage
      const pathTestPage = resolve('tests/MockPage.html');
      const testPage = readFileSync(pathTestPage, 'utf-8');
      const mockGetTradePage = jest.spyOn(poeTradeFetch, 'getTradePage').mockResolvedValue(testPage);
      const expectRequestBody: RequestBodyType = {
        query: {
          type: 'Choking Guilt',
          stats: [
            {
              type: 'and',
              filters: [],
              disabled: false,
            },
          ],
          status: 'online',
          filters: {
            type_filters: {
              filters: {
                category: {
                  option: 'card',
                },
              },
              disabled: false,
            },
          },
        },
        sort: { price: 'asc' },
      };
      const url = new URL('https://www.pathofexile.com/trade/search/testId');
      const result = await poeTradeFetch.poeTradeSearchUrl(url, 'testPoesessid');
      expect(result).toEqual(secondResponseDataMock);

      expect(firstRequestMock).toBeCalledTimes(1);
      expect(firstRequestMock).toBeCalledWith(expectRequestBody);

      expect(mockSecondRequest).toBeCalledTimes(1);
      const itemsIds = [
        'testId',
        'testId',
        'testId',
        'testId',
        'testId',
        'testId',
        'testId',
        'testId',
        'testId',
        'testId',
      ];
      expect(mockSecondRequest).toBeCalledWith(itemsIds, 'testId');

      expect(mockGetTradePage).toBeCalledWith('testId', 'testPoesessid');
      expect(mockGetTradePage).toBeCalledTimes(1);
    });
  });
});
