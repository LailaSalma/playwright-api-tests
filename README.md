# Playwright API Tests

![API tests](https://github.com/LailaSalma/playwright-api-tests/actions/workflows/api-tests.yml/badge.svg)

An API test automation project built with **Playwright Test** and **TypeScript**. It tests two public REST APIs and is structured the way a real API automation framework is: a client layer, fixtures with automatic cleanup, configuration through environment variables, a separate test-data module, JSON Schema validation of responses, an HTML report with the API responses attached, an Allure report with run history, parallel execution with isolated test data, a GitHub Actions pipeline that runs the suite on every push and pull request, once a day on a schedule and on demand, with its settings read from repository secrets and variables, and a way to run the whole suite in a Docker container from the official Playwright image.

The planned scope is complete. See [Roadmap](#roadmap) for what was built and for possible improvements.

## What this project demonstrates

| Topic | Where to look |
|---|---|
| API tests for GET, POST, PUT, DELETE with the `request` fixture | `tests/products.spec.ts`, `tests/products-write.spec.ts` |
| Chained requests (a value from one response used in the next request) | `tests/chained.spec.ts` |
| Data-driven tests with an expected status per row | `tests/products-data-driven.spec.ts` |
| Setup and teardown with hooks (`beforeAll`, `beforeEach`, `afterEach`, `afterAll`) against an API that stores data | `tests/booking-cleanup.spec.ts` |
| API client layer: one class per API, no assertions inside the client | `tests/clients/booking-client.ts`, `tests/booking-client.spec.ts` |
| Custom fixtures built on the client (client, token and booking fixtures, teardown after `use`) | `tests/booking-client-fixtures.ts`, `tests/booking-client-fixtures.spec.ts` |
| Configuration from environment variables with defaults | `tests/booking-config.ts` |
| Test data in one place, with overrides per test | `tests/booking-data.ts` |
| Response validation against a JSON Schema (Ajv), including negative tests that prove the schema can fail | `tests/booking-schema.ts`, `tests/booking-schema.spec.ts` |
| Reporting: one line per test in the terminal plus an HTML report; every response attached before any check (formatted JSON, or raw text when the body is not JSON) | `playwright.config.ts`, `tests/attach-response.ts`, `tests/booking-client-fixtures.spec.ts` |
| Allure report with run history: the Allure adapter writes raw results during the run, the Allure CLI builds the report; a history file records every run, so the report shows trends and status changes across runs. In CI the history file is kept between runs in the GitHub Actions cache | `playwright.config.ts`, `allurerc.mjs`, `.github/workflows/api-tests.yml` |
| Parallel execution: tests run in parallel (`fullyParallel: true`); each test creates and deletes its own booking, so no two tests share a record; a group that shares one read-only booking runs on a single worker (`test.describe.configure({ mode: 'default' })`) | `playwright.config.ts`, `tests/booking-cleanup.spec.ts` |
| CI with GitHub Actions: the suite runs on a fresh runner on every push and pull request to `main`, once a day on a schedule and on demand; the HTML and Allure reports are uploaded as artifacts even when tests fail | `.github/workflows/api-tests.yml` |
| Secrets in CI: the base URL comes from a repository variable, the credentials from repository secrets passed only to the test step and masked in the logs; the wiring was verified with a deliberately wrong secret value | `.github/workflows/api-tests.yml`, `tests/booking-config.ts` |
| Docker: the suite runs in a container from the official Playwright image, pinned to the project's Playwright version, with the project folder mounted and settings passed as environment variables; the wiring was verified with a deliberately wrong password | [Running the tests in Docker](#running-the-tests-in-docker) |

## Tech stack

- [Playwright Test](https://playwright.dev/docs/api-testing) (API testing with the built-in `request` fixture)
- TypeScript
- [Ajv](https://ajv.js.org/) for JSON Schema validation
- [Allure Report 3](https://allurereport.org/) (`allure-playwright` adapter and `allure` CLI) for the report with run history
- Node.js and npm
- GitHub Actions for CI
- Docker with the official [Playwright Docker image](https://playwright.dev/docs/docker) (`mcr.microsoft.com/playwright`)

## APIs under test

- **[DummyJSON](https://dummyjson.com/)** (products): read-only style tests. Its docs state that add, update and delete only simulate the change and store nothing, so these tests can run in parallel without affecting each other.
- **[Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html)** (bookings): a public API that stores data. Each test creates its own booking and deletes it afterwards (in a hook or in the teardown of a fixture), so repeated runs leave nothing behind.

Both APIs are shared public services. Tests assert rules (status, types, ranges, fields present) rather than exact values copied from a response, because the data of a public API can change.

## Project structure

```
playwright-api-tests/
├── .github/
│   └── workflows/
│       └── api-tests.yml         # CI: triggers (push, PR, daily schedule, manual), install, run the suite with secrets,
│                                 #     upload the HTML report, restore Allure history, generate the Allure report,
│                                 #     save the history, upload the Allure report
├── playwright.config.ts          # base URL for DummyJSON, chromium project, reporters (list + HTML + Allure), fullyParallel, CI settings
├── allurerc.mjs                  # Allure CLI settings: report name, output folder, history file
├── package.json
├── package-lock.json             # exact dependency versions; CI and the Docker run install from it with npm ci
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
    ├── booking-cleanup.spec.ts   # hooks-based setup/teardown (earlier approach); one read-only group runs on one worker
    ├── products.spec.ts
    ├── products-write.spec.ts
    ├── chained.spec.ts
    ├── products-data-driven.spec.ts
    └── example.spec.ts           # scaffold example from the Playwright installer (UI, needs a browser)
```

The file `booking-cleanup.spec.ts` shows the hooks-based approach. It is kept for comparison with the fixture-based version in `booking-client-fixtures.ts`.

Generated output is not committed (see `.gitignore`): `playwright-report/`, `test-results/`, `allure-results/`, `allure-report/` and the local history file `allure-history.jsonl`.

### How the pieces fit together

- **The client says how to talk to the API** (paths, headers, bodies). It only sends requests and returns the responses. It contains no assertions, because the test decides what counts as a pass (a negative test expects 404, a positive test expects 200).
- **Fixtures say when setup and teardown run.** The `booking` fixture creates a booking through the client, hands it to the test, and deletes it after the test, whether the test passed or failed. The delete is not in the test body, so a failing assertion cannot skip it.
- **Configuration, data and schema live in their own modules**, so a test file never contains a URL, a credential, a copy of the booking data or a copy of the response shape.
- **Assertions check the status first** (`toBeOK`) before reading a body, and verify that a write really stored the data with a follow-up GET instead of trusting the echo in the write response.
- **The response is attached before the assertions**, so when a test fails, the report shows the full body the API returned, not only the one field that failed.
- **Tests run in parallel worker processes that share no variables.** Test data is created per test (fixtures) or per group, never shared between tests, so the order of execution does not matter.
- **Two reports, two purposes.** The HTML report describes one run in detail. The Allure report adds history: it shows whether a test failed before, when it started failing and whether it switches between passed and failed (flaky).

## Getting started

Prerequisites: a Node.js version supported by Playwright (22, 24 or 26) and npm. To run the suite in a container instead, Docker Engine is enough (see [Running the tests in Docker](#running-the-tests-in-docker)).

```bash
git clone https://github.com/LailaSalma/playwright-api-tests.git
cd playwright-api-tests
npm ci
```

`npm ci` installs the exact versions from `package-lock.json`, the same way the CI pipeline does. Every package the tests import must be listed in `package.json`; a package installed only elsewhere on your machine would pass locally and fail in CI.

The API tests send HTTP requests directly and do not open a browser. Only the scaffold file `tests/example.spec.ts` uses one; to run it, install the browser with:

```bash
npx playwright install chromium
```

## Running the tests

Run every command from the project root (where `playwright.config.ts` and `allurerc.mjs` are).

```bash
# all tests (in parallel)
npm test

# one file
npx playwright test tests/booking-client-fixtures.spec.ts

# without parallelism (one worker), useful when debugging
npx playwright test --workers=1

# open the HTML report of the last run (stop with Ctrl+C)
npx playwright show-report

# all tests inside a Docker container (see below)
npm run test:docker
```

Every run prints one line per test in the terminal (`list` reporter) and writes an HTML report to `playwright-report/` (`html` reporter, never opened automatically). Tests attach the API response body to the report, so a failure can be diagnosed from the report without rerunning the test.

### Allure report with history

The Allure adapter writes raw results to `allure-results/` on every run. It does not clear that folder, so delete it before a run; otherwise the next report mixes several runs:

```bash
rm -rf allure-results
npx playwright test
npx allure generate ./allure-results --clean
npx allure open ./allure-report
```

- `generate` builds the report into `allure-report/` (`--clean` replaces the previous report) and appends one line for this run to `allure-history.jsonl` (`historyPath` in `allurerc.mjs`). The report reads that file, so trends and the History tab of each test grow with every run.
- `open` serves the report on localhost; stop it with Ctrl+C.
- Run `generate` as a separate command, not after `&&`: when a test fails, `npx playwright test` exits with code 1 and `&&` would skip the report for exactly that run.

### Running the tests in Docker

The suite can run in a container from the official Playwright image, so the result does not depend on the Node.js version, browsers or packages installed on the machine. The image contains Node.js, the browsers and their system libraries; the project's own packages are installed inside the container with `npm ci`, as in CI.

Prerequisite: Docker Engine, with your user allowed to run `docker` without `sudo` (Docker's post-installation steps for Linux).

From the project root:

```bash
npm run test:docker
```

This npm script (defined in `package.json`) runs the following command:

```bash
docker run --rm --ipc=host \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  -v "$(pwd)":/work \
  -w /work \
  mcr.microsoft.com/playwright:v1.64.0-noble \
  /bin/bash -c "npm ci && npx playwright test"
```

| Option | Why |
|---|---|
| `mcr.microsoft.com/playwright:v1.64.0-noble` | the image tag must match the `@playwright/test` version in `package-lock.json`; with a different version Playwright cannot find the browsers in the image. Update the tag when Playwright is upgraded |
| `-v "$(pwd)":/work` and `-w /work` | the project folder is mounted into the container (not copied) and used as the working folder, so the reports appear in the project folder after the run |
| `--user "$(id -u):$(id -g)"` | runs the container as your own user instead of `root`, so `node_modules/` and the report folders it writes stay owned by you |
| `-e HOME=/tmp` | gives npm a writable home folder for its cache when running as a non-root user |
| `--ipc=host` | recommended by the Playwright docs for Chromium, which can run out of memory in a container without it |
| `--rm` | removes the container when the run ends |

`npm ci` inside the container replaces the local `node_modules/` with a fresh install of the same versions. A container does not inherit the variables of your terminal; pass [configuration](#configuration) values with `-e`, for example `-e BOOKING_BASE_URL=https://staging.example.com`. The reports are opened afterwards on the host as described above.

## Continuous integration

The workflow `.github/workflows/api-tests.yml` runs on GitHub Actions.

**When it runs:**

- on every push to `main` and on every pull request into `main`; a failing run marks the commit or pull request with a red check
- every day at 06:45 Cairo time (`schedule` with `timezone: "Africa/Cairo"`), on the latest commit of `main`; this catches changes and outages on the API side that come without any commit in this repository. GitHub may start scheduled runs a few minutes late when it is busy
- on demand: **Actions** tab → **API tests** → **Run workflow** (`workflow_dispatch`)

**What it does, in order:**

1. Checks out the repository on a fresh Ubuntu runner
2. Installs the current Node.js LTS
3. Installs dependencies with `npm ci`
4. Installs Chromium with its system libraries (`npx playwright install --with-deps chromium`)
5. Runs the full suite (`npx playwright test`) with the Restful-Booker settings from the repository variable and secrets (see below)
6. Uploads `playwright-report/` as the artifact `playwright-report`
7. Restores the Allure history file from the GitHub Actions cache (see below)
8. Generates the Allure report (`npx allure generate ./allure-results --clean`), which appends this run to the history
9. Saves the updated history file to the cache
10. Uploads `allure-report/` as the artifact `allure-report`

Steps 6 and 8-10 run even when tests fail (`if: ${{ !cancelled() }}`), so the reports and the history line of a failing run are always kept.

**Reading a failure:** open the run in the **Actions** tab and download a report from the Artifacts section (kept for 30 days). Unzip it, then from the project root:

```bash
# HTML report: details of this run
npx playwright show-report <extracted-folder>

# Allure report: this run plus the history of earlier runs
npx allure open <extracted-folder>
```

### Allure report and run history

Every CI run starts on a fresh runner that is deleted afterwards, so the history file has to be stored outside it. The workflow keeps it in the GitHub Actions cache:

- **Save:** after the report is generated, the history file is stored under a key that is unique for each run (`allure-history-<run id>-<run attempt>`). A cache entry cannot be overwritten, which is why every run uses a new key.
- **Restore:** before the report is generated, the workflow asks for the most recent cache whose key starts with `allure-history-` and puts the file back at the path from `allurerc.mjs`. The first run finds nothing and starts a new history.
- **Separate restore and save actions** (`actions/cache/restore`, `actions/cache/save`) are used instead of the combined `actions/cache`, so the save step can run when tests have failed. A failing run is exactly the run the history must record.
- **Branch scope:** a run can restore caches from its own branch or from `main`. A pull request run reads the history of `main` but saves into its own scope, so the history on `main` contains only runs on `main` (push, scheduled and manual).
- **Retention:** GitHub removes caches that are not used for 7 days; the daily scheduled run keeps the history in use.

**Settings that differ in CI.** GitHub sets the environment variable `CI=true` on its runners, and `playwright.config.ts` reads it:

| Setting | Locally | In CI | Why |
|---|---|---|---|
| `workers` | chosen by Playwright | `1` | follows the Playwright recommendation for CI (stable, same order on every run). Measured: 4 workers gave no measurable gain, because the test step is about 9 s of a 33 s job and most of the job is installation. Parallel safety is still exercised by local runs |
| `retries` | `0` | `2` | a failing test is retried up to 2 times; a test that passes on a retry is reported as **flaky** and the run stays green, so flaky counts must be investigated |
| `forbidOnly` | `false` | `true` | a forgotten `test.only` fails the run instead of silently running a single test |

### Secrets and variables in CI

The workflow passes the [configuration](#configuration) values to the run from the repository settings, not from the code:

| Name | Stored as | Passed to |
|---|---|---|
| `BOOKING_BASE_URL` | repository variable | the whole job (`env:` at job level); not sensitive, so it stays readable in the logs |
| `BOOKING_USERNAME` | repository secret | only the `Test APIs` step (`env:` at step level); masked as `***` in the logs |
| `BOOKING_PASSWORD` | repository secret | only the `Test APIs` step (`env:` at step level); masked as `***` in the logs |

**Running the pipeline on a fork:** in the fork, open **Settings → Secrets and variables → Actions** and create the variable and the two secrets above at **repository** level (not environment level), with the names exactly as listed.

**Why a green run does not prove the secrets are used:** a missing or misspelled secret reaches the run as an empty value, and the config then falls back to its default, so the run stays green. The wiring was therefore verified once with a deliberately wrong secret value: the run turned red (403 on the requests that need a token) and turned green again after the value was restored. Pull requests from forks receive no secrets at all and run with the defaults.

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

The DummyJSON base URL is set in `playwright.config.ts`. The Allure report name, output folder and history file are set in `allurerc.mjs`.

In CI the values come from repository secrets and a variable (see [Secrets and variables in CI](#secrets-and-variables-in-ci)). In a Docker run they are passed with `-e` (see [Running the tests in Docker](#running-the-tests-in-docker)). The credentials of this API are public demo values, so the config keeps them as defaults and local runs work without any setup. Real secrets must never be given a default in code: for a real API, the credential defaults would be removed, values would come from a git-ignored `.env` file locally and from the secret store in CI, and a missing value would stop the run with a clear error.

## Roadmap

Done:
- [x] API tests with the `request` fixture (GET, POST, PUT, DELETE)
- [x] Hooks and fixtures with real cleanup against a persisting API
- [x] API client layer and fixtures built on it
- [x] Configuration from environment variables
- [x] Test data management
- [x] JSON Schema validation of responses
- [x] HTML report with attached API responses
- [x] Parallel execution with isolated test data
- [x] CI with GitHub Actions on push and pull request, HTML report uploaded as an artifact
- [x] CI: daily scheduled run, manual run, settings from repository secrets and variables
- [x] Allure report with run history, locally and in CI (history kept in the GitHub Actions cache)
- [x] Run the suite in a Docker container from the official Playwright image

Possible improvements (not planned for this project):
- Fail at login when the credentials are wrong (today a wrong password surfaces later, as a 403 on the cleanup `DELETE`)
- Publish the Allure report to GitHub Pages, so it can be opened without downloading the artifact

## Author

Laila Salma, QA engineer. GitHub: [LailaSalma](https://github.com/LailaSalma)
