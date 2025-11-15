(function () {
	// Notes JS for FlowTrack
	// Stores notes in localStorage under key 'flowtrack_notes'

	const STORAGE_KEY = 'flowtrack_notes';

	function qs(selector) {
		return document.querySelector(selector);
	}

	function getNotes() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch (e) {
			console.error('Failed to parse notes from localStorage', e);
			return [];
		}
	}

	function saveNotes(notes) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	}

	function makeNoteCard(note) {
		const wrapper = document.createElement('div');
		wrapper.className = 'note-item';
		wrapper.style.background = 'var(--color-surface-200)';
		wrapper.style.padding = '1rem';
		wrapper.style.borderRadius = '10px';
		wrapper.style.border = '1px solid var(--color-border)';

		const text = document.createElement('div');
		text.style.color = 'var(--color-text-primary)';
		text.style.whiteSpace = 'pre-wrap';
		text.textContent = note.text;

		const meta = document.createElement('div');
		meta.style.display = 'flex';
		meta.style.justifyContent = 'space-between';
		meta.style.alignItems = 'center';
		meta.style.marginTop = '0.5rem';
		meta.style.color = 'var(--color-text-muted)';
		meta.style.fontSize = '0.85rem';

		const date = new Date(note.createdAt).toLocaleString();
		const left = document.createElement('div');
		left.textContent = date;

		const actions = document.createElement('div');

		const del = document.createElement('button');
		del.className = 'btn btn-secondary';
		del.textContent = 'Delete';
		del.style.padding = '0.25rem 0.6rem';
		del.addEventListener('click', function () {
			deleteNote(note.id);
		});

		actions.appendChild(del);

		meta.appendChild(left);
		meta.appendChild(actions);

		wrapper.appendChild(text);
		wrapper.appendChild(meta);

		return wrapper;
	}

	function renderNotes() {
		const list = qs('#notes-list');
		if (!list) return;
		list.innerHTML = '';

		const notes = getNotes();
		if (!notes.length) {
			const p = document.createElement('div');
			p.style.color = 'var(--color-text-muted)';
			p.textContent = 'No notes yet — write something above and click Save.';
			list.appendChild(p);
			return;
		}

		// newest first
		notes.slice().reverse().forEach(note => {
			list.appendChild(makeNoteCard(note));
		});
	}

	function addNote(text) {
		if (!text || !text.trim()) return;
		const notes = getNotes();
		const newNote = {
			id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
			text: text.trim(),
			createdAt: Date.now()
		};
		notes.push(newNote);
		saveNotes(notes);
		renderNotes();
	}

	function deleteNote(id) {
		let notes = getNotes();
		notes = notes.filter(n => n.id !== id);
		saveNotes(notes);
		renderNotes();
	}

	// Wire up DOM
	document.addEventListener('DOMContentLoaded', function () {
		const saveBtn = qs('#save-note');
		const clearBtn = qs('#clear-input');
		const input = qs('#note-input');
		const searchInput = qs('#search-notes');

		renderNotes();

		if (saveBtn && input) {
			saveBtn.addEventListener('click', function (e) {
				e.preventDefault();
				addNote(input.value);
				input.value = '';
				input.focus();
			});
		}

		if (clearBtn && input) {
			clearBtn.addEventListener('click', function (e) {
				e.preventDefault();
				input.value = '';
				input.focus();
			});
		}

		// Search/Filter functionality
		if (searchInput) {
			searchInput.addEventListener('input', function (e) {
				const searchTerm = e.target.value.toLowerCase();
				const noteItems = document.querySelectorAll('.note-item');

				noteItems.forEach(item => {
					const noteText = item.textContent.toLowerCase();
					if (noteText.includes(searchTerm)) {
						item.style.display = 'block';
						// Highlight the search term
						if (searchTerm.length > 0) {
							item.style.opacity = '1';
						}
					} else {
						item.style.display = 'none';
					}
				});

				// Show message if no results
				const visibleNotes = Array.from(noteItems).filter(item => item.style.display !== 'none');
				let noResultsMsg = document.getElementById('no-search-results');
				
				if (visibleNotes.length === 0 && searchTerm.length > 0) {
					if (!noResultsMsg) {
						noResultsMsg = document.createElement('div');
						noResultsMsg.id = 'no-search-results';
						noResultsMsg.style.textAlign = 'center';
						noResultsMsg.style.padding = '2rem';
						noResultsMsg.style.color = 'var(--color-text-muted)';
						noResultsMsg.textContent = '📭 No notes found matching your search';
						document.querySelector('.notes-list').appendChild(noResultsMsg);
					}
				} else if (noResultsMsg) {
					noResultsMsg.remove();
				}
			});
		}
	});
})();

