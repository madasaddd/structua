import { test, expect } from '@playwright/test'

test.describe('Responsive Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE size

  test('should hide desktop sidebar on mobile', async ({ page }) => {
    await page.goto('/')

    // Desktop sidebar should not be visible
    const desktopSidebar = page.locator('aside.hidden.lg\\:flex')
    await expect(desktopSidebar).not.toBeVisible()
  })

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.goto('/')

    // Hamburger button should be visible
    const hamburger = page.locator('#mobile-menu-toggle')
    await expect(hamburger).toBeVisible()
  })

  test('should open mobile sidebar drawer on hamburger click', async ({ page }) => {
    await page.goto('/')

    // Click hamburger
    const hamburger = page.locator('#mobile-menu-toggle')
    await hamburger.click()

    // Wait for drawer animation
    await page.waitForTimeout(400)

    // Mobile sidebar should be visible — check the fixed overlay container
    const mobileDrawer = page.locator('.fixed.inset-0.z-50')
    await expect(mobileDrawer).toBeVisible()

    // Week listings should be visible inside drawer
    await expect(mobileDrawer.getByText(/Week 1/).first()).toBeVisible()
  })

  test('should close mobile sidebar when clicking backdrop', async ({ page }) => {
    await page.goto('/')

    // Open sidebar
    await page.locator('#mobile-menu-toggle').click()
    await page.waitForTimeout(400)

    // Click backdrop (the dark overlay)
    const backdrop = page.locator('.bg-gray-900\\/40')
    await backdrop.click({ position: { x: 350, y: 300 } })

    await page.waitForTimeout(400)

    // Sidebar should be closed (overlay should have pointer-events-none)
    const overlay = page.locator('.fixed.inset-0.z-50')
    await expect(overlay).toHaveClass(/pointer-events-none/)
  })

  test('should close mobile sidebar on navigation', async ({ page }) => {
    await page.goto('/')

    // Open sidebar
    await page.locator('#mobile-menu-toggle').click()
    await page.waitForTimeout(400)

    // Click a day link
    const dayLink = page.locator('.fixed.inset-0.z-50 a[href*="/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()

      // Wait for navigation and drawer close
      await page.waitForTimeout(500)

      // The drawer should now be closed
      const overlay = page.locator('.fixed.inset-0.z-50')
      await expect(overlay).toHaveClass(/pointer-events-none/)
    }
  })

  test('should render blocks readable on mobile viewport', async ({ page }) => {
    await page.goto('/')

    // Open sidebar and navigate to a day
    await page.locator('#mobile-menu-toggle').click()
    await page.waitForTimeout(400)

    const dayLink = page.locator('.fixed.inset-0.z-50 a[href*="/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()
      await page.waitForLoadState('networkidle')

      // Content should be visible and readable
      const heading = page.locator('h1').first()
      await expect(heading).toBeVisible()

      // Check no horizontal overflow on the page
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // tiny tolerance
    }
  })
})
