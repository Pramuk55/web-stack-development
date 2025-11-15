// stats.js - Statistics and metrics for FlowTrack
// Pulls data from localStorage (tasks and notes) to show progress

(function() {
    const TASKS_KEY = 'flowtrack_tasks';
    const NOTES_KEY = 'flowtrack_notes';

    // DOM helpers
    function qs(sel) { return document.querySelector(sel); }
    function setNumber(id, num) {
        const el = qs(id);
        if (el) {
            el.textContent = num;
            // Subtle animation
            el.style.transform = 'scale(1.1)';
            setTimeout(() => el.style.transform = 'scale(1)', 200);
        }
    }

    // Data loading
    function getTasks() {
        try {
            const raw = localStorage.getItem(TASKS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load tasks:', e);
            return [];
        }
    }

    function getNotes() {
        try {
            const raw = localStorage.getItem(NOTES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load notes:', e);
            return [];
        }
    }

    // Stats calculations
    function calculateTaskStats() {
        const tasks = getTasks();
        const completed = tasks.filter(t => t.completed).length;
        const active = tasks.filter(t => !t.completed).length;
        return { completed, active };
    }

    function calculateNoteStats() {
        const notes = getNotes();
        return {
            total: notes.length
        };
    }

    // Activity chart
    function renderActivityChart() {
        const chart = qs('#activity-chart');
        if (!chart) return;

        // Get this week's activity (mock data for demo)
        const mockActivity = [4, 6, 2, 8, 5, 3, 7];
        const max = Math.max(...mockActivity);

        chart.innerHTML = '';
        mockActivity.forEach(value => {
            const bar = document.createElement('div');
            const height = (value / max) * 100;
            
            bar.style.cssText = `
                flex: 1;
                height: ${height}%;
                background: var(--color-accent);
                opacity: ${0.3 + (height/100) * 0.7};
                border-radius: 4px;
                transition: transform 0.2s ease;
            `;
            
            bar.addEventListener('mouseenter', () => {
                bar.style.transform = 'scaleY(1.1)';
            });
            
            bar.addEventListener('mouseleave', () => {
                bar.style.transform = 'scaleY(1)';
            });

            chart.appendChild(bar);
        });
    }

    // Update all stats
    function updateStats() {
        const taskStats = calculateTaskStats();
        const noteStats = calculateNoteStats();

        setNumber('#completed-tasks', taskStats.completed);
        setNumber('#active-tasks', taskStats.active);
        setNumber('#total-notes', noteStats.total);
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        // main.js already handles auth check, don't redirect here
        
        // Wire up logout
        const logoutBtn = qs('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
        }

        // Initial render
        updateStats();
        renderActivityChart();

        // Update stats every 30s in case of changes in other tabs
        setInterval(updateStats, 30000);
    });
})();