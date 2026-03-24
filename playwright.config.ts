import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // --- Auth Setup (runs first) ---
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // --- Admin Tests (depend on auth) ---
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /admin-.+\.spec\.ts/,
    },

    // --- Student Tests (no auth needed) ---
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /admin-.+\.spec\.ts|auth\.setup\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: /admin-.+\.spec\.ts|auth\.setup\.ts/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
