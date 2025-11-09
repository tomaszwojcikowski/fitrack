// Exercise Card Component - Renders exercise cards with sets

import { renderSetRow } from './setRow.js';

/**
 * Generate HTML for an exercise card
 * @param {Object} exercise - The exercise data
 * @param {number} exIndex - Exercise index in workout
 * @returns {string} HTML string for the exercise card
 */
export function renderExerciseCard(exercise, exIndex) {
    const escapedName = exercise.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    
    return `
        <div class="exercise-card" draggable="true" data-exercise-index="${exIndex}">
            <div class="exercise-header">
                <button class="drag-handle" aria-label="Drag to reorder exercise">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div class="exercise-title">
                    <h3 class="exercise-name-clickable" onclick="app.showExerciseHistory('${escapedName}')" title="View history for ${exercise.name}">${exercise.name}</h3>
                    <small>${exercise.category} • ${exercise.equipment}</small>
                </div>
                <div class="exercise-actions">
                    <button class="btn-icon" onclick="app.swapExercise(${exIndex})" title="Swap exercise" aria-label="Swap ${exercise.name} with another exercise">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="17 1 21 5 17 9"></polyline>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                            <polyline points="7 23 3 19 7 15"></polyline>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="app.removeExercise(${exIndex})" title="Remove exercise" aria-label="Remove ${exercise.name} from workout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="sets-list">
                ${exercise.sets.map((set, setIndex) => renderSetRow(set, exIndex, setIndex)).join('')}
            </div>
            <button class="add-set-btn" onclick="app.addSet(${exIndex})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Set
            </button>
        </div>
    `;
}
