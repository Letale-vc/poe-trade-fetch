import * as path from "path";
import MockAdapter from "axios-mock-adapter";
import {readFileSync} from "fs";
import {PoeTradeFetch} from "./PoeTradeFetch.js";
import {PoeFirstResponseType} from "./Types/PoeResponseType.js";
import {RequestBodyType} from "./Types/TradeRequestBodyType.js";
import {ConfigInputType} from "./Types/types.js";
import {LEAGUES_NAMES, REALMS} from "./constants.js";

describe("PoeTradeFetch", () => {
  let poeTradeFetch: PoeTradeFetch;
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    jest.resetAllMocks();
    poeTradeFetch = new PoeTradeFetch();
    await poeTradeFetch.update();
    mockAxios = new MockAdapter(poeTradeFetch.httpRequest.axiosInstance);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test("poeTradeFetch define", () => {
    expect(poeTradeFetch).toBeDefined();
  });

  // add tests for method update
  describe("update", () => {
    // update method can update config if give
    test("update method can update config if give", async () => {
      const config: ConfigInputType = {
        userAgent: "test",
        leagueName: LEAGUES_NAMES.Hardcore,
        realm: REALMS.pc,
        POESESSID: "test",
      };
      jest
        .spyOn(poeTradeFetch, "getCurrentLeagueName")
        .mockResolvedValue("test");
      await poeTradeFetch.update(config);
      expect(poeTradeFetch.config).toEqual(config);
    });

    test("update method should be update leagueName in poeTradeFetch instance ", async () => {
      const config: ConfigInputType = {
        userAgent: "test",
        leagueName: LEAGUES_NAMES.Current,
        realm: REALMS.pc,
        POESESSID: "test",
      };
      jest
        .spyOn(poeTradeFetch, "getCurrentLeagueName")
        .mockResolvedValue("test");
      await poeTradeFetch.update(config);
      expect(poeTradeFetch.leagueName).toEqual("test");
      expect(poeTradeFetch.config).toEqual(config);
    });
  });

  describe("poeTradeSearchUrl", () => {
    test("should make a trade search URL request, and take data", async () => {
      // spy mock  first request
      const firstResponseMock: PoeFirstResponseType = {
        result: [
          "testId",
          "testId",
          "testId",
          "testId",
          "testId",
          "testId",
          "testId",
          "testId",
          "testId",
          "testId",
          "testId",
        ],
        id: "testId",
        complexity: 11,
        total: 11,
      };
      const firstRequestMock = jest
        .spyOn(poeTradeFetch, "firsRequest")
        .mockResolvedValue(firstResponseMock);
      const secondResponseDataMock = {result: []};
      const mockSecondRequest = jest
        .spyOn(poeTradeFetch, "secondRequest")
        .mockResolvedValue(secondResponseDataMock);
      const pathTestPage = path.resolve("tests/MockPage.html");
      const testPage = readFileSync(pathTestPage, "utf-8");
      const mockGetTradePage = jest
        .spyOn(poeTradeFetch, "getTradePage")
        .mockResolvedValue(testPage);
      const expectRequestBody: RequestBodyType = {
        query: {
          type: "Exalted Orb",
          stats: [
            {
              type: "and",
              filters: [],
              disabled: true,
            },
          ],
          status: "online",
          filters: {
            misc_filters: {
              filters: {
                stack_size: {
                  min: 5,
                  max: null,
                },
              },
              disabled: false,
            },
            type_filters: {
              filters: {
                category: {
                  option: "currency",
                },
              },
              disabled: false,
            },
            trade_filters: {
              filters: {
                price: {
                  min: null,
                  max: null,
                  option: "chaos",
                },
              },
              disabled: false,
            },
          },
        },
        sort: {price: "asc"},
      };
      const url = new URL("https://www.pathofexile.com/trade/search/testId");
      const result = await poeTradeFetch.poeTradeSearchUrl(
        url,
        "testPoesessid",
      );
      expect(result).toEqual(secondResponseDataMock);

      expect(firstRequestMock).toBeCalledTimes(1);
      expect(firstRequestMock).toBeCalledWith(expectRequestBody);

      expect(mockSecondRequest).toBeCalledTimes(1);
      const itemsIds = [
        "testId",
        "testId",
        "testId",
        "testId",
        "testId",
        "testId",
        "testId",
        "testId",
        "testId",
        "testId",
      ];
      expect(mockSecondRequest).toBeCalledWith(itemsIds, "testId");

      expect(mockGetTradePage).toBeCalledWith("testId", "testPoesessid");
      expect(mockGetTradePage).toBeCalledTimes(1);
    });
    test("should be return error", async () => {
      const firstResponseMock: PoeFirstResponseType = {
        result: [],
        id: "testId",
        complexity: 11,
        total: 11,
      };
      jest
        .spyOn(poeTradeFetch, "firsRequest")
        .mockResolvedValue(firstResponseMock);
      const secondResponseDataMock = {result: []};
      jest
        .spyOn(poeTradeFetch, "secondRequest")
        .mockResolvedValue(secondResponseDataMock);
      const pathTestPage = path.resolve("tests/mockPageLogin.html");
      const testPage = readFileSync(pathTestPage, "utf-8");
      jest.spyOn(poeTradeFetch, "getTradePage").mockResolvedValue(testPage);

      const url = new URL("https://www.pathofexile.com/trade/search/testId");

      await expect(
        poeTradeFetch.poeTradeSearchUrl(url, "testPoesessid"),
      ).rejects.toThrow("Unknown page state structure");
    });
  });

  describe("getTradePage", () => {
    test("should make a trade search URL request, and take data", async () => {
      const pathTestPage = path.resolve("tests/MockPage.html");
      const testPage = readFileSync(pathTestPage, "utf-8");
      mockAxios.onAny().reply(200, testPage);
      const result = await poeTradeFetch.getTradePage(
        "testId",
        "testPoesessid",
      );
      expect(result).toEqual(testPage);
    });
  });
  describe("secondRequest", () => {
    test("should be return date", async () => {
      const dataMock = {result: []};
      mockAxios.onAny().reply(200, dataMock);
      const result = await poeTradeFetch.secondRequest(
        ["testId", "testId"],
        "kekId",
      );
      expect(result).toEqual(dataMock);
    });
  });
  describe("firstRequest", () => {
    test("should be return date", async () => {
      const dataMock = {result: []};
      const requestBodyMock: RequestBodyType = {query: {}};
      mockAxios.onAny().reply(200, dataMock);
      const result = await poeTradeFetch.firsRequest(requestBodyMock);
      expect(result).toEqual(dataMock);
    });
  });
});
