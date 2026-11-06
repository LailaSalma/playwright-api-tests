import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Playwright API tests',
  output: './allure-report',
  historyPath: './allure-history.jsonl',
});
