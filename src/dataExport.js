// Data Export Utilities
// Export workout data in various formats

export class DataExporter {
    constructor(workoutHistory, activeProgram) {
        this.workoutHistory = workoutHistory;
        this.activeProgram = activeProgram;
    }

    // Export all data as JSON
    exportJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            workoutHistory: this.workoutHistory,
            activeProgram: this.activeProgram,
            totalWorkouts: this.workoutHistory.length
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const filename = `fitrack-data-${this.getDateString()}.json`;
        
        this.downloadFile(blob, filename);
    }

    // Export workout log as CSV
    exportCSV() {
        const rows = [
            ['Date', 'Exercise', 'Set', 'Reps', 'Weight (kg)', 'Time', 'Notes']
        ];

        this.workoutHistory.forEach(workout => {
            const date = workout.date;
            
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach((set, index) => {
                    rows.push([
                        date,
                        exercise.name,
                        index + 1,
                        set.reps || '',
                        set.weight || '',
                        set.time || '',
                        ''
                    ]);
                });
            });
        });

        const csvContent = rows.map(row => 
            row.map(cell => this.escapeCsvCell(cell)).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const filename = `fitrack-workouts-${this.getDateString()}.csv`;
        
        this.downloadFile(blob, filename);
    }

    // Escape CSV cell content
    escapeCsvCell(cell) {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    }

    // Get formatted date string for filename
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Download file to device
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
