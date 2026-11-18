import type { Page } from '@playwright/test'

export async function returnToWindow(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
  })
}

export async function chooseProjectInSelect(page: Page, projectName: string) {
  await page.getByRole('complementary').getByRole('button', { name: /Trocar de projeto/ }).click()
  await page.getByRole('menuitemradio', { name: new RegExp(projectName) }).click()
}
