import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GitHubDeviceAuth } from '../services/githubDeviceAuth.js'
import { GistSyncService } from '../services/gistSyncService.js'

describe('GitHubDeviceAuth', () => {
  let auth

  beforeEach(() => {
    auth = new GitHubDeviceAuth()
    // Clear any stored data
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with correct client ID', () => {
      expect(auth.clientId).toBe('Iv1.b507a08c87ecfe98')
    })

    it('should have correct API endpoints', () => {
      expect(auth.deviceCodeUrl).toBe('https://github.com/login/device/code')
      expect(auth.accessTokenUrl).toBe('https://github.com/login/oauth/access_token')
    })

    it('should request gist scope', () => {
      expect(auth.scope).toBe('gist')
    })
  })

  describe('Device Code Request', () => {
    it('should handle successful device code request', async () => {
      // Mock fetch for device code request
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            device_code: 'test_device_code',
            user_code: 'ABCD-1234',
            verification_uri: 'https://github.com/login/device',
            expires_in: 900,
            interval: 5
          })
        })
      )

      const result = await auth.requestDeviceCode()
      
      expect(result.deviceCode).toBe('test_device_code')
      expect(result.userCode).toBe('ABCD-1234')
      expect(result.verificationUri).toBe('https://github.com/login/device')
      expect(result.expiresIn).toBe(900)
      expect(result.interval).toBe(5)
    })

    it('should handle network errors', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

      await expect(auth.requestDeviceCode()).rejects.toThrow('Failed to start authentication')
    })

    it('should handle API errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500
        })
      )

      await expect(auth.requestDeviceCode()).rejects.toThrow('Failed to start authentication')
    })
  })

  describe('Token Verification', () => {
    it('should verify valid token', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true
        })
      )

      const isValid = await auth.verifyToken('valid_token')
      expect(isValid).toBe(true)
    })

    it('should reject invalid token', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false
        })
      )

      const isValid = await auth.verifyToken('invalid_token')
      expect(isValid).toBe(false)
    })

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

      const isValid = await auth.verifyToken('token')
      expect(isValid).toBe(false)
    })
  })
})

describe('GistSyncService', () => {
  let syncService
  const mockToken = 'test_access_token'

  beforeEach(() => {
    localStorage.clear()
    syncService = new GistSyncService(mockToken)
  })

  describe('Initialization', () => {
    it('should initialize with access token', () => {
      expect(syncService.accessToken).toBe(mockToken)
    })

    it('should use correct file name', () => {
      expect(syncService.gistFileName).toBe('fitrack-data.json')
    })

    it('should use correct description', () => {
      expect(syncService.gistDescription).toBe('FiTrack - Fitness Progress Data (Private)')
    })

    it('should load gist ID from localStorage if available', () => {
      localStorage.setItem('fitrack_gist_id', 'test_gist_id')
      const service = new GistSyncService(mockToken)
      expect(service.gistId).toBe('test_gist_id')
    })
  })

  describe('Headers', () => {
    it('should return correct API headers', () => {
      const headers = syncService.getHeaders()
      
      expect(headers['Authorization']).toBe(`Bearer ${mockToken}`)
      expect(headers['Accept']).toBe('application/vnd.github+json')
      expect(headers['X-GitHub-Api-Version']).toBe('2022-11-28')
    })
  })

  describe('Initial Data', () => {
    it('should create correct initial data structure', () => {
      const data = syncService.createInitialData()
      
      expect(data.version).toBe('1.0')
      expect(Array.isArray(data.workouts)).toBe(true)
      expect(Array.isArray(data.exercises)).toBe(true)
      expect(Array.isArray(data.progress)).toBe(true)
      expect(typeof data.settings).toBe('object')
      expect(data.createdAt).toBeDefined()
      expect(data.lastSync).toBeDefined()
    })
  })

  describe('Data Validation', () => {
    it('should validate correct data structure', () => {
      const validData = {
        version: '1.0',
        workouts: [],
        exercises: [],
        progress: [],
        settings: {}
      }
      
      expect(syncService.validateData(validData)).toBe(true)
    })

    it('should reject invalid data', () => {
      expect(syncService.validateData(null)).toBe(false)
      expect(syncService.validateData({})).toBe(false)
      expect(syncService.validateData({ version: '1.0' })).toBe(false)
    })
  })

  describe('Gist ID Management', () => {
    it('should clear gist ID from localStorage', () => {
      localStorage.setItem('fitrack_gist_id', 'test_id')
      syncService.gistId = 'test_id'
      
      syncService.clearGistId()
      
      expect(syncService.gistId).toBe(null)
      expect(localStorage.getItem('fitrack_gist_id')).toBe(null)
    })
  })

  describe('Push Data', () => {
    it('should update lastSync timestamp when pushing', async () => {
      syncService.gistId = 'test_gist_id'
      
      const mockData = {
        version: '1.0',
        workouts: [],
        exercises: [],
        progress: [],
        settings: {},
        lastSync: '2024-01-01T00:00:00.000Z'
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'test_gist_id' })
        })
      )

      await syncService.pushData(mockData)
      
      // lastSync should be updated
      expect(mockData.lastSync).not.toBe('2024-01-01T00:00:00.000Z')
    })

    it('should throw error if no gist ID', async () => {
      syncService.gistId = null
      
      await expect(syncService.pushData({})).rejects.toThrow('No Gist ID available')
    })
  })

  describe('Find Existing Gist', () => {
    it('should find FiTrack gist by description', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'gist1',
              description: 'Other gist',
              files: { 'other.json': {} }
            },
            {
              id: 'gist2',
              description: 'FiTrack - Fitness Progress Data (Private)',
              files: { 'fitrack-data.json': {} }
            }
          ])
        })
      )

      const gist = await syncService.findExistingGist()
      expect(gist).toBeDefined()
      expect(gist.id).toBe('gist2')
    })

    it('should return null if no FiTrack gist found', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'gist1',
              description: 'Other gist',
              files: { 'other.json': {} }
            }
          ])
        })
      )

      const gist = await syncService.findExistingGist()
      expect(gist).toBe(null)
    })
  })
})
