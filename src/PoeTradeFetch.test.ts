import assert from "node:assert";
import test, { describe, beforeEach, it, mock, afterEach } from "node:test";
import { PoeTradeFetch } from "./PoeTradeFetch";
import type { ConfigInputType } from "./Types/HelperTypes.js";
import type { LeagueResponseType } from "./Types/PoeLeagueResponseType.js";
import type { PoeFirstResponse, PoeSecondResponse } from "./Types/PoeResponse.js";
import type { RequestBodyType } from "./Types/TradeRequestBodyType.js";
import { LEAGUES_NAMES, POE_API_SECOND_REQUEST, REALMS } from "./constants.js";

describe("PoeTradeFetch", () => {
	let poeTradeFetch: PoeTradeFetch;

	beforeEach(() => {
		poeTradeFetch = PoeTradeFetch.createInstance({ userAgent: "test-app" });
	});
	afterEach(() => {
		PoeTradeFetch.dispose();
	});

	describe("update", () => {
		it("should update the configuration", async () => {
			const newConfig: ConfigInputType = { userAgent: "test-app" };
			await poeTradeFetch.updateConfig(newConfig);
			assert.strictEqual(poeTradeFetch.config.userAgent, "test-app");
		});
	});

	describe("getInstance", () => {
		it("should return an instance of PoeTradeFetch", () => {
			const instance = PoeTradeFetch.createInstance({
				userAgent: "test-app",
			});
			assert.strictEqual(instance instanceof PoeTradeFetch, true);
		});
	});

	describe("leagueNames", () => {
		it("should return league names", async () => {
			const leagueNames = ["League1", "League2"];
			mock.method(poeTradeFetch.httpRequest, "get", () => Promise.resolve({ result: leagueNames }));
			const result = await poeTradeFetch.leagueList();
			assert.deepStrictEqual(result, { result: leagueNames });
		});
	});

	describe("updateLeagueName", () => {
		test("should update leagueName to Standard if current league not found", async () => {
			const config: ConfigInputType = {
				userAgent: "test",
				leagueName: LEAGUES_NAMES.Current,
				realm: REALMS.pc,
				POESESSID: "test",
			};

			mock.method(poeTradeFetch, "getCurrentLeagueName", () => Promise.resolve(undefined));
			assert.rejects(poeTradeFetch.updateConfig(config));
			assert.rejects(poeTradeFetch.updateLeagueName());
		});

		test("should update leagueName to current league if found", async () => {
			const config: ConfigInputType = {
				userAgent: "test",
				leagueName: LEAGUES_NAMES.Current,
				realm: REALMS.pc,
				POESESSID: "test",
			};
			mock.method(poeTradeFetch, "getCurrentLeagueName", () => Promise.resolve("testLeague"));
			await poeTradeFetch.updateConfig(config);
			await poeTradeFetch.updateLeagueName();
			assert.strictEqual(poeTradeFetch.leagueName, "testLeague");
		});

		test("should not update leagueName if it does not include Current", async () => {
			const config: ConfigInputType = {
				userAgent: "test",
				leagueName: LEAGUES_NAMES.Hardcore,
				realm: REALMS.pc,
				POESESSID: "test",
			};
			await poeTradeFetch.updateConfig(config);
			await poeTradeFetch.updateLeagueName();
			assert.strictEqual(poeTradeFetch.leagueName, LEAGUES_NAMES.Hardcore);
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
					category: { id: "LeagueId1", current: true },
					registerAt: null,
					delveEvent: true,
					rules: [
						{
							id: "rule1",
							name: "ruleName1",
							description: "ruleDescription1",
						},
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
					category: { id: "LeagueId2" },
					registerAt: null,
					delveEvent: false,
					rules: [
						{
							id: "rule2",
							name: "ruleName2",
							description: "ruleDescription2",
						},
					],
					event: false,
				},
			];
			mock.method(poeTradeFetch.httpRequest, "get", () => Promise.resolve(leagueList));
			const result = await poeTradeFetch.getCurrentLeagueName();
			assert.strictEqual(result, "LeagueId1");
		});
	});

	describe("getTradeDataItems", () => {
		it("should return trade data items", async () => {
			const tradeDataItems = ["Item1", "Item2"];
			mock.method(poeTradeFetch.httpRequest, "get", () => Promise.resolve({ result: tradeDataItems }));
			const result = await poeTradeFetch.getTradeDataItems();
			assert.deepStrictEqual(result, {
				result: tradeDataItems,
			});
		});

		describe("firsRequest", () => {
			it("should make a POST request to the correct path", async () => {
				const requestQuery: RequestBodyType = {
					query: { status: { option: "online" } },
				};
				const response: PoeFirstResponse = {
					id: "query-id",
					result: ["id1", "id2"],
				} as PoeFirstResponse;

				const mockPost = mock.method(poeTradeFetch.httpRequest, "post", () => Promise.resolve(response));
				const result = await poeTradeFetch.firsRequest(requestQuery);
				assert.deepStrictEqual(result, response);
				assert.deepStrictEqual(mockPost.mock.calls[0].arguments, [
					"api/trade/search/Standard",
					requestQuery,
					undefined,
				]);
			});
		});

		describe("secondRequest", () => {
			it("should make a GET request to the correct path with pc realm", async () => {
				const arrayIds = ["id1", "id2", "id3"];
				const queryId = "query-id";
				const response: PoeSecondResponse = { result: [] };

				const mockGet = mock.method(poeTradeFetch.httpRequest, "get", () => Promise.resolve(response));
				const result = await poeTradeFetch.secondRequest(arrayIds, queryId);

				assert.deepStrictEqual(result, response);
				const expectedPath = `${POE_API_SECOND_REQUEST}${arrayIds.join(",")}?query=${queryId}`;
				assert.deepStrictEqual(mockGet.mock.calls[0].arguments, [expectedPath, undefined]);
			});

			it("should make a GET request to the correct path with non-pc realm", async () => {
				const arrayIds = ["id1", "id2", "id3"];
				const queryId = "query-id";
				const response: PoeSecondResponse = {
					result: [],
				} as PoeSecondResponse;

				const mockGet = mock.method(poeTradeFetch.httpRequest, "get", () => Promise.resolve(response));

				poeTradeFetch.config.realm = REALMS.xbox; // set non-pc realm

				const result = await poeTradeFetch.secondRequest(arrayIds, queryId);
				assert.deepStrictEqual(result, response);
				const expectedPath = `${POE_API_SECOND_REQUEST}${arrayIds.join(
					",",
				)}?query=${queryId}&realm=${REALMS.xbox}`;
				assert.deepStrictEqual(mockGet.mock.calls[0].arguments, [expectedPath, undefined]);
			});

			it("should throw an error if the request fails", async () => {
				const arrayIds = ["id1", "id2", "id3"];
				const queryId = "query-id";
				const mockGet = mock.method(poeTradeFetch.httpRequest, "get", () => Promise.reject(new Error()));

				assert.rejects(poeTradeFetch.secondRequest(arrayIds, queryId));
			});
		});
	});
});
