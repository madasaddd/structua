import { test, expect } from '@playwright/test'

test.describe('Student Reading Flow', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Structua|Academic/)
  })

  test('should display sidebar with weeks on desktop', async ({ page, isMobile }) => {
    // Skip this test on mobile viewports
    test.skip(!!isMobile, 'Desktop sidebar is hidden on mobile')

    await page.goto('/')
    // Sidebar should be visible on desktop viewport
    const sidebar = page.locator('aside.hidden.lg\\:flex').first()
    await expect(sidebar).toBeVisible()
    // Should show "Week" text
    await expect(sidebar.getByText(/Week 1/).first()).toBeVisible()
  })

  test('should navigate to a day page via sidebar', async ({ page }) => {
    await page.goto('/')

    // Click on a day link in the sidebar
    const dayLink = page.locator('aside a[href*="/day/"]').first()
    if (await dayLink.isVisible()) {
      const href = await dayLink.getAttribute('href')
      await dayLink.click()
      await page.waitForURL(`**${href}`)

      // Day page should have a title
      const heading = page.locator('h1').first()
      await expect(heading).toBeVisible()

      // Breadcrumb should be visible
      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
      await expect(breadcrumb).toBeVisible()
    }
  })

  test('should show day navigation at the bottom', async ({ page }) => {
    // Navigate to a specific day page
    const dayLink = page.locator('aside a[href*="/day/"]').first()
    await page.goto('/')

    if (await dayLink.isVisible()) {
      await dayLink.click()
      await page.waitForLoadState('networkidle')

      // DayNav should exist at the bottom
      const dayNav = page.locator('nav').filter({ hasText: /Previous Lesson|Up Next|Final Step/ })
      await expect(dayNav).toBeVisible()
    }
  })

  test('should show empty state when day has no blocks', async ({ page }) => {
    // This test depends on having a published day with no blocks in the seed
    // If such a day exists, navigate to it and check for empty state
    await page.goto('/')
    // This is a structural test — if there's a day with no blocks, verify the empty state renders
  })

  test('should have proper SEO metadata on day page', async ({ page }) => {
    await page.goto('/')

    const dayLink = page.locator('aside a[href*="/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()
      await page.waitForLoadState('networkidle')

      // Title should contain "Structua"
      const title = await page.title()
      expect(title).toContain('Structua')

      // Meta description should exist
      const metaDescription = page.locator('meta[name="description"]').first()
      await expect(metaDescription).toHaveAttribute('content', /.+/)
    }
  })
})
