// Exercise Picker Modal Component - Searchable exercise selection with favorites and recent exercises

/**
 * Render the exercise picker modal
 * @returns {string} HTML string for the modal
 */
export function renderExercisePickerModal() {
    return `
        <div id="exercisePickerModal" class="exercise-picker-modal hidden" role="dialog" aria-modal="true" aria-labelledby="exercisePickerTitle">
            <div class="modal-overlay" onclick="app.closeExercisePickerModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="exercisePickerTitle">Select Exercise</h2>
                    <button class="modal-close-btn" onclick="app.closeExercisePickerModal()" aria-label="Close exercise picker">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="modal-search">
                    <div class="search-box">
                        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" id="modalExerciseSearch" placeholder="Search by name, equipment, or muscle group..." autocomplete="off" aria-label="Search exercises">
                        <button id="modalClearSearch" class="clear-btn hidden" aria-label="Clear search" title="Clear search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="modal-body">
                    <div id="favoriteExercises" class="exercise-section hidden">
                        <h3 class="section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            Favorites
                        </h3>
                        <div id="favoriteExercisesList" class="exercise-grid"></div>
                    </div>
                    
                    <div id="recentExercises" class="exercise-section hidden">
                        <h3 class="section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Recently Used
                        </h3>
                        <div id="recentExercisesList" class="exercise-grid"></div>
                    </div>
                    
                    <div id="allExercises" class="exercise-section">
                        <h3 class="section-title">All Exercises</h3>
                        <div id="allExercisesList" class="exercise-grid"></div>
                    </div>
                    
                    <div id="noResults" class="no-results hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <p>No exercises found</p>
                        <small>Try a different search term</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render an exercise item for the modal
 * @param {Object} exercise - The exercise data
 * @param {boolean} isFavorite - Whether the exercise is favorited
 * @param {string} highlightTerm - Search term to highlight
 * @returns {string} HTML string for the exercise item
 */
export function renderModalExerciseItem(exercise, isFavorite = false, highlightTerm = '') {
    const escapedName = exercise.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    
    // Highlight matching text
    let displayName = exercise.name;
    if (highlightTerm) {
        const regex = new RegExp(`(${highlightTerm})`, 'gi');
        displayName = exercise.name.replace(regex, '<mark>$1</mark>');
    }
    
    // Equipment badge colors
    const equipmentColors = {
        'Barbell': 'equipment-barbell',
        'Dumbbell': 'equipment-dumbbell',
        'Cable': 'equipment-cable',
        'Machine': 'equipment-machine',
        'Bodyweight': 'equipment-bodyweight',
        'Kettlebell': 'equipment-kettlebell',
        'Band': 'equipment-band'
    };
    
    const equipmentClass = equipmentColors[exercise.equipment] || 'equipment-other';
    
    return `
        <div class="exercise-modal-item" onclick="app.selectExerciseFromModal('${escapedName}')" role="button" tabindex="0" onkeypress="if(event.key==='Enter')app.selectExerciseFromModal('${escapedName}')">
            <div class="exercise-modal-info">
                <div class="exercise-modal-name">${displayName}</div>
                <div class="exercise-modal-meta">
                    <span class="badge badge-category">${exercise.category}</span>
                    <span class="badge badge-equipment ${equipmentClass}">${exercise.equipment}</span>
                </div>
            </div>
            <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" 
                onclick="event.stopPropagation(); app.toggleFavoriteExercise('${escapedName}')" 
                aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </button>
        </div>
    `;
}
