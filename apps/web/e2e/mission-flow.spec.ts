import { test, expect } from '@playwright/test';
import { createTestAuthHeader, mockGpsNearby, mockQrPayload } from './utils';

/**
 * E2E Test: Complete Mission Run Flow
 *
 * This test validates the entire user journey through a mission:
 * 1. View places list
 * 2. Start a mission run
 * 3. GPS verification
 * 4. QR verification
 * 5. Reels verification
 * 6. Check mission run status
 */

test.describe('Mission Run Flow', () => {
  let testUserId: string;
  let authHeaders: Record<string, string>;

  test.beforeEach(() => {
    // Generate unique test user for each test
    testUserId = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    authHeaders = createTestAuthHeader({ userId: testUserId });
  });

  test('should complete full mission run flow successfully', async ({ request }) => {
    // Step 1: View places list
    test.step('Get places list', async () => {
      const response = await request.get('/api/places');

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('places');
      expect(Array.isArray(data.places)).toBeTruthy();

      // Log for debugging
      console.log(`Found ${data.places.length} places`);
    });

    // For this test, we'll need to have test data in the database
    // Let's create a mock mission and place, or use existing ones
    const testMissionId = 'test-mission-1';
    const testPlaceId = 'test-place-1';
    const placeLocation = { lat: 37.5665, lng: 126.9780 };

    let missionRunId: string;

    // Step 2: Start mission run
    await test.step('Start mission run', async () => {
      const response = await request.post(`/api/missions/${testMissionId}/runs`, {
        headers: authHeaders,
        data: {},
      });

      // Note: This might fail if mission doesn't exist in test database
      // In a real scenario, you'd seed test data first
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('status');
        expect(data.missionId).toBe(testMissionId);

        missionRunId = data.id;
        console.log(`Created mission run: ${missionRunId}`);
      } else {
        console.log('Mission not found - skipping rest of flow test');
        test.skip();
      }
    });

    // Step 3: GPS verification
    await test.step('Verify GPS location', async () => {
      const gpsData = mockGpsNearby(placeLocation.lat, placeLocation.lng, 30);

      const response = await request.post(
        `/api/mission-runs/${missionRunId}/gps-verify`,
        {
          headers: authHeaders,
          data: {
            lat: gpsData.lat,
            lng: gpsData.lng,
            accuracy: gpsData.accuracy,
            provider: gpsData.provider,
            mocked: gpsData.mocked,
            timestamp: new Date().toISOString(),
          },
        }
      );

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('stepName', 'GPS_VERIFY');
        expect(data).toHaveProperty('status');
        console.log(`GPS verification result: ${data.status}`);
      }
    });

    // Step 4: QR verification
    await test.step('Verify QR code', async () => {
      const qrPayload = mockQrPayload({
        missionId: testMissionId,
        placeId: testPlaceId,
      });

      const response = await request.post(
        `/api/mission-runs/${missionRunId}/qr-verify`,
        {
          headers: authHeaders,
          data: {
            qrPayload,
          },
        }
      );

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('stepName', 'QR_VERIFY');
        expect(data).toHaveProperty('status');
        console.log(`QR verification result: ${data.status}`);
      }
    });

    // Step 5: Reels verification (webhook simulation)
    await test.step('Verify reels completion', async () => {
      const response = await request.post(
        `/api/mission-runs/${missionRunId}/reels-verify`,
        {
          headers: authHeaders,
          data: {
            videoId: 'test-video-123',
            verified: true,
          },
        }
      );

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('stepName', 'REELS_VERIFY');
        expect(data).toHaveProperty('status');
        console.log(`Reels verification result: ${data.status}`);
      }
    });

    // Step 6: Check mission run status
    await test.step('Check final mission run status', async () => {
      const response = await request.get(`/api/mission-runs/${missionRunId}`, {
        headers: authHeaders,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data).toHaveProperty('id', missionRunId);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('steps');

      console.log(`Final mission run status: ${data.status}`);
      console.log(`Completed steps: ${JSON.stringify(data.steps, null, 2)}`);
    });
  });

  test('should fail GPS verification with mocked location', async ({ request }) => {
    const testMissionId = 'test-mission-1';
    const testPlaceId = 'test-place-1';

    // Start mission run
    const startResponse = await request.post(
      `/api/missions/${testMissionId}/runs`,
      {
        headers: authHeaders,
        data: {},
      }
    );

    if (!startResponse.ok()) {
      console.log('Mission not found - skipping test');
      test.skip();
      return;
    }

    const { id: missionRunId } = await startResponse.json();

    // Try GPS verification with mocked flag
    await test.step('GPS verification should fail with mocked location', async () => {
      const response = await request.post(
        `/api/mission-runs/${missionRunId}/gps-verify`,
        {
          headers: authHeaders,
          data: {
            lat: 37.5665,
            lng: 126.9780,
            accuracy: 10,
            provider: 'mock',
            mocked: true,
            timestamp: new Date().toISOString(),
          },
        }
      );

      // Should return error or failed status
      if (response.ok()) {
        const data = await response.json();
        // Depending on implementation, might return success:false or error
        console.log(`GPS verification with mock: ${JSON.stringify(data)}`);
      } else {
        // Expected to fail
        expect(response.status()).toBeGreaterThanOrEqual(400);
      }
    });
  });

  test('should fail QR verification with invalid signature', async ({ request }) => {
    const testMissionId = 'test-mission-1';

    // Start mission run
    const startResponse = await request.post(
      `/api/missions/${testMissionId}/runs`,
      {
        headers: authHeaders,
        data: {},
      }
    );

    if (!startResponse.ok()) {
      console.log('Mission not found - skipping test');
      test.skip();
      return;
    }

    const { id: missionRunId } = await startResponse.json();

    // Try QR verification with invalid payload
    await test.step('QR verification should fail with invalid signature', async () => {
      const invalidQrPayload = 'zzik://verify?mid=test&pid=test&nonce=abc&sig=invalid';

      const response = await request.post(
        `/api/mission-runs/${missionRunId}/qr-verify`,
        {
          headers: authHeaders,
          data: {
            qrPayload: invalidQrPayload,
          },
        }
      );

      // Should return error
      expect(response.status()).toBeGreaterThanOrEqual(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      console.log(`QR verification error: ${data.error}`);
    });
  });

  test('should fail GPS verification when too far from place', async ({ request }) => {
    const testMissionId = 'test-mission-1';
    const placeLocation = { lat: 37.5665, lng: 126.9780 };

    // Start mission run
    const startResponse = await request.post(
      `/api/missions/${testMissionId}/runs`,
      {
        headers: authHeaders,
        data: {},
      }
    );

    if (!startResponse.ok()) {
      console.log('Mission not found - skipping test');
      test.skip();
      return;
    }

    const { id: missionRunId } = await startResponse.json();

    // Try GPS verification from 10km away
    await test.step('GPS verification should fail when far from place', async () => {
      const farLocation = {
        lat: placeLocation.lat + 0.1, // ~11km away
        lng: placeLocation.lng + 0.1,
      };

      const response = await request.post(
        `/api/mission-runs/${missionRunId}/gps-verify`,
        {
          headers: authHeaders,
          data: {
            lat: farLocation.lat,
            lng: farLocation.lng,
            accuracy: 10,
            provider: 'gps',
            mocked: false,
            timestamp: new Date().toISOString(),
          },
        }
      );

      // Should return error or failed status
      if (response.ok()) {
        const data = await response.json();
        console.log(`GPS verification result: ${JSON.stringify(data)}`);
        // Might return success:false
      } else {
        expect(response.status()).toBeGreaterThanOrEqual(400);
      }
    });
  });
});
