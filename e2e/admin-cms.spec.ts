import { test, expect } from '@playwright/test'

// Run serially — these tests mutate shared data (weeks/days in the database)
test.describe.configure({ mode: 'serial' })

test.describe('Admin CMS Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Content Dashboard' })).toBeVisible()
  })

  test('should load dashboard with weeks', async ({ page }) => {
    // At least one Week should be visible with "Week N:" text
    await expect(page.getByText('Week 1:')).toBeVisible()
  })

  test('should add a new week', async ({ page }) => {
    const addWeekBtn = page.getByRole('button', { name: /Add a New Week/i })
    // Wait for it to be enabled (not in processing state)
    await expect(addWeekBtn).toBeEnabled({ timeout: 10000 })

    // Count "Week N:" labels before adding
    const weeksBefore = await page.getByText(/^Week \d+:$/).count()

    await addWeekBtn.click()

    // Wait for the new week card to appear
    await expect(page.getByText(`Week ${weeksBefore + 1}:`)).toBeVisible({ timeout: 10000 })
  })

  test('should delete an empty week', async ({ page }) => {
    // Get the number of weeks AFTER the one we added in the previous test
    const weekCountBefore = await page.getByText(/^Week \d+:$/).count()

    // The last week (was just added) should be empty, so its Delete button is enabled
    // Find the last Delete button
    const allDeleteBtns = page.getByRole('button', { name: 'Delete' })
    const lastDelete = allDeleteBtns.last()
    await expect(lastDelete).toBeEnabled({ timeout: 10000 })

    await lastDelete.click()

    // Week count should decrease
    await expect(page.getByText(/^Week \d+:$/)).toHaveCount(weekCountBefore - 1, { timeout: 10000 })
  })

  test('should disable Delete on weeks that contain days', async ({ page }) => {
    // Week 1 has 7 seeded days — its Delete button should be disabled
    const week1Text = page.getByText('Week 1:')
    const week1Card = week1Text.locator('..')  // parent div
    // Instead, find the first Delete button (corresponds to Week 1)
    const firstDelete = page.getByRole('button', { name: 'Delete' }).first()
    await expect(firstDelete).toBeDisabled()
  })

  test('should disable Add Day on a full week (7 days)', async ({ page }) => {
    // Week 1 has 7 days — its "+ Add Day" button should be disabled
    const firstAddDay = page.getByRole('button', { name: /Add Day/i }).first()
    await expect(firstAddDay).toBeDisabled()
  })

  test('should inline-edit a week title', async ({ page }) => {
    // Get the first week's title textbox
    const titleInput = page.getByRole('textbox').first()
    const original = await titleInput.inputValue()

    await titleInput.click()
    await titleInput.fill('Test Theme')
    await titleInput.blur()

    // Wait for save
    await page.waitForTimeout(1000)

    // Reload to verify persistence
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Content Dashboard' })).toBeVisible()
    const updatedInput = page.getByRole('textbox').first()
    await expect(updatedInput).toHaveValue('Test Theme')

    // Restore
    await updatedInput.click()
    await updatedInput.fill(original)
    await updatedInput.blur()
    await page.waitForTimeout(1000)
  })

  test('should show dynamic global day indexes', async ({ page }) => {
    // D1 and D2 badges should render
    await expect(page.getByText('D1', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('D2', { exact: true }).first()).toBeVisible()
  })
})
