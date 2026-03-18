import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  let sessionId;

  test.describe('GET /api/sessions', () => {
    test('should return an array of sessions', async ({ request }) => {
      const res = await request.get('/api/sessions');
      expect(res.ok()).toBeTruthy();

      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('POST /api/sessions', () => {
    test('should create a new session', async ({ request }) => {
      const res = await request.post('/api/sessions', {
        data: { name: 'API Test Session' },
      });
      expect(res.ok()).toBeTruthy();

      const session = await res.json();
      expect(session.id).toBeDefined();
      expect(session.name).toBe('API Test Session');
      sessionId = session.id;
    });

    test('should create session with default name when none provided', async ({ request }) => {
      const res = await request.post('/api/sessions', {
        data: {},
      });
      expect(res.ok()).toBeTruthy();

      const session = await res.json();
      expect(session.name).toBe('Untitled Session');

      // Clean up
      await request.delete(`/api/sessions/${session.id}`);
    });
  });

  test.describe('GET /api/sessions/:id', () => {
    test('should return a specific session', async ({ request }) => {
      const res = await request.get(`/api/sessions/${sessionId}`);
      expect(res.ok()).toBeTruthy();

      const session = await res.json();
      expect(session.id).toBe(sessionId);
      expect(session.name).toBe('API Test Session');
    });

    test('should return 404 for non-existent session', async ({ request }) => {
      const res = await request.get('/api/sessions/non-existent-id');
      expect(res.status()).toBe(404);
    });
  });

  test.describe('PUT /api/sessions/:id', () => {
    test('should update session name', async ({ request }) => {
      const res = await request.put(`/api/sessions/${sessionId}`, {
        data: { name: 'Updated Session Name' },
      });
      expect(res.ok()).toBeTruthy();

      const session = await res.json();
      expect(session.name).toBe('Updated Session Name');
    });

    test('should update session items', async ({ request }) => {
      const items = [
        { title: 'Item 1', price: '10.00', currency: 'EUR', url: 'https://example.com/1' },
        { title: 'Item 2', price: '20.00', currency: 'EUR', url: 'https://example.com/2' },
      ];

      const res = await request.put(`/api/sessions/${sessionId}`, {
        data: { name: 'Updated Session Name', items },
      });
      expect(res.ok()).toBeTruthy();

      // Verify items were saved
      const getRes = await request.get(`/api/sessions/${sessionId}`);
      const session = await getRes.json();
      expect(session.items).toHaveLength(2);
    });

    test('should return 404 for non-existent session', async ({ request }) => {
      const res = await request.put('/api/sessions/non-existent-id', {
        data: { name: 'test' },
      });
      expect(res.status()).toBe(404);
    });
  });

  test.describe('DELETE /api/sessions/:id', () => {
    test('should delete a session', async ({ request }) => {
      const res = await request.delete(`/api/sessions/${sessionId}`);
      expect(res.ok()).toBeTruthy();

      // Verify deleted
      const getRes = await request.get(`/api/sessions/${sessionId}`);
      expect(getRes.status()).toBe(404);
    });
  });

  test.describe('POST /api/scrape', () => {
    test('should return 400 when URL is missing', async ({ request }) => {
      const res = await request.post('/api/scrape', {
        data: {},
      });
      expect(res.status()).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('URL required');
    });

    test('should return 400 for invalid URL format', async ({ request }) => {
      const res = await request.post('/api/scrape', {
        data: { url: 'not-a-url' },
      });
      expect(res.status()).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Invalid URL format');
    });
  });
});
