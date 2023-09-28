import { resolve } from 'path';
import { PoeTradeFetch } from './PoeTradeFetch';
import { PoeFirstResponseType } from './Types/PoeResponseType';
import { ConfigInputType } from './Types/types';
import { LEAGUES_NAMES, REALMS } from './constants';
import { readFileSync } from 'fs';
import { RequestBodyType } from './Types/TradeRequestBodyType';
import MockAdapter from 'axios-mock-adapter';
import * as util from './Helpers/Utils';
import { AxiosResponse } from 'axios';

describe('PoeTradeFetch', () => {
  let poeTradeFetch: PoeTradeFetch;
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    jest.resetAllMocks();
    poeTradeFetch = new PoeTradeFetch();
    await poeTradeFetch.update();
    mockAxios = new MockAdapter(poeTradeFetch.axiosInstance);
  });
  afterEach(() => {
    mockAxios.reset();
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
    it('should update accountLimitState, ipLimitState, accountLimit, and ipLimit based on response headers', async () => {
      const responseHeaders = {
        'x-rate-limit-account-state': '1:5:0',
        'x-rate-limit-account': '3:5:60',
        'x-rate-limit-ip-state': '1:10:0,0:60:26,92:300:1530',
        'x-rate-limit-ip': '8:10:60,15:60:120,60:300:1800',
      };
      const responseData = {
        result: [],
      };

      const axiosResponse = {
        data: responseData,
        headers: responseHeaders,
      } as unknown as AxiosResponse;

      const stateBeforeRequest = {
        accountLimitState: [],
        ipLimitState: [],
        accountLimit: [],
        ipLimit: [],
      };

      const updatedState = poeTradeFetch._updateRateLimits(axiosResponse, stateBeforeRequest);

      expect(updatedState.accountLimitState).toEqual([[1, 5, 0]]);
      expect(updatedState.ipLimitState).toEqual([
        [1, 10, 0],
        [0, 60, 26],
        [92, 300, 1530],
      ]);
      expect(updatedState.accountLimit).toEqual([[3, 5, 60]]);
      expect(updatedState.ipLimit).toEqual([
        [8, 10, 60],
        [15, 60, 120],
        [60, 300, 1800],
      ]);
    });
  });

  describe('PoeTradeFetch axios request Interceptor', () => {
    // Тест для інтерцептора запитів
    // it('should delay requests when rate limits are exceeded for both account and IP', async () => {
    //   const initState = [
    //     [0, 10, 0],
    //     [0, 60, 0],
    //     [0, 300, 0],
    //   ];
    //   const mockDelay = jest.spyOn(util, 'delay').mockResolvedValue();
    //   for (let i = 0; i < initState[1][1]; i++) {
    //     if (i === 60) {
    //       console.log('kek'); //?
    //     }
    //     const limit = initState
    //       .map((el) => {
    //         const array = el.map((el, index) => (index === 0 ? i : el));
    //         return array.join(':');
    //       })
    //       .join(',');

    //     const test = mockAxios
    //       .onAny()
    //       .reply(
    //         200,
    //         { result: [] },
    //         { 'x-rate-limit-ip': '8:10:60,15:60:120,60:300:1800', 'x-rate-limit-ip-state': limit },
    //       );
    //     await poeTradeFetch.axiosInstance.post('https://www.pathofexile.com/api/trade/search/Ancestor');
    //     test.resetHandlers();
    //   }

    //   const waitTime2 =
    //     poeTradeFetch.firstRequestStateLimit.ipLimit[0][1] / poeTradeFetch.firstRequestStateLimit.ipLimit[0][0];
    //   const waitTime3 =
    //     poeTradeFetch.firstRequestStateLimit.ipLimit[1][1] / poeTradeFetch.firstRequestStateLimit.ipLimit[1][0];
    //   // expect(mockDelay).toHaveBeenCalledWith(waitTime1);
    //   expect(mockDelay).toHaveBeenCalledWith(waitTime2);
    //   expect(mockDelay).toHaveBeenCalledWith(waitTime3);
    //   expect(mockDelay).toBeCalledTimes(52);
    // });
    it('should delay requests when rate limits are exceeded for both account and IP', async () => {
      const initState = [
        [5, 10, 0],
        [14, 60, 0],
        [0, 300, 0],
      ];
      poeTradeFetch.firstRequestStateLimit.ipLimitState = initState;
      const mockDelay = jest.spyOn(util, 'delay').mockResolvedValue();
      const limit = initState
        .map((el) => {
          const array = el.map((el) => el);
          return array.join(':');
        })
        .join(',');

      mockAxios
        .onAny()
        .reply(
          200,
          { result: [] },
          { 'x-rate-limit-ip': '8:10:60,15:60:120,60:300:1800', 'x-rate-limit-ip-state': limit },
        );
      await poeTradeFetch.axiosInstance.post('https://www.pathofexile.com/api/trade/search/Ancestor');

      const waitTime3 =
        poeTradeFetch.firstRequestStateLimit.ipLimit[1][1] / poeTradeFetch.firstRequestStateLimit.ipLimit[1][0];
      expect(mockDelay).toHaveBeenCalledWith(waitTime3);
      expect(mockDelay).toBeCalledTimes(1);
    });
  });
});
