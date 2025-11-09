// Sync Modal Component for GitHub Device Flow Authentication
// Displays authentication instructions and handles user interaction

export class SyncModal {
    constructor() {
        this.modal = null;
        this.onSuccess = null;
        this.onCancel = null;
    }

    /**
     * Show the authentication modal
     * @param {string} userCode - Device code for user to enter
     * @param {string} verificationUri - URL where user authorizes
     * @param {Promise} pollPromise - Promise that resolves when authenticated
     */
    async show(userCode, verificationUri, pollPromise) {
        return new Promise((resolve, reject) => {
            this.onSuccess = resolve;
            this.onCancel = reject;

            // Create modal HTML
            this.modal = document.createElement('div');
            this.modal.className = 'sync-modal-overlay';
            this.modal.innerHTML = `
                <div class="sync-modal">
                    <div class="sync-modal-header">
                        <h3>🔐 Connect to GitHub</h3>
                        <button class="sync-modal-close" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="sync-step">
                            <div class="sync-step-number">1</div>
                            <div class="sync-step-content">
                                <p class="sync-step-title">Visit GitHub</p>
                                <a href="${verificationUri}" target="_blank" rel="noopener noreferrer" class="sync-verification-link">
                                    ${verificationUri}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div class="sync-step">
                            <div class="sync-step-number">2</div>
                            <div class="sync-step-content">
                                <p class="sync-step-title">Enter this code</p>
                                <div class="sync-code-container">
                                    <input 
                                        type="text" 
                                        class="sync-code-input" 
                                        value="${userCode}" 
                                        readonly
                                        aria-label="Device code"
                                    >
                                    <button class="sync-copy-btn" aria-label="Copy code">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="sync-step">
                            <div class="sync-step-number">3</div>
                            <div class="sync-step-content">
                                <p class="sync-step-title">Authorize FiTrack</p>
                                <p class="sync-step-description">Grant access to create private gists (your workout data will be stored securely)</p>
                            </div>
                        </div>
                        <div class="sync-waiting">
                            <div class="sync-spinner"></div>
                            <p class="sync-waiting-text">Waiting for authorization...</p>
                        </div>
                        <div class="sync-error hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <p class="sync-error-text"></p>
                        </div>
                    </div>
                    <div class="sync-modal-footer">
                        <button class="sync-cancel-btn">Cancel</button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.modal);

            // Setup event listeners
            this.setupEventListeners(pollPromise);

            // Animate in
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });
        });
    }

    setupEventListeners(pollPromise) {
        // Close button
        const closeBtn = this.modal.querySelector('.sync-modal-close');
        closeBtn.addEventListener('click', () => this.cancel());

        // Cancel button
        const cancelBtn = this.modal.querySelector('.sync-cancel-btn');
        cancelBtn.addEventListener('click', () => this.cancel());

        // Copy button
        const copyBtn = this.modal.querySelector('.sync-copy-btn');
        const codeInput = this.modal.querySelector('.sync-code-input');
        
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeInput.value);
                
                // Show feedback
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copied!
                `;
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (error) {
                console.error('Failed to copy:', error);
                this.showError('Failed to copy code. Please copy manually.');
            }
        });

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.cancel();
            }
        });

        // Handle authentication result
        pollPromise
            .then((accessToken) => {
                this.handleSuccess(accessToken);
            })
            .catch((error) => {
                this.showError(error.message || 'Authentication failed. Please try again.');
            });
    }

    showError(message) {
        const errorEl = this.modal.querySelector('.sync-error');
        const errorText = this.modal.querySelector('.sync-error-text');
        const waitingEl = this.modal.querySelector('.sync-waiting');
        
        waitingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
        errorText.textContent = message;

        // Change cancel button to close button
        const cancelBtn = this.modal.querySelector('.sync-cancel-btn');
        cancelBtn.textContent = 'Close';
    }

    handleSuccess(accessToken) {
        // Store token
        localStorage.setItem('github_token', accessToken);

        // Show success state briefly
        const waitingEl = this.modal.querySelector('.sync-waiting');
        waitingEl.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sync-success-icon">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p class="sync-waiting-text">Connected successfully!</p>
        `;
        waitingEl.classList.add('success');

        // Close modal and resolve after brief delay
        setTimeout(() => {
            this.close();
            if (this.onSuccess) {
                this.onSuccess(accessToken);
            }
        }, 1000);
    }

    cancel() {
        this.close();
        if (this.onCancel) {
            this.onCancel(new Error('Authentication cancelled by user'));
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
            setTimeout(() => {
                if (this.modal && this.modal.parentElement) {
                    this.modal.parentElement.removeChild(this.modal);
                }
                this.modal = null;
            }, 300);
        }
    }
}
