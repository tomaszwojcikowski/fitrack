// Set Row Component - Renders individual set rows for exercises

/**
 * Generate HTML for a single set row
 * @param {Object} set - The set data
 * @param {number} exIndex - Exercise index in workout
 * @param {number} setIndex - Set index in exercise
 * @param {boolean} isNextIncomplete - Whether this is the next incomplete set
 * @returns {string} HTML string for the set row
 */
export function renderSetRow(set, exIndex, setIndex, isNextIncomplete = false) {
    return `
        <div class="set-row-wrapper ${isNextIncomplete ? 'next-set' : ''}" data-exercise-index="${exIndex}" data-set-index="${setIndex}">
            <div class="set-row">
                <div class="set-number">${setIndex + 1}</div>
                <div class="set-input">
                    <label>
                        Weight (kg)
                        ${set.weight && !set.completed ? `<button class="apply-to-all-btn" onclick="app.applyWeightToAll(${exIndex}, ${setIndex})" title="Apply to all remaining sets" aria-label="Apply weight to all remaining sets">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="7 17 2 12 7 7"></polyline>
                                <polyline points="12 17 7 12 12 7"></polyline>
                                <line x1="12" y1="12" x2="22" y2="12"></line>
                            </svg>
                        </button>` : ''}
                    </label>
                    <input type="number" 
                        value="${set.weight}" 
                        placeholder="0"
                        step="0.5"
                        min="0"
                        max="999"
                        inputmode="decimal"
                        aria-label="Weight in kilograms"
                        onchange="app.updateSet(${exIndex}, ${setIndex}, 'weight', this.value)">
                </div>
                <div class="set-input">
                    <label>
                        ${set.useTime ? 'Time' : 'Reps'}
                        ${!set.useTime && set.reps && !set.completed ? `<button class="apply-to-all-btn" onclick="app.applyRepsToAll(${exIndex}, ${setIndex})" title="Apply to all remaining sets" aria-label="Apply reps to all remaining sets">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="7 17 2 12 7 7"></polyline>
                                <polyline points="12 17 7 12 12 7"></polyline>
                                <line x1="12" y1="12" x2="22" y2="12"></line>
                            </svg>
                        </button>` : ''}
                        <button class="toggle-type-btn" onclick="app.toggleSetInputType(${exIndex}, ${setIndex})" title="Toggle between reps and time" aria-label="Switch to ${set.useTime ? 'reps' : 'time'} tracking">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polyline points="17 1 21 5 17 9"></polyline>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                <polyline points="7 23 3 19 7 15"></polyline>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                            </svg>
                        </button>
                    </label>
                    ${set.useTime ? 
                        `<input type="text" 
                            value="${set.time}" 
                            placeholder="0:30 or 30s"
                            pattern="([0-9]{1,2}:[0-5][0-9]|[0-9]{1,3}s?)"
                            aria-label="Time in minutes:seconds or seconds"
                            onchange="app.updateSet(${exIndex}, ${setIndex}, 'time', this.value)">` :
                        `<input type="number" 
                            value="${set.reps}" 
                            placeholder="0"
                            min="0"
                            max="999"
                            inputmode="numeric"
                            aria-label="Number of repetitions"
                            onchange="app.updateSet(${exIndex}, ${setIndex}, 'reps', this.value)">`
                    }
                </div>
                <div class="set-actions">
                    <button class="set-complete ${set.completed ? 'completed' : ''}" 
                        onclick="app.toggleSetComplete(${exIndex}, ${setIndex})"
                        title="${set.completed ? 'Mark incomplete' : 'Mark complete'}"
                        aria-label="${set.completed ? 'Mark set incomplete' : 'Mark set complete'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                    <button class="set-delete-btn" 
                        onclick="app.deleteSet(${exIndex}, ${setIndex})"
                        title="Delete set"
                        aria-label="Delete set ${setIndex + 1}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 4 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}
