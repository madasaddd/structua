import { test as setup, expect } from '@playwright/test'

const ADMIN_EMAIL = 'asadalbalad29@gmail.com'
const ADMIN_PASSWORD = 'Admin1234!'

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/admin/login')

  await page.getByPlaceholder('Email address').fill(ADMIN_EMAIL)
  await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for redirect to the admin dashboard
  await page.waitForURL('**/admin', { timeout: 15000 })
  await expect(page.getByText('Content Dashboard')).toBeVisible()

  // Save authenticated state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' })
})
