import { test, expect, Page } from '@playwright/test';

test.describe('ингредиенты', () => {
  test.beforeEach('мок ингредиентов', async ({ page }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients*',
      update: false,
    });

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

    await expect(
      page
      .locator('.text')
      .filter({hasText: '2934'})
    )
    .toContainText('2934');
  });

  test('открытие/закрытие модалки ингредиента', async ({page}) => {
    await page.getByRole('link').filter({
      has: page.getByText('Краторная булка N-200i')
    }).click();

    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible();

    await page.getByTestId('modal-close').click();

    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();

  });
})

const orderNumber = 12345;

const mockUser = {
  success: true,
  user: {
    email: 'test@test.com',
    name: 'Test User'
  }
};

const mockOrder = {
  success: true,
  name: 'test-order',
  order:
    {
      _id: 'test-order-id',
      ingredients: [],
      owner: 'test-owner',
      status: 'done',
      name: 'test-burger',
      createdAt: '2026-08-11T00:00:00.000Z',
      updatedAt: '2026-08-11T00:00:00.000Z',
      number: orderNumber
    }
};

const mockFeed = {
  success: true,
  orders: [],
  total: 0,
  totalToday: 0
};

const mockUserOrders = {
  success: true,
  orders: []
};

const assembleBurger = async (page: Page) => {
  const bun = page
    .getByRole('listitem')
    .filter({ hasText: 'Краторная булка N-200i' });

  await bun
    .getByRole('button', { name: 'Добавить' })
    .click();

  const ingredient = page
    .getByRole('listitem')
    .filter({ hasText: 'Биокотлета из марсианской Магнолии' });

  await ingredient
    .getByRole('button', { name: 'Добавить' })
    .click();
};

const createOrder = async (page: Page) => {
  await assembleBurger(page);

  await page
    .getByRole('button', { name: 'Оформить заказ' })
    .click();

  await expect(
    page.getByText(String(orderNumber))
  ).toBeVisible();
};

test.describe('заказ', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients*',
      update: false
    });

    await page.route('**/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser)
      });
    });

    await page.route('**/orders/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFeed)
      });
    });

    await page.route(`**/orders`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockOrder)
        });

        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUserOrders)
      });
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

  test('пользователь авторизован', async ({ page }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });

    await expect(
      page.getByText(mockUser.user.name)
    ).toBeVisible();
  });

  test('токен авторизации подставляется в запрос', async ({ page }) => {
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/auth/user') &&
        request.method() === 'GET'
    );

    await page.goto('/');

    const request = await requestPromise;

    expect(request.headers().authorization).toBe(
      'Bearer mock-access-token'
    );
  });

  test('бургер собирается', async ({ page }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });

    await assembleBurger(page);

    await expect(
      page.getByText('Краторная булка N-200i (верх)')
    ).toBeVisible();

    await expect(
      page.locator(
        '.constructor-element__text',
        { hasText: 'Биокотлета из марсианской Магнолии' }
      )
    ).toBeVisible();
  });

  test('по кнопке "Оформить заказ" отправляется запрос создания заказа', async ({
    page
  }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });

    await assembleBurger(page);

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().endsWith('/orders') &&
        request.method() === 'POST'
    );

    await page
      .getByRole('button', { name: 'Оформить заказ' })
      .click();

    const request = await requestPromise;

    expect(request.method()).toBe('POST');

    const body = request.postDataJSON();

    expect(body.ingredients).toBeDefined();
    expect(body.ingredients.length).toBeGreaterThan(0);
  });

  test('после создания заказа открывается модалка', async ({
    page
  }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });
    
    await createOrder(page);

    await expect(
      page.getByTestId('modal-close')
    ).toBeVisible();
  });

  test('в модалке отображается правильный номер заказа', async ({
    page
  }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });
    
    await createOrder(page);

    await expect(
      page.getByText(String(orderNumber))
    ).toBeVisible();
  });

  test('конструктор очищается', async ({
    page
  }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });
    
    await createOrder(page);

    await expect(
      page.getByText('Выберите булки')
    ).toHaveCount(2);

    await expect(
      page.getByText('Выберите начинку')
    ).toBeVisible();
  });

  test('модалка заказа закрывается по нажатию на крестик', async ({
    page
  }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });
    
    await createOrder(page);

    await page.getByTestId('modal-close').click();

    await expect(
      page.getByText(String(orderNumber))
    ).toHaveCount(0);
  });
});
