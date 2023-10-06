import MockAdapter from 'axios-mock-adapter';
import { AxiosResponse } from 'axios';
import { HTTPRequest } from './HTTPRequest';
import { POE_API_BASE_URL, POE_API_TRADE_DATA_LEAGUES_URL } from './constants';

describe('PoeTradeFetch', () => {
  let axiosInstance: HTTPRequest;
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    jest.resetAllMocks();
    axiosInstance = new HTTPRequest('');
    mockAxios = new MockAdapter(axiosInstance.axiosInstance);
  });
  afterEach(() => {
    mockAxios.reset();
    jest.resetAllMocks();
  });
  test('poeTradeFetch define', () => {
    expect(axiosInstance).toBeDefined();
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

      const updatedState = axiosInstance._updateRateLimits(axiosResponse);

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
    it('should delay requests when rate limits are exceeded for both account and IP', async () => {
      const initState = [
        [5, 10, 0],
        [15, 60, 0],
        [0, 300, 0],
      ];
      const limit = initState
        .map((el) => {
          const array = el.map((el) => el);
          return array.join(':');
        })
        .join(',');

      mockAxios.onAny().reply(
        200,
        { result: [] },
        {
          'x-rate-limit-ip': '8:10:60,15:60:120,60:300:1800',
          'x-rate-limit-ip-state': limit,
          'x-rate-account-ip': '3:5:60',
          'x-rate-account-ip-state': [0, 5, 0],
        },
      );

      await axiosInstance.axiosInstance.post('https://www.pathofexile.com/api/trade/search/Ancestor');
      await expect(
        axiosInstance.axiosInstance.post('https://www.pathofexile.com/api/trade/search/Ancestor'),
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('get', () => {
    it('should be correct url', async () => {
      const initState = [
        [5, 10, 0],
        [14, 60, 0],
        [0, 300, 0],
      ];
      //   axiosInstance._requestStateRateLimits[POE_API_SECOND_REQUEST].ipLimitState = initState;

      const limit = initState
        .map((el) => {
          const array = el.map((el) => el);
          return array.join(':');
        })
        .join(',');
      const test = mockAxios.onGet().reply(
        200,
        { result: [] },
        {
          'x-rate-limit-ip': '8:10:60,15:60:120,60:300:1800',
          'x-rate-limit-ip-state': limit,
          'x-rate-account-ip': '3:5:60',
          'x-rate-account-ip-state': [0, 5, 0],
        },
      );

      await axiosInstance.get(POE_API_TRADE_DATA_LEAGUES_URL);
      expect(test.history.get[0].baseURL).toBe(POE_API_BASE_URL);
      expect(test.history.get[0].url).toBe(POE_API_TRADE_DATA_LEAGUES_URL);
    });
  });
});
