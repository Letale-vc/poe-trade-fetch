import MockAdapter from "axios-mock-adapter";
import {HTTPRequest} from "./HTTPRequest.js";
import {
  POE_API_BASE_URL,
  POE_API_FIRST_REQUEST,
  POE_API_SECOND_REQUEST,
  POE_API_TRADE_DATA_LEAGUES_URL,
} from "./constants.js";

describe("PoeTradeFetch", () => {
  let axiosInstance: HTTPRequest;
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    jest.resetAllMocks();
    axiosInstance = new HTTPRequest("");
    mockAxios = new MockAdapter(axiosInstance.axiosInstance);
  });
  afterEach(() => {
    mockAxios.reset();
    jest.resetAllMocks();
  });
  test("poeTradeFetch define", () => {
    expect(axiosInstance).toBeDefined();
  });

  describe("PoeTradeFetch axios Response Interceptor", () => {
    it("should verify rate limits after making API requests ", async () => {
      const firstResponseHeaders = {
        "x-rate-limit-account-state": "1:5:0",
        "x-rate-limit-account": "3:5:60",
        "x-rate-limit-ip-state": "1:10:0",
        "x-rate-limit-ip": "8:10:60",
      };
      const secondResponseHeaders2 = {
        "x-rate-limit-account-state": "1:3:1",
        "x-rate-limit-account": "3:3:1",
        "x-rate-limit-ip-state": "1:30:1",
        "x-rate-limit-ip": "8:30:1",
      };

      const responseData = {
        result: [],
      };

      mockAxios
        .onAny("https://www.pathofexile.com/api/trade/search/Ancestor")
        .reply(200, responseData, firstResponseHeaders);
      mockAxios
        .onAny("https://www.pathofexile.com/api/trade/fetch/")
        .reply(200, responseData, secondResponseHeaders2);

      await axiosInstance.axiosInstance.get(
        "https://www.pathofexile.com/api/trade/fetch/",
      );
      await axiosInstance.axiosInstance.post(
        "https://www.pathofexile.com/api/trade/search/Ancestor",
      );

      const firsRequestState = axiosInstance.requestStatesRateLimitsMap.get(
        POE_API_FIRST_REQUEST,
      );
      expect(firsRequestState?.accountLimitState).toEqual([[1, 5, 0]]);
      expect(firsRequestState?.ipLimitState).toEqual([[1, 10, 0]]);
      expect(firsRequestState?.accountLimit).toEqual([[3, 5, 60]]);
      expect(firsRequestState?.ipLimit).toEqual([[8, 10, 60]]);

      const secondRequestState = axiosInstance.requestStatesRateLimitsMap.get(
        POE_API_SECOND_REQUEST,
      );
      expect(secondRequestState?.accountLimitState).toEqual([[1, 3, 1]]);
      expect(secondRequestState?.ipLimitState).toEqual([[1, 30, 1]]);
      expect(secondRequestState?.accountLimit).toEqual([[3, 3, 1]]);
      expect(secondRequestState?.ipLimit).toEqual([[8, 30, 1]]);
    });
  });

  describe("PoeTradeFetch axios request Interceptor", () => {
    it("should delay requests when rate limits are exceeded for both account and IP", async () => {
      const initState = [
        [5, 10, 0],
        [15, 60, 0],
        [0, 300, 0],
      ];
      const limit = initState
        .map(el => {
          const array = el.map(el => el);
          return array.join(":");
        })
        .join(",");

      mockAxios.onAny().reply(
        200,
        {result: []},
        {
          "x-rate-limit-ip": "8:10:60,15:60:120,60:300:1800",
          "x-rate-limit-ip-state": limit,
          "x-rate-account-ip": "3:5:60",
          "x-rate-account-ip-state": [0, 5, 0],
        },
      );

      await axiosInstance.axiosInstance.get(
        "https://www.pathofexile.com/api/trade/search/Ancestor",
      );
      await expect(
        axiosInstance.axiosInstance.post(
          "https://www.pathofexile.com/api/trade/search/Ancestor",
        ),
      ).rejects.toThrow("Rate limit exceeded");
    });
  });

  describe("get", () => {
    it("should be correct url", async () => {
      const initState = [
        [5, 10, 0],
        [14, 60, 0],
        [0, 300, 0],
      ];
      //   axiosInstance._requestStateRateLimits[POE_API_SECOND_REQUEST].ipLimitState = initState;

      const limit = initState
        .map(el => {
          const array = el.map(el => el);
          return array.join(":");
        })
        .join(",");
      const test = mockAxios.onGet().reply(
        200,
        {result: []},
        {
          "x-rate-limit-ip": "8:10:60,15:60:120,60:300:1800",
          "x-rate-limit-ip-state": limit,
          "x-rate-account-ip": "3:5:60",
          "x-rate-account-ip-state": [0, 5, 0],
        },
      );

      await axiosInstance.get(POE_API_TRADE_DATA_LEAGUES_URL);
      expect(test.history.get[0].baseURL).toBe(POE_API_BASE_URL);
      expect(test.history.get[0].url).toBe(POE_API_TRADE_DATA_LEAGUES_URL);
    });
  });
});
