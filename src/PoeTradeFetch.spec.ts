// import * as path from "path";
// import MockAdapter from "axios-mock-adapter";
// import {readFileSync} from "fs";
// import {PoeTradeFetch} from "./PoeTradeFetch.js";
// import {PoeFirstResponseType} from "./Types/PoeResponseType.js";
// import {RequestBodyType} from "./Types/TradeRequestBodyType.js";
// import {ConfigInputType} from "./Types/types.js";
// import {LEAGUES_NAMES, REALMS} from "./constants.js";

// describe("PoeTradeFetch", () => {
//   let poeTradeFetch: PoeTradeFetch;
//   let mockAxios: MockAdapter;

//   beforeEach(async () => {
//     jest.resetAllMocks();
//     poeTradeFetch = new PoeTradeFetch();
//     await poeTradeFetch.update();
//     mockAxios = new MockAdapter(poeTradeFetch.httpRequest.axiosInstance);
//   });
//   afterEach(() => {
//     jest.resetAllMocks();
//   });
//   test("poeTradeFetch define", () => {
//     expect(poeTradeFetch).toBeDefined();
//   });

//   // add tests for method update
//   describe("update", () => {
//     // update method can update config if give
//     test("update method can update config if give", async () => {
//       const config: ConfigInputType = {
//         userAgent: "test",
//         leagueName: LEAGUES_NAMES.Hardcore,
//         realm: REALMS.pc,
//         POESESSID: "test",
//       };
//       jest
//         .spyOn(poeTradeFetch, "getCurrentLeagueName")
//         .mockResolvedValue("test");
//       await poeTradeFetch.update(config);
//       expect(poeTradeFetch.config).toEqual(config);
//     });

//     test("update method should be update leagueName in poeTradeFetch instance ", async () => {
//       const config: ConfigInputType = {
//         userAgent: "test",
//         leagueName: LEAGUES_NAMES.Current,
//         realm: REALMS.pc,
//         POESESSID: "test",
//       };
//       jest
//         .spyOn(poeTradeFetch, "getCurrentLeagueName")
//         .mockResolvedValue("test");
//       await poeTradeFetch.update(config);
//       expect(poeTradeFetch.leagueName).toEqual("test");
//       expect(poeTradeFetch.config).toEqual(config);
//     });
//   });

//   describe("poeTradeSearchUrl", () => {
//     test("should make a trade search URL request, and take data", async () => {
//       // spy mock  first request
//       const firstResponseMock: PoeFirstResponseType = {
//         result: [
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//           "testId",
//         ],
//         id: "testId",
//         complexity: 11,
//         total: 11,
//       };
//       const firstRequestMock = jest
//         .spyOn(poeTradeFetch, "firsRequest")
//         .mockResolvedValue(firstResponseMock);
//       const secondResponseDataMock = {result: []};
//       const mockSecondRequest = jest
//         .spyOn(poeTradeFetch, "secondRequest")
//         .mockResolvedValue(secondResponseDataMock);
//       const pathTestPage = path.resolve("tests/MockPage.html");
//       const testPage = readFileSync(pathTestPage, "utf-8");
//       const mockGetTradePage = jest
//         .spyOn(poeTradeFetch, "getTradePage")
//         .mockResolvedValue(testPage);
//       const expectRequestBody: RequestBodyType = {
//         query: {
//           type: "Exalted Orb",
//           stats: [
//             {
//               type: "and",
//               filters: [],
//               disabled: true,
//             },
//           ],
//           status: "online",
//           filters: {
//             misc_filters: {
//               filters: {
//                 stack_size: {
//                   min: 5,
//                   max: null,
//                 },
//               },
//               disabled: false,
//             },
//             type_filters: {
//               filters: {
//                 category: {
//                   option: "currency",
//                 },
//               },
//               disabled: false,
//             },
//             trade_filters: {
//               filters: {
//                 price: {
//                   min: null,
//                   max: null,
//                   option: "chaos",
//                 },
//               },
//               disabled: false,
//             },
//           },
//         },
//         sort: {price: "asc"},
//       };
//       const url = new URL("https://www.pathofexile.com/trade/search/testId");
//       const result = await poeTradeFetch.poeTradeSearchUrl(
//         url,
//         "testPoesessid",
//       );
//       expect(result).toEqual(secondResponseDataMock);

//       expect(firstRequestMock).toBeCalledTimes(1);
//       expect(firstRequestMock).toBeCalledWith(expectRequestBody);

//       expect(mockSecondRequest).toBeCalledTimes(1);
//       const itemsIds = [
//         "testId",
//         "testId",
//         "testId",
//         "testId",
//         "testId",
//         "testId",
//         "testId",
//         "testId",
//         "testId",
//         "testId",
//       ];
//       expect(mockSecondRequest).toBeCalledWith(itemsIds, "testId");

//       expect(mockGetTradePage).toBeCalledWith("testId", "testPoesessid");
//       expect(mockGetTradePage).toBeCalledTimes(1);
//     });
//     test("should be return error", async () => {
//       const firstResponseMock: PoeFirstResponseType = {
//         result: [],
//         id: "testId",
//         complexity: 11,
//         total: 11,
//       };
//       jest
//         .spyOn(poeTradeFetch, "firsRequest")
//         .mockResolvedValue(firstResponseMock);
//       const secondResponseDataMock = {result: []};
//       jest
//         .spyOn(poeTradeFetch, "secondRequest")
//         .mockResolvedValue(secondResponseDataMock);
//       const pathTestPage = path.resolve("tests/mockPageLogin.html");
//       const testPage = readFileSync(pathTestPage, "utf-8");
//       jest.spyOn(poeTradeFetch, "getTradePage").mockResolvedValue(testPage);

//       const url = new URL("https://www.pathofexile.com/trade/search/testId");

//       await expect(
//         poeTradeFetch.poeTradeSearchUrl(url, "testPoesessid"),
//       ).rejects.toThrow("Unknown page state structure");
//     });
//   });

//   describe("getTradePage", () => {
//     test("should make a trade search URL request, and take data", async () => {
//       const pathTestPage = path.resolve("tests/MockPage.html");
//       const testPage = readFileSync(pathTestPage, "utf-8");
//       mockAxios.onAny().reply(200, testPage);
//       const result = await poeTradeFetch.getTradePage(
//         "testId",
//         "testPoesessid",
//       );
//       expect(result).toEqual(testPage);
//     });
//   });
//   describe("secondRequest", () => {
//     test("should be return date", async () => {
//       const dataMock = {result: []};
//       mockAxios.onAny().reply(200, dataMock);
//       const result = await poeTradeFetch.secondRequest(
//         ["testId", "testId"],
//         "kekId",
//       );
//       expect(result).toEqual(dataMock);
//     });
//   });
//   describe("firstRequest", () => {
//     test("should be return date", async () => {
//       const dataMock = {result: []};
//       const requestBodyMock: RequestBodyType = {query: {}};
//       mockAxios.onAny().reply(200, dataMock);
//       const result = await poeTradeFetch.firsRequest(requestBodyMock);
//       expect(result).toEqual(dataMock);
//     });
//   });
// });

import {PoeTradeFetch} from "./PoeTradeFetch";
import {LeagueResponseType} from "./Types/PoeLeagueResponseType.js";
import {
  PoeFirstResponseType,
  PoeSecondResponseType,
} from "./Types/PoeResponseType.js";
import {RequestBodyType} from "./Types/TradeRequestBodyType.js";
import {ConfigInputType} from "./Types/types.js";
import {DEFAULT_CONFIG, POE_API_SECOND_REQUEST, REALMS} from "./constants.js";
import {HttpRequest} from "./httpRequest/HttpRequest.js";

jest.mock("./httpRequest/HttpRequest.js");

describe("PoeTradeFetch", () => {
  let instance: PoeTradeFetch;
  let mockHttpRequest: jest.Mocked<HttpRequest>;

  beforeEach(() => {
    mockHttpRequest = new HttpRequest(
      DEFAULT_CONFIG,
    ) as jest.Mocked<HttpRequest>;
    (HttpRequest as jest.Mock).mockImplementation(() => mockHttpRequest);
    instance = new PoeTradeFetch({userAgent: "test-app"});
  });

  describe("update", () => {
    it("should update the configuration", async () => {
      const newConfig: ConfigInputType = {userAgent: "test-app"};
      await instance.update(newConfig);
      expect(instance.config.userAgent).toBe("test-app");
    });
  });

  describe("getInstance", () => {
    it("should return an instance of PoeTradeFetch", () => {
      const instance = PoeTradeFetch.getInstance({userAgent: "test-app"});
      expect(instance).toBeInstanceOf(PoeTradeFetch);
    });
  });

  describe("leagueNames", () => {
    it("should return league names", async () => {
      const leagueNames = ["League1", "League2"];
      mockHttpRequest.get.mockResolvedValue({result: leagueNames});

      const result = await instance.leagueList();
      expect(result).toEqual({result: leagueNames});
    });
  });

  describe("getCurrentLeagueName", () => {
    it("should return current league name", async () => {
      const leagueList: LeagueResponseType = [
        {
          id: "1",
          realm: "pc",
          url: "url1",
          startAt: "2022-01-01T00:00:00Z",
          endAt: "2222-01-01T00:00:00Z",
          description: "description1",
          category: {id: "LeagueId1", current: true},
          registerAt: null,
          delveEvent: true,
          rules: [
            {id: "rule1", name: "ruleName1", description: "ruleDescription1"},
          ],
          event: true,
        },
        {
          id: "2",
          realm: "pc",
          url: "url2",
          startAt: "2022-01-01T00:00:00Z",
          endAt: null,
          description: "description2",
          category: {id: "LeagueId2"},
          registerAt: null,
          delveEvent: false,
          rules: [
            {id: "rule2", name: "ruleName2", description: "ruleDescription2"},
          ],
          event: false,
        },
      ];
      mockHttpRequest.get.mockResolvedValue(leagueList);

      const result = await instance.getCurrentLeagueName();
      expect(result).toBe("LeagueId1");
    });
  });

  describe("getTradeDataItems", () => {
    it("should return trade data items", async () => {
      const tradeDataItems = ["Item1", "Item2"];
      mockHttpRequest.get.mockResolvedValue({result: tradeDataItems});

      const result = await instance.getTradeDataItems();
      expect(result).toEqual({result: tradeDataItems});
    });
  });

  describe("firsRequest", () => {
    it("should make a POST request to the correct path", async () => {
      const requestQuery: RequestBodyType = {
        query: {status: {option: "online"}},
      };
      const response: PoeFirstResponseType = {
        id: "query-id",
        result: ["id1", "id2"],
      } as PoeFirstResponseType;
      mockHttpRequest.post.mockResolvedValue(response);

      const result = await instance.firsRequest(requestQuery);
      expect(result).toEqual(response);

      expect(mockHttpRequest.post).toHaveBeenCalledWith(
        expect.stringContaining(instance.leagueName),
        requestQuery,
        undefined,
      );
    });
  });

  describe("secondRequest", () => {
    it("should make a GET request to the correct path with pc realm", async () => {
      const arrayIds = ["id1", "id2", "id3"];
      const queryId = "query-id";
      const response: PoeSecondResponseType = {result: []};
      mockHttpRequest.get.mockResolvedValue(response);

      const result = await instance.secondRequest(arrayIds, queryId);
      expect(result).toEqual(response);

      const expectedPath = `${POE_API_SECOND_REQUEST}${arrayIds.join(
        ",",
      )}?query=${queryId}`;
      expect(mockHttpRequest.get).toHaveBeenCalledWith(expectedPath, undefined);
    });

    it("should make a GET request to the correct path with non-pc realm", async () => {
      const arrayIds = ["id1", "id2", "id3"];
      const queryId = "query-id";
      const response: PoeSecondResponseType = {
        result: [],
      } as PoeSecondResponseType;
      mockHttpRequest.get.mockResolvedValue(response);
      instance.config.realm = REALMS.xbox; // set non-pc realm

      const result = await instance.secondRequest(arrayIds, queryId);
      expect(result).toEqual(response);

      const expectedPath = `${POE_API_SECOND_REQUEST}${arrayIds.join(
        ",",
      )}?query=${queryId}&realm=${REALMS.xbox}`;
      expect(mockHttpRequest.get).toHaveBeenCalledWith(expectedPath, undefined);
    });

    it("should throw an error if the request fails", async () => {
      const arrayIds = ["id1", "id2", "id3"];
      const queryId = "query-id";
      mockHttpRequest.get.mockRejectedValue(new Error());

      await expect(instance.secondRequest(arrayIds, queryId)).rejects.toThrow();
    });
  });
});
