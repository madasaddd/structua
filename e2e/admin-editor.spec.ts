import { test, expect } from '@playwright/test'

// Run serially — tests mutate block state
test.describe.configure({ mode: 'serial' })

test.describe('Admin Block Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Go to dashboard and navigate to Day 1's editor
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Content Dashboard' })).toBeVisible()

    // Click the first "Edit →" link
    await page.getByRole('link', { name: 'Edit →' }).first().click()
    await page.waitForURL('**/admin/day/**')

    // Wait for editor to render
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.getByText('Add Block')).toBeVisible()
  })

  test('should load the editor page', async ({ page }) => {
    // Header should show week/day info
    await expect(page.getByText(/Week \d+ · Day \d+/)).toBeVisible()

    // Block type buttons should be visible
    await expect(page.getByRole('button', { name: '📝 Text' })).toBeVisible()
    await expect(page.getByRole('button', { name: '💡 Callout' })).toBeVisible()
    await expect(page.getByRole('button', { name: '📊 Table' })).toBeVisible()
    await expect(page.getByRole('button', { name: '🖼 Image' })).toBeVisible()
    await expect(page.getByRole('button', { name: '— Divider' })).toBeVisible()
  })

  test('should add a text block', async ({ page }) => {
    // Count existing "🗑 Delete" buttons (one per block)
    const deletesBefore = await page.getByRole('button', { name: '🗑 Delete' }).count()

    await page.getByRole('button', { name: '📝 Text' }).click()

    // Wait for new block to appear (delete count increases)
    await expect(page.getByRole('button', { name: '🗑 Delete' })).toHaveCount(deletesBefore + 1, { timeout: 10000 })
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible()
  })

  test('should add a callout block', async ({ page }) => {
    const deletesBefore = await page.getByRole('button', { name: '🗑 Delete' }).count()

    await page.getByRole('button', { name: '💡 Callout' }).click()

    await expect(page.getByRole('button', { name: '🗑 Delete' })).toHaveCount(deletesBefore + 1, { timeout: 10000 })
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible()
  })

  test('should add a divider block', async ({ page }) => {
    const deletesBefore = await page.getByRole('button', { name: '🗑 Delete' }).count()

    await page.getByRole('button', { name: '— Divider' }).click()

    await expect(page.getByRole('button', { name: '🗑 Delete' })).toHaveCount(deletesBefore + 1, { timeout: 10000 })
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible()
  })

  test('should delete a block', async ({ page }) => {
    const deletesBefore = await page.getByRole('button', { name: '🗑 Delete' }).count()

    // Delete the last block
    const lastDeleteBtn = page.getByRole('button', { name: '🗑 Delete' }).last()
    // Force-click since the button may have opacity:0 until hover
    await lastDeleteBtn.click({ force: true })

    // Block count should decrease by 1
    await expect(page.getByRole('button', { name: '🗑 Delete' })).toHaveCount(deletesBefore - 1, { timeout: 10000 })
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible()
  })

  test('should toggle publish state', async ({ page }) => {
    const publishBtn = page.getByRole('button', { name: /Published|Draft/ })
    const initialText = await publishBtn.textContent()

    await publishBtn.click()
    await page.waitForTimeout(1000)

    const newText = await publishBtn.textContent()
    if (initialText?.includes('Published')) {
      expect(newText).toContain('Draft')
    } else {
      expect(newText).toContain('Published')
    }

    // Toggle back to restore original state
    await publishBtn.click()
    await page.waitForTimeout(500)
  })
})
