// --- Data Management (Persistence) ---
const getEnrolledCourses = () => {
    const saved = localStorage.getItem('enrolled_courses');
    return saved ? JSON.parse(saved) : [];
};

const enrollCourse = (course) => {
    const enrolled = getEnrolledCourses();

    // Time Conflict Check
    if (course.day && course.startTime) {
        const hasConflict = enrolled.some(e =>
            e.day === course.day &&
            ((course.startTime >= e.startTime && course.startTime < e.endTime) ||
                (course.endTime > e.startTime && e.endTime <= e.endTime))
        );
        if (hasConflict) {
            alert(`Time Conflict! You are already enrolled in ${e.name} at this time.`);
            return false;
        }
    }

    if (!enrolled.find(c => c.id === course.id)) {
        enrolled.push(course);
        localStorage.setItem('enrolled_courses', JSON.stringify(enrolled));
        renderSidebar();
        return true;
    }
    return false;
};

const unenrollCourse = (courseId) => {
    let enrolled = getEnrolledCourses();
    enrolled = enrolled.filter(c => c.id !== courseId); // Keep everything EXCEPT this ID
    localStorage.setItem('enrolled_courses', JSON.stringify(enrolled));
    renderSidebar();
};

// Unenroll All functionality
const unenrollAllBtn = document.getElementById('unenroll-all-btn');
if (unenrollAllBtn) {
    unenrollAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to unenroll from all courses?')) {
            localStorage.removeItem('enrolled_courses');
            location.reload(); // Reload to refresh sidebar and calendar
        }
    });
}

// --- UI Updates ---
const renderSidebar = () => {
    const sidebarList = document.getElementById('enrolled-list');
    if (!sidebarList) return;

    const enrolled = getEnrolledCourses();
    if (enrolled.length === 0) {
        sidebarList.innerHTML = '<p class="empty-msg">No courses enrolled</p>';
        return;
    }

    sidebarList.innerHTML = enrolled.map(course => `
        <div class="enrolled-class-item">${course.id} - ${course.name}</div>
    `).join('');
};

const refreshEnrollmentButtons = () => {
    const enrollButtons = document.querySelectorAll('.enroll-btn');
    const enrolledIds = getEnrolledCourses().map(c => c.id);

    enrollButtons.forEach(btn => {
        const courseId = btn.dataset.id;

        // Always ensure the button has its base shape class
        btn.classList.add('btn');

        if (enrolledIds.includes(courseId)) {
            // If already enrolled, make it a "Drop" button (Red)
            btn.innerText = "Drop";
            btn.dataset.action = "unenroll";
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');
        } else {
            // If not enrolled, make it an "Enroll" button (Blue)
            btn.innerText = "Enroll";
            btn.dataset.action = "enroll";
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
        }
    });
};

// Theme Management
const initTheme = () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    const themeToggle = document.getElementById('checkbox');
    if (themeToggle) {
        // Synchronize checkbox state with the actual current theme
        themeToggle.checked = (currentTheme === 'dark');

        themeToggle.addEventListener('change', function(e) {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    if(typeof updateToggleButton === 'function') {
        updateToggleButton(document.body.classList.contains('sidebar-collapsed'));
    }
};

// Search & Render Logic
const renderSearchResults = (filterText = "") => {
    const resultsContainer = document.getElementById('course-results');
    if (!resultsContainer) return;

    const filtered = courseDatabase.filter(course =>
        course.name.toLowerCase().includes(filterText.toLowerCase()) ||
        course.id.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p>No courses found matching your search.</p>';
        return;
    }

    resultsContainer.innerHTML = filtered.map(course => {
        const uniCost = universities[course.univ]?.costPerCredit || 0;
        const tuition = course.credits * uniCost;
        const isEnrolled = getEnrolledCourses().some(e => e.id === course.id);

        return `
                <div class="course-card">
                    <h3>${course.id}: ${course.name}</h3>
                    <p><em>${course.univ} | Professor: ${course.prof}</em></p>
                    ${course.desc}
                    <div class="course-footer">
                        ${formatTime(course.startTime)} - ${formatTime(course.endTime)} - ${course.day}
                        <hr style="margin: 10px 0; opacity: 0.2;">
                        <div class="course-details">
                            <span>Credits: ${course.credits}</span> | 
                            <strong>Tuition Cost: $${tuition}</strong>
                        </div>
                        <button class="enroll-btn btn ${isEnrolled ? 'btn-danger' : 'btn-primary'}" 
                                data-id="${course.id}" 
                                data-action="${isEnrolled ? 'unenroll' : 'enroll'}">
                            ${isEnrolled ? 'Drop' : 'Enroll'}
                        </button>
                    </div>
                </div>
            `;
    }).join('');
};

// Helper to convert "14:30" to "2:30 PM"
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderSidebar();

    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value);
        });
    }

    // Initial render of results if on search page
    if (document.getElementById('course-results')) {
        renderSearchResults();
    }

    refreshEnrollmentButtons()

    const sidebarToggle = document.getElementById('sidebar-toggle-floating');
    if (sidebarToggle) {
        // Set initial icon based on current state
        updateToggleButton(document.body.classList.contains('sidebar-collapsed'));

        sidebarToggle.addEventListener('click', () => {
            const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
            updateToggleButton(isCollapsed);
        });
    }

    // Helper function to handle the icon change
    function updateToggleButton(isCollapsed) {
        const btn = document.getElementById('sidebar-toggle-floating');
        if (btn) {
            // If collapsed, show Hamburger; if expanded, show Arrows
            btn.innerHTML = isCollapsed ? '☰' : '«';
        }
    }

    const actionButtons = document.querySelectorAll('.enroll-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const courseId = e.target.dataset.id;
            const action = e.target.dataset.action;

            if (action === 'enroll') {
                // Find the full course object from database to ensure all properties are present
                const course = courseDatabase.find(c => c.id === courseId);
                if (course && enrollCourse(course)) {
                    refreshEnrollmentButtons();
                }
            } else if (action === 'unenroll') {
                unenrollCourse(courseId);
                refreshEnrollmentButtons();
            }
        });
    });
});