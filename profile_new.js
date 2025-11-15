// profile.js - Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements immediately
    const elements = {
        avatarCircle: document.getElementById('avatar-circle'),
        displayName: document.getElementById('display-name'),
        displayEmail: document.getElementById('display-email'),
        memberSince: document.getElementById('member-since'),
        totalItems: document.getElementById('total-items'),
        viewMode: document.getElementById('view-mode'),
        editMode: document.getElementById('edit-mode'),
        editBtn: document.getElementById('edit-btn'),
        cancelEditBtn: document.getElementById('cancel-edit'),
        editNameInput: document.getElementById('edit-name'),
        editEmailInput: document.getElementById('edit-email')
    };

    // Load and validate user data
    let userData;
    try {
        userData = JSON.parse(localStorage.getItem('currentUser'));
        if (!userData || !userData.name || !userData.email) {
            throw new Error('Invalid user data');
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        window.location.href = 'login.html';
        return;
    }

    // Update profile display
    function updateProfile() {
        // Set avatar
        elements.avatarCircle.textContent = userData.name.charAt(0).toUpperCase();
        
        // Update profile info
        elements.displayName.textContent = userData.name;
        elements.displayEmail.textContent = userData.email;
        
        // Format and display join date
        const joinDate = userData.joinDate ? new Date(userData.joinDate) : new Date();
        elements.memberSince.textContent = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate and display total items
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        elements.totalItems.textContent = notes.length + tasks.length;

        // Update form fields
        elements.editNameInput.value = userData.name;
        elements.editEmailInput.value = userData.email;
    }

    // Edit mode handlers
    elements.editBtn.addEventListener('click', () => {
        elements.viewMode.style.display = 'none';
        elements.editMode.style.display = 'block';
    });

    elements.cancelEditBtn.addEventListener('click', () => {
        elements.editMode.style.display = 'none';
        elements.viewMode.style.display = 'block';
    });

    // Handle form submission
    elements.editMode.addEventListener('submit', (e) => {
        e.preventDefault();

        // Update user data
        userData.name = elements.editNameInput.value.trim();
        userData.email = elements.editEmailInput.value.trim();
        userData.lastActive = new Date().toISOString();

        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Update display
        updateProfile();

        // Switch back to view mode
        elements.editMode.style.display = 'none';
        elements.viewMode.style.display = 'block';
    });

    // Initialize profile
    updateProfile();
});