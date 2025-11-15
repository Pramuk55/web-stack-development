// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    let userData;
    try {
        userData = JSON.parse(localStorage.getItem('currentUser'));
        if (!userData || !userData.name || !userData.email) {
            console.error('Invalid user data');
            return;
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        return;
    }

    // Get DOM elements
    const avatarCircle = document.getElementById('avatar-circle');
    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const memberSince = document.getElementById('member-since');
    const totalItems = document.getElementById('total-items');
    const viewMode = document.getElementById('view-mode');
    const editMode = document.getElementById('edit-mode');
    const editBtn = document.getElementById('edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const editNameInput = document.getElementById('edit-name');
    const editEmailInput = document.getElementById('edit-email');

    // Update profile display
    function updateProfileDisplay() {
        if (avatarCircle) {
            avatarCircle.textContent = userData.name.charAt(0).toUpperCase();
        }
        if (displayName) {
            displayName.textContent = userData.name;
        }
        if (displayEmail) {
            displayEmail.textContent = userData.email;
        }
        if (memberSince) {
            const joinDate = userData.joinDate ? new Date(userData.joinDate) : new Date();
            memberSince.textContent = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        if (totalItems) {
            const notes = JSON.parse(localStorage.getItem('flowtrack_notes') || '[]');
            const tasks = JSON.parse(localStorage.getItem('flowtrack_tasks') || '[]');
            totalItems.textContent = notes.length + tasks.length;
        }
        if (editNameInput) {
            editNameInput.value = userData.name;
        }
        if (editEmailInput) {
            editEmailInput.value = userData.email;
        }
    }

    // Event listeners
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (viewMode) viewMode.style.display = 'none';
            if (editMode) editMode.style.display = 'block';
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (editMode) editMode.style.display = 'none';
            if (viewMode) viewMode.style.display = 'block';
            updateProfileDisplay();
        });
    }

    if (editMode) {
        editMode.addEventListener('submit', (e) => {
            e.preventDefault();
            
            userData.name = editNameInput.value.trim();
            userData.email = editEmailInput.value.trim();
            userData.lastActive = new Date().toISOString();
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            updateProfileDisplay();
            
            if (editMode) editMode.style.display = 'none';
            if (viewMode) viewMode.style.display = 'block';
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // Initialize display
    updateProfileDisplay();
});