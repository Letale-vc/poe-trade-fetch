import MockAdapter from "axios-mock-adapter";
import {HttpRequest} from "./HttpRequest.js";
import {
  POE_API_BASE_URL,
  POE_API_FIRST_REQUEST,
  POE_API_SECOND_REQUEST,
  RATE_LIMIT_STATE_KEYS,
} from "./constants.js";

describe("HttpRequest", () => {
  let httpRequestNew: HttpRequest;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    httpRequestNew = new HttpRequest("test-user-agent");
    mockAxios = new MockAdapter(httpRequestNew.axiosInstance);
  });

  afterEach(() => {
    mockAxios.reset();
  });

  test("should create an axios instance with the correct base URL and headers", () => {
    expect(httpRequestNew.axiosInstance.defaults.baseURL).toBe(
      POE_API_BASE_URL,
    );
    expect(httpRequestNew.axiosInstance.defaults.headers).toEqual({
      "Content-Type": "application/json",
      "User-Agent": "test-user-agent",
      access: "*/*",
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": undefined,
      },
      delete: {},
      get: {},
      head: {},
      patch: {},
      post: {},
      put: {},
    });
  });

  test("should set POESESSID as default", () => {
    httpRequestNew.setPoesessidAsDefault("test-poesessid");
    expect(httpRequestNew.axiosInstance.defaults.headers.common["Cookie"]).toBe(
      "POESESSID=test-poesessid",
    );
  });

  test("should make a GET request and return the response data", async () => {
    mockAxios.onGet("/test").reply(200, {data: "test"});
    const data = await httpRequestNew.get("/test");
    expect(data).toEqual({data: "test"});
  });

  test("should make a POST request and return the response data", async () => {
    mockAxios.onPost("/test").reply(200, {data: "test"});
    const data = await httpRequestNew.post("/test", {key: "value"});
    expect(data).toEqual({data: "test"});
  });

  test("should get the correct rate limit key", () => {
    const firstRequestKey = httpRequestNew["getRateLimitKey"](
      POE_API_FIRST_REQUEST,
    );
    const secondRequestKey = httpRequestNew["getRateLimitKey"](
      POE_API_SECOND_REQUEST,
    );
    const otherKey = httpRequestNew["getRateLimitKey"]("/other");

    expect(firstRequestKey).toBe(RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST);
    expect(secondRequestKey).toBe(RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST);
    expect(otherKey).toBe(RATE_LIMIT_STATE_KEYS.OTHER);
  });
});
