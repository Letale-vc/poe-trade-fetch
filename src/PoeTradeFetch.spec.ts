import { resolve } from 'path';
import { PoeTradeFetch } from './PoeTradeFetch';
import { PoeFirstResponseType } from './Types/PoeResponseType';
import { ConfigInputType } from './Types/types';
import { LEAGUES_NAMES, REALMS } from './constants';
import { readFileSync } from 'fs';
import { RequestBodyType } from './Types/TradeRequestBodyType';
import MockAdapter from 'axios-mock-adapter';
import * as util from './Helpers/Utils';

describe('PoeTradeFetch', () => {
  let poeTradeFetch: PoeTradeFetch;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    poeTradeFetch = new PoeTradeFetch();
    mockAxios = new MockAdapter(poeTradeFetch.axiosInstance);
    jest.resetAllMocks();
  });
  afterEach(() => {
    mockAxios.restore();
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

  describe('PoeTradeFetch axios Response Interceptor', () => {
    it('should update accountLimitState and ipLimitState based on response headers', async () => {
      const responseHeaders = {
        'X-Rate-Limit-Account-State': '1:5:0',
        'X-Rate-Limit-Ip-State': '1:10:0,0:60:26,92:300:1530',
      };
      const responseData = {
        result: [],
      };
      mockAxios.onAny().reply(200, responseData, responseHeaders);
      await poeTradeFetch.axiosInstance.get('http://test.kek');
      expect(poeTradeFetch.firstRequestStateLimit.accountLimitState).toEqual([[1, 5, 0]]);
      expect(poeTradeFetch.firstRequestStateLimit.ipLimitState).toEqual([
        [1, 10, 0],
        [0, 60, 26],
        [92, 300, 1530],
      ]);
    });
  });
  describe('PoeTradeFetch axios request Interceptor', () => {
    // Тест для інтерцептора запитів
    it('should delay requests when rate limits are exceeded for both account and IP', async () => {
      mockAxios
        .onAny()
        .reply(
          200,
          { result: [] },
          { 'X-Rate-Limit-Account-State': '1:5:0', 'X-Rate-Limit-Ip-State': '1:10:0,0:60:26,92:300:1530' },
        );
      poeTradeFetch.firstRequestStateLimit.accountLimitState = [
        [1, 4, 12],
        [1, 12, 25],
      ];
      poeTradeFetch.firstRequestStateLimit.ipLimitState = [
        [1, 10, 0],
        [59, 60, 26],
        [92, 300, 1530],
      ];
      const mockDelay = jest.spyOn(util, 'delay').mockResolvedValue();
      await poeTradeFetch.axiosInstance.get('http://test.kek');
      expect(mockDelay).toBeCalledWith(26);
      expect(mockDelay).toBeCalledTimes(2);
    });
  });
});
