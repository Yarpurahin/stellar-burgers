import { test, expect, Page } from '@playwright/test';

const bunName = 'Краторная булка N-200i';
const ingredientName = 'Биокотлета из марсианской Магнолии';

test.beforeEach(async ({ page, context }) => {
  await page.routeFromHAR('./tests/hars/ingredients.har', {
    url: '**/api/ingredients*',
    update: false
  });

  await page.routeFromHAR('./tests/hars/user.har', {
    url: '**/api/auth/user',
    update: false
  });

  await page.routeFromHAR('./tests/hars/orders.har', {
    url: '**/api/orders**',
    update: false
  });

  await context.addCookies([
    {
      name: 'accessToken',
      value: 'Bearer mock-access-token',
      url: 'http://localhost:4000'
    }
  ]);

  await page.addInitScript(() => {
    localStorage.setItem(
      'refreshToken',
      'mock-refresh-token'
    );
  });
});

test.describe('ингредиенты', () => {
  test.beforeEach('переход на "/"', async ({page}) => {
    await page.goto('/');
  });

  test('ингредиенты добавлены', async ({page}) => {
    await expect (
      page.getByRole('listitem').first()
    ).toBeVisible();
  })

  test('добавление конкретного ингредиента', async ({ page }) => {
    const bunLink = page.getByRole('link').filter({
      has: page.getByText('Краторная булка N-200i', {
        exact: true
      })
    });

    const meatLink = page.getByRole('link').filter({
      has: page.getByText('Биокотлета из марсианской Магнолии', {
        exact: true
      })
    });

    await expect(bunLink).toHaveCount(1);
    await expect(meatLink).toHaveCount(1)

    const bunCard = bunLink.locator('..');
    const bunAddButton = bunCard.getByRole('button', {
      name: /добавить/i
    });

    const meatCard = meatLink.locator('..');
    const meatAddButton = meatCard.getByRole('button', {
      name: /добавить/i
    });

    await expect(bunAddButton).toBeVisible();
    await bunAddButton.click();

    await expect(meatAddButton).toBeVisible();
    await meatAddButton.click();

    await expect(
      page
      .locator('.constructor-element_pos_top')
      .locator('.constructor-element__text')
    )
    .toContainText('Краторная булка N-200i');

    await expect(
      page
      .locator('.constructor-element')
      .locator('.constructor-element__text')
      .filter({hasText: 'Биокотлета из марсианской Магнолии'})
    )
    .toContainText('Биокотлета из марсианской Магнолии');

    await expect(page.getByTestId('burger-price'))
      .toContainText('2934');
  });

  test('открытие/закрытие модалки ингредиента', async ({page}) => {
    await page.getByRole('link').filter({
      has: page.getByText('Краторная булка N-200i')
    }).click();

    const modal = page.getByRole('dialog');

    await expect(modal).toBeVisible();

    await expect(
    modal.getByText('Краторная булка N-200i', {
      exact: true
    })
  ).toBeVisible();

    await page.getByTestId('modal-close').click();

    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();

  });
})

const assembleBurger = async (page: Page) => {
  const bun = page
    .getByRole('listitem')
    .filter({ hasText: bunName });

  await bun
    .getByRole('button', { name: 'Добавить' })
    .click();

  const ingredient = page
    .getByRole('listitem')
    .filter({ hasText: ingredientName });

  await ingredient
    .getByRole('button', { name: 'Добавить' })
    .click();
};

const createOrder = async (page: Page) => {
  await assembleBurger(page);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/orders') &&
      response.request().method() === 'POST'
  );

  await page
    .getByRole('button', { name: 'Оформить заказ' })
    .click();

  const response = await responsePromise;

  const data = await response.json();

  await expect(
    page.getByText(String(data.order.number))
  ).toBeVisible();

  return data;
};

test.describe('заказ', () => {
  test.beforeEach(async({page}) => {
    await page.goto('/', {
        waitUntil: 'domcontentloaded'
      });
  })

  test('пользователь авторизован', async ({ page }) => {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/auth/user') &&
      response.request().method() === 'GET'
  );

  const response = await responsePromise;
  const data = await response.json();

  expect(response.status()).toBe(200);
  expect(data.success).toBe(true);

  await expect(
    page.getByText(data.user.name)
  ).toBeVisible();
});

  test('токен авторизации подставляется в запрос', async ({ page }) => {
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/auth/user') &&
        request.method() === 'GET'
    );

    const request = await requestPromise;

    expect(request.headers().authorization).toBe(
      'Bearer mock-access-token'
    );
  });

 test('бургер собирается', async ({ page }) => {

  await assembleBurger(page);

  await expect(
    page
      .locator('.constructor-element__text')
      .filter({ hasText: ingredientName })
  ).toBeVisible();
});

  test('по кнопке "Оформить заказ" создаётся заказ', async ({ page }) => {

  await assembleBurger(page);

  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().endsWith('/orders') &&
      request.method() === 'POST'
  );

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/orders') &&
      response.request().method() === 'POST'
  );

  await page
    .getByRole('button', { name: 'Оформить заказ' })
    .click();

  const request = await requestPromise;
  const response = await responsePromise;

  const requestBody = request.postDataJSON();
  const responseBody = await response.json();

  expect(requestBody.ingredients).toBeDefined();
  expect(requestBody.ingredients.length).toBeGreaterThan(0);

  expect(response.status()).toBe(200);
  expect(responseBody.success).toBe(true);
  expect(responseBody.order).toBeDefined();
});

  test('после создания заказа открывается модалка с номером заказа', async ({
  page
}) => {

  const orderData = await createOrder(page);

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();

  await expect(
    modal.getByText(String(orderData.order.number))
  ).toBeVisible();
});

  test('после создания заказа конструктор очищается', async ({ page }) => {

  await createOrder(page);

  await expect(
    page.getByTestId('choose-bun')
  ).toHaveCount(2);

  await expect(
    page.getByTestId('choose-filling')
  ).toBeVisible();
});

  test('модалка заказа закрывается по нажатию на крестик', async ({
  page
}) => {

  const orderData = await createOrder(page);

  const modal = page.getByRole('dialog');

  await expect(modal).toBeVisible();

  await modal.getByTestId('modal-close').click();

  await expect(modal).toHaveCount(0);

  await expect(
    page.getByText(String(orderData.order.number))
  ).toHaveCount(0);
});
});
