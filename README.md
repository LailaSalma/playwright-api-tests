# Playwright API Tests

An API test automation project built with **Playwright Test** and **TypeScript**. It tests two public REST APIs and is structured the way a real API automation framework is: a client layer, fixtures with automatic cleanup, configuration through environment variables, a separate test-data module, JSON Schema validation of responses, and an HTML report with the API responses attached.

The project is under active development. See [Roadmap](#roadmap) for what is done and what is planned.

## What this project demonstrates

| Topic | Where to look |
|---|---|
| API tests for GET, POST, PUT, DELETE with the `request` fixture | `tests/products.spec.ts`, `tests/products-write.spec.ts` |
| Chained requests (a value from one response used in the next request) | `tests/chained.spec.ts` |
| Data-driven tests with an expected status per row | `tests/products-data-driven.spec.ts` |
| Setup and teardown with hooks (`beforeAll`, `beforeEach`, `afterEach`, `afterAll`) against an API that stores data | `tests/booking-cleanup.spec.ts` |
| Custom fixtures with setup and teardown (token, booking) | `tests/fixtures.ts`, `tests/booking-fixture.spec.ts` |
| API client layer: one class per API, no assertions inside the client | `tests/clients/booking-client.ts`, `tests/booking-client.spec.ts` |
| Fixtures built on the client (client, token and booking fixtures, teardown after `use`) | `tests/booking-client-fixtures.ts`, `tests/booking-client-fixtures.spec.ts` |
| Configuration from environment variables with defaults | `tests/booking-config.ts` |
| Test data in one place, with overrides per test | `tests/booking-data.ts` |
| Response validation against a JSON Schema (Ajv), including negative tests that prove the schema can fail | `tests/booking-schema.ts`, `tests/booking-schema.spec.ts` |
| Reporting: one line per test in the terminal plus an HTML report; every response attached before any check (formatted JSON, or raw text when the body is not JSON) | `playwright.config.ts`, `tests/attach-response.ts`, `tests/booking-client-fixtures.spec.ts` |

## Tech stack

- [Playwright Test](https://playwright.dev/docs/api-testing) (API testing with the built-in `request` fixture)
- TypeScript
- [Ajv](https://ajv.js.org/) for JSON Schema validation
- Node.js and npm

## APIs under test

- **[DummyJSON](https://dummyjson.com/)** (products): read-only style tests. Its docs state that add, update and delete only simulate the change and store nothing, so these tests can run in parallel without affecting each other.
- **[Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html)** (bookings): a public API that stores data. Each test creates its own booking and deletes it afterwards (in a hook or in the teardown of a fixture), so repeated runs leave nothing behind.

Both APIs are shared public services. Tests assert rules (status, types, ranges, fields present) rather than exact values copied from a response, because the data of a public API can change.

## Project structure

```
playwright-api-tests/
├── playwright.config.ts          # base URL for DummyJSON, chromium project, reporters (list + HTML)
├── package.json
└── tests/
    ├── clients/
    │   └── booking-client.ts     # BookingClient: how to talk to the Restful-Booker API
    ├── booking-config.ts         # base URL and credentials from environment variables
    ├── booking-data.ts           # default booking data and a builder with overrides
    ├── booking-schema.ts         # JSON Schema of a booking and the validation helper
    ├── attach-response.ts        # attaches a response to the HTML report (formatted JSON or raw text)
    ├── booking-client-fixtures.ts# fixtures: bookingClient, token, booking (with teardown)
    ├── booking-client.spec.ts
    ├── booking-client-fixtures.spec.ts
    ├── booking-schema.spec.ts
    ├── booking-cleanup.spec.ts   # hooks-based setup/teardown (earlier approach)
    ├── fixtures.ts               # fixtures with raw requests (earlier approach)
    ├── booking-fixture.spec.ts
    ├── products.spec.ts
    ├── products-write.spec.ts
    ├── chained.spec.ts
    ├── products-data-driven.spec.ts
    └── example.spec.ts           # scaffold example from the Playwright installer (UI, needs a browser)
```

The files `booking-cleanup.spec.ts`, `fixtures.ts` and `booking-fixture.spec.ts` show the hooks-based and raw-request approaches. They are kept for comparison with the client-based version.

### How the pieces fit together

- **The client says how to talk to the API** (paths, headers, bodies). It only sends requests and returns the responses. It contains no assertions, because the test decides what counts as a pass (a negative test expects 404, a positive test expects 200).
- **Fixtures say when setup and teardown run.** The `booking` fixture creates a booking through the client, hands it to the test, and deletes it after the test, whether the test passed or failed. The delete is not in the test body, so a failing assertion cannot skip it.
- **Configuration, data and schema live in their own modules**, so a test file never contains a URL, a credential, a copy of the booking data or a copy of the response shape.
- **Assertions check the status first** (`toBeOK`) before reading a body, and verify that a write really stored the data with a follow-up GET instead of trusting the echo in the write response.
- **The response is attached before the assertions**, so when a test fails, the report shows the full body the API returned, not only the one field that failed.

## Getting started

Prerequisites: a Node.js version supported by Playwright (22, 24 or 26) and npm.

```bash
git clone https://github.com/LailaSalma/playwright-api-tests.git
cd playwright-api-tests
npm install
```

The API tests send HTTP requests directly and do not open a browser. Only the scaffold file `tests/example.spec.ts` uses one; to run it, install the browser with:

```bash
npx playwright install chromium
```

## Running the tests

Run every command from the project root (where `playwright.config.ts` is).

```bash
# all tests
npm test

# one file
npx playwright test tests/booking-client-fixtures.spec.ts

# open the HTML report of the last run (stop with Ctrl+C)
npx playwright show-report
```

Every run prints one line per test in the terminal (`list` reporter) and writes an HTML report to `playwright-report/` (`html` reporter, never opened automatically). Tests attach the API response body to the report, so a failure can be diagnosed from the report without rerunning the test. The `playwright-report/` folder is generated on each run and is not committed.

## Configuration

The Restful-Booker settings are read from environment variables. If a variable is not set, the default is used (the defaults are the public demo credentials of the Restful-Booker API).

| Variable | Default | Purpose |
|---|---|---|
| `BOOKING_BASE_URL` | `https://restful-booker.herokuapp.com` | API base URL |
| `BOOKING_USERNAME` | `admin` | login for `POST /auth` |
| `BOOKING_PASSWORD` | `password123` | login for `POST /auth` |

Example: run against another environment without changing code.

```bash
BOOKING_BASE_URL=https://staging.example.com npx playwright test tests/booking-client.spec.ts
```

The DummyJSON base URL is set in `playwright.config.ts`.

Real secrets must never be given a default in code. They would come from the environment or from the secret store of the CI system.

## Roadmap

Done:
- [x] API tests with the `request` fixture (GET, POST, PUT, DELETE)
- [x] Hooks and fixtures with real cleanup against a persisting API
- [x] API client layer and fixtures built on it
- [x] Configuration from environment variables
- [x] Test data management
- [x] JSON Schema validation of responses
- [x] HTML report with attached API responses

Planned:
- [ ] Reporting with Allure (evaluate)
- [ ] Parallel execution settings
- [ ] CI with GitHub Actions (run on pull request and on a schedule, reports as artifacts, secrets)
- [ ] UI tests with Page Objects that use the API for test data setup

## Author

Laila Salma, QA engineer. GitHub: [LailaSalma](https://github.com/LailaSalma)
