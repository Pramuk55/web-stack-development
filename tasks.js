// tasks.js - Task management for FlowTrack
// Handles creating, editing, completing, and deleting tasks with localStorage persistence

(function() {
    const STORAGE_KEY = 'flowtrack_tasks';
    let currentFilter = 'all';

    // DOM helpers
    function qs(sel) { return document.querySelector(sel); }
    function qsa(sel) { return document.querySelectorAll(sel); }

    // Data management
    function getTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load tasks:', e);
            return [];
        }
    }

    function saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // Task CRUD operations
    function addTask(text) {
        if (!text || !text.trim()) return;
        const tasks = getTasks();
        const newTask = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            text: text.trim(),
            completed: false,
            createdAt: Date.now()
        };
        tasks.push(newTask);
        saveTasks(tasks);
        renderTasks();
    }

    function toggleTask(id) {
        const tasks = getTasks();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks(tasks);
            renderTasks();
        }
    }

    function deleteTask(id) {
        if (!confirm('Delete this task?')) return;
        const tasks = getTasks().filter(t => t.id !== id);
        saveTasks(tasks);
        renderTasks();
    }

    function editTask(id) {
        const tasks = getTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText && newText.trim() && newText !== task.text) {
            task.text = newText.trim();
            saveTasks(tasks);
            renderTasks();
        }
    }

    // UI Rendering
    function makeTaskItem(task) {
        const item = document.createElement('div');
        item.className = 'task-item card';
        item.style.padding = '1rem';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '1rem';
        item.style.transition = 'transform 0.2s ease, opacity 0.2s ease';

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';
        checkbox.style.cursor = 'pointer';
        checkbox.addEventListener('change', () => toggleTask(task.id));

        // Text
        const text = document.createElement('span');
        text.style.flex = '1';
        text.style.color = 'var(--color-text-primary)';
        text.style.textDecoration = task.completed ? 'line-through' : 'none';
        text.style.opacity = task.completed ? '0.7' : '1';
        text.textContent = task.text;

        // Actions
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '0.5rem';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.style.padding = '0.4rem 0.8rem';
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-secondary';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.style.padding = '0.4rem 0.8rem';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(checkbox);
        item.appendChild(text);
        item.appendChild(actions);

        return item;
    }

    function renderTasks() {
        const list = qs('#tasks-list');
        if (!list) return;

        list.innerHTML = '';
        let tasks = getTasks();

        // Apply filter
        if (currentFilter === 'active') {
            tasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            tasks = tasks.filter(t => t.completed);
        }

        // Sort by creation date (newest first)
        tasks.sort((a, b) => b.createdAt - a.createdAt);

        if (!tasks.length) {
            const empty = document.createElement('div');
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--color-text-muted)';
            empty.style.padding = '2rem';
            empty.textContent = currentFilter === 'all' 
                ? 'No tasks yet. Add one above!'
                : `No ${currentFilter} tasks.`;
            list.appendChild(empty);
            return;
        }

        tasks.forEach(task => {
            list.appendChild(makeTaskItem(task));
        });

        // Update filter button states
        qsa('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });
    }

    // Wire up event listeners
    document.addEventListener('DOMContentLoaded', function() {
        // main.js already handles auth check, don't redirect here

        const form = qs('#add-task-form');
        const input = qs('#task-input');
        const logoutBtn = qs('#logout-btn');
        const searchInput = qs('#search-tasks');

        if (form && input) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                addTask(input.value);
                input.value = '';
                input.focus();
            });
        }

        // Filter buttons
        qsa('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const taskItems = document.querySelectorAll('.task-item');

                taskItems.forEach(item => {
                    const taskText = item.textContent.toLowerCase();
                    if (taskText.includes(searchTerm)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });

                // Show message if no results
                const visibleTasks = Array.from(taskItems).filter(item => item.style.display !== 'none');
                let noResultsMsg = document.getElementById('no-search-results-tasks');
                
                if (visibleTasks.length === 0 && searchTerm.length > 0) {
                    if (!noResultsMsg) {
                        noResultsMsg = document.createElement('div');
                        noResultsMsg.id = 'no-search-results-tasks';
                        noResultsMsg.style.textAlign = 'center';
                        noResultsMsg.style.padding = '2rem';
                        noResultsMsg.style.color = 'var(--color-text-muted)';
                        noResultsMsg.textContent = '📭 No tasks found matching your search';
                        document.querySelector('.tasks-list').appendChild(noResultsMsg);
                    }
                } else if (noResultsMsg) {
                    noResultsMsg.remove();
                }
            });
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
        }

        renderTasks();
    });
})();
