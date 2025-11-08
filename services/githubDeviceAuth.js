// GitHub Device Flow OAuth Authentication Service
// Uses GitHub's public CLI client ID for authentication without backend

export class GitHubDeviceAuth {
    constructor() {
        this.clientId = 'Iv1.b507a08c87ecfe98';
        this.deviceCodeUrl = 'https://github.com/login/device/code';
        this.accessTokenUrl = 'https://github.com/login/oauth/access_token';
        this.scope = 'gist';
    }

    /**
     * Initiate device flow authentication
     * @returns {Promise<{deviceCode: string, userCode: string, verificationUri: string, expiresIn: number, interval: number}>}
     */
    async requestDeviceCode() {
        try {
            const response = await fetch(this.deviceCodeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    client_id: this.clientId,
                    scope: this.scope
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to request device code: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                deviceCode: data.device_code,
                userCode: data.user_code,
                verificationUri: data.verification_uri,
                expiresIn: data.expires_in,
                interval: data.interval
            };
        } catch (error) {
            console.error('Error requesting device code:', error);
            throw new Error('Failed to start authentication. Please check your network connection.');
        }
    }

    /**
     * Poll for access token
     * @param {string} deviceCode - Device code from requestDeviceCode
     * @param {number} interval - Polling interval in seconds
     * @param {number} expiresIn - Expiration time in seconds
     * @returns {Promise<string>} Access token
     */
    async pollForAccessToken(deviceCode, interval = 5, expiresIn = 900) {
        const startTime = Date.now();
        const expirationTime = startTime + (expiresIn * 1000);

        return new Promise((resolve, reject) => {
            const poll = async () => {
                // Check if expired
                if (Date.now() >= expirationTime) {
                    reject(new Error('Authentication timeout. Please try again.'));
                    return;
                }

                try {
                    const response = await fetch(this.accessTokenUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            client_id: this.clientId,
                            device_code: deviceCode,
                            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to get access token: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data.access_token) {
                        // Success!
                        resolve(data.access_token);
                    } else if (data.error === 'authorization_pending') {
                        // Still waiting for user to authorize
                        setTimeout(poll, interval * 1000);
                    } else if (data.error === 'slow_down') {
                        // Increase polling interval
                        setTimeout(poll, (interval + 5) * 1000);
                    } else if (data.error === 'expired_token') {
                        reject(new Error('Authentication code expired. Please try again.'));
                    } else if (data.error === 'access_denied') {
                        reject(new Error('Authentication was denied.'));
                    } else {
                        reject(new Error(`Authentication failed: ${data.error || 'Unknown error'}`));
                    }
                } catch (error) {
                    console.error('Error polling for token:', error);
                    reject(new Error('Network error during authentication. Please try again.'));
                }
            };

            // Start polling
            poll();
        });
    }

    /**
     * Start the device flow authentication process
     * @returns {Promise<{userCode: string, verificationUri: string, pollPromise: Promise<string>}>}
     */
    async authenticate() {
        const deviceInfo = await this.requestDeviceCode();
        
        const pollPromise = this.pollForAccessToken(
            deviceInfo.deviceCode,
            deviceInfo.interval,
            deviceInfo.expiresIn
        );

        return {
            userCode: deviceInfo.userCode,
            verificationUri: deviceInfo.verificationUri,
            pollPromise
        };
    }

    /**
     * Verify a token is valid by checking GitHub API
     * @param {string} token - Access token to verify
     * @returns {Promise<boolean>}
     */
    async verifyToken(token) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    }
}
