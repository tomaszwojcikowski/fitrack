import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimpleSyncService } from '../services/simpleSyncService.js';

// Mock localStorage
const localStorageMock = {
    store: {},
    getItem(key) {
        return this.store[key] || null;
    },
    setItem(key, value) {
        this.store[key] = value;
    },
    removeItem(key) {
        delete this.store[key];
    },
    clear() {
        this.store = {};
    }
};

global.localStorage = localStorageMock;

describe('SimpleSyncService', () => {
    let syncService;

    beforeEach(() => {
        localStorageMock.clear();
        syncService = new SimpleSyncService();
        vi.clearAllMocks();
    });

    describe('Token Management', () => {
        it('should store and retrieve token', () => {
            const token = 'ghp_test123456';
            const result = syncService.setToken(token);
            
            expect(result).toBe(true);
            expect(syncService.getToken()).toBe(token);
        });

        it('should not store empty token', () => {
            const result = syncService.setToken('');
            
            expect(result).toBe(false);
            expect(syncService.getToken()).toBe(null);
        });

        it('should trim token before storing', () => {
            syncService.setToken('  ghp_test123  ');
            
            expect(syncService.getToken()).toBe('ghp_test123');
        });

        it('should clear token on disconnect', () => {
            syncService.setToken('ghp_test123');
            syncService.setGistId('gist123');
            
            syncService.disconnect();
            
            expect(syncService.getToken()).toBe(null);
            expect(syncService.getGistId()).toBe(null);
        });

        it('should check if connected', () => {
            expect(syncService.isConnected()).toBe(false);
            
            syncService.setToken('ghp_test123');
            
            expect(syncService.isConnected()).toBe(true);
        });
    });

    describe('Gist ID Management', () => {
        it('should store and retrieve Gist ID', () => {
            const gistId = 'abc123def456';
            syncService.setGistId(gistId);
            
            expect(syncService.getGistId()).toBe(gistId);
        });

        it('should clear Gist ID on disconnect', () => {
            syncService.setGistId('gist123');
            syncService.disconnect();
            
            expect(syncService.getGistId()).toBe(null);
        });
    });

    describe('API Headers', () => {
        it('should generate correct headers with token', () => {
            const token = 'ghp_test123';
            const headers = syncService.getHeaders(token);
            
            expect(headers['Authorization']).toBe(`token ${token}`);
            expect(headers['Accept']).toBe('application/vnd.github+json');
            expect(headers['Content-Type']).toBe('application/json');
        });

        it('should use stored token if none provided', () => {
            syncService.setToken('ghp_stored');
            const headers = syncService.getHeaders();
            
            expect(headers['Authorization']).toBe('token ghp_stored');
        });
    });

    describe('Token Verification', () => {
        it('should verify valid token', async () => {
            global.fetch = vi.fn(() => 
                Promise.resolve({ ok: true })
            );
            
            const isValid = await syncService.verifyToken('ghp_valid');
            
            expect(isValid).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                'https://api.github.com/user',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'token ghp_valid'
                    })
                })
            );
        });

        it('should reject invalid token', async () => {
            global.fetch = vi.fn(() => 
                Promise.resolve({ ok: false })
            );
            
            const isValid = await syncService.verifyToken('ghp_invalid');
            
            expect(isValid).toBe(false);
        });

        it('should handle network errors', async () => {
            global.fetch = vi.fn(() => 
                Promise.reject(new Error('Network error'))
            );
            
            const isValid = await syncService.verifyToken('ghp_test');
            
            expect(isValid).toBe(false);
        });
    });

    describe('Auto-sync', () => {
        it('should start auto-sync interval', () => {
            vi.useFakeTimers();
            
            const getDataCallback = vi.fn(() => ({ data: 'test' }));
            const applyDataCallback = vi.fn();
            const onSyncCallback = vi.fn();
            
            syncService.startAutoSync(getDataCallback, applyDataCallback, onSyncCallback);
            
            expect(syncService.syncInterval).not.toBe(null);
            
            vi.useRealTimers();
            syncService.stopAutoSync();
        });

        it('should stop auto-sync', () => {
            vi.useFakeTimers();
            
            syncService.startAutoSync(
                () => ({}),
                () => {},
                () => {}
            );
            
            syncService.stopAutoSync();
            
            expect(syncService.syncInterval).toBe(null);
            
            vi.useRealTimers();
        });

        it('should clear existing interval when starting new one', () => {
            vi.useFakeTimers();
            
            syncService.startAutoSync(() => ({}), () => {}, () => {});
            const firstInterval = syncService.syncInterval;
            
            syncService.startAutoSync(() => ({}), () => {}, () => {});
            const secondInterval = syncService.syncInterval;
            
            expect(firstInterval).not.toBe(secondInterval);
            
            vi.useRealTimers();
            syncService.stopAutoSync();
        });
    });

    describe('Find Gist', () => {
        it('should find existing FiTrack gist', async () => {
            const mockGist = {
                id: 'gist123',
                description: 'FiTrack - Fitness Progress Data (Private)',
                files: {
                    'fitrack-data.json': {
                        content: '{"version":"1.0"}'
                    }
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([mockGist])
                })
            );

            const gist = await syncService.findGist('ghp_test');

            expect(gist).toEqual(mockGist);
            expect(fetch).toHaveBeenCalledWith(
                'https://api.github.com/gists',
                expect.any(Object)
            );
        });

        it('should return null if no FiTrack gist found', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([])
                })
            );

            const gist = await syncService.findGist('ghp_test');

            expect(gist).toBe(undefined);
        });

        it('should handle API errors', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 500
                })
            );

            await expect(syncService.findGist('ghp_test')).rejects.toThrow();
        });
    });

    describe('Create Gist', () => {
        it('should create new gist with data', async () => {
            const testData = {
                version: '1.0',
                workouts: [],
                lastSync: new Date().toISOString()
            };

            const mockGist = { id: 'new_gist_123' };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockGist)
                })
            );

            const result = await syncService.createGist(testData, 'ghp_test');

            expect(result).toEqual(mockGist);
            expect(syncService.getGistId()).toBe('new_gist_123');
            expect(fetch).toHaveBeenCalledWith(
                'https://api.github.com/gists',
                expect.objectContaining({
                    method: 'POST'
                })
            );
            
            // Verify the body contains the test data
            const callArgs = fetch.mock.calls[0];
            const body = JSON.parse(callArgs[1].body);
            const content = JSON.parse(body.files['fitrack-data.json'].content);
            expect(content.version).toBe('1.0');
        });

        it('should handle creation errors', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 403
                })
            );

            await expect(
                syncService.createGist({}, 'ghp_test')
            ).rejects.toThrow();
        });
    });

    describe('Pull Data', () => {
        it('should pull data from gist', async () => {
            const testData = {
                version: '1.0',
                workouts: [{ date: '2024-01-01' }]
            };

            syncService.setGistId('gist123');

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        files: {
                            'fitrack-data.json': {
                                content: JSON.stringify(testData)
                            }
                        }
                    })
                })
            );

            const result = await syncService.pullData('ghp_test');

            expect(result).toEqual(testData);
        });

        it('should throw error if no gist ID', async () => {
            await expect(
                syncService.pullData('ghp_test')
            ).rejects.toThrow('No Gist ID found');
        });

        it('should clear gist ID if not found', async () => {
            syncService.setGistId('invalid_gist');

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 404
                })
            );

            await expect(
                syncService.pullData('ghp_test')
            ).rejects.toThrow('Gist not found');

            expect(syncService.getGistId()).toBe(null);
        });
    });

    describe('Push Data', () => {
        it('should push data to gist', async () => {
            const testData = {
                version: '1.0',
                workouts: []
            };

            syncService.setGistId('gist123');

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: 'gist123' })
                })
            );

            const result = await syncService.pushData(testData, 'ghp_test');

            expect(result.id).toBe('gist123');
            expect(testData.lastSync).toBeDefined();
            expect(fetch).toHaveBeenCalledWith(
                'https://api.github.com/gists/gist123',
                expect.objectContaining({
                    method: 'PATCH'
                })
            );
        });

        it('should throw error if no gist ID', async () => {
            await expect(
                syncService.pushData({}, 'ghp_test')
            ).rejects.toThrow('No Gist ID found');
        });
    });
});
