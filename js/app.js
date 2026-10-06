// --- Data Management (Persistence) ---
const getEnrolledCourses = () => {
    const saved = localStorage.getItem('enrolled_courses');
    return saved ? JSON.parse(saved) : [];
};

const enrollCourse = (course) => {
    const enrolled = getEnrolledCourses();
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
        <div class="enrolled-class-item">${course.id} - ${course.title}</div>
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
        const tuition = course.credits * course.costPerCredit; // Calculated at runtime
        const isEnrolled = getEnrolledCourses().some(e => e.id === course.id);

        return `
            <div class="course-card">
                <h3>${course.id}: ${course.name}</h3>
                <p><em>${course.univ} | Professor: ${course.prof}</em></p>
                <p>${course.desc}</p>
                <hr style="margin: 10px 0; opacity: 0.2;">
                <div class="course-details">
                    <span>Credits: ${course.credits}</span> | 
                    <span>Cost/Credit: $${course.costPerCredit}</span> |
                    <strong>Total: $${tuition}</strong>
                </div>
                <button class="enroll-btn btn ${isEnrolled ? 'btn-danger' : 'btn-primary'}" 
                        data-id="${course.id}" 
                        data-action="${isEnrolled ? 'unenroll' : 'enroll'}">
                    ${isEnrolled ? 'Drop' : 'Enroll'}
                </button>
            </div>
        `;
    }).join('');
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

    const actionButtons = document.querySelectorAll('.enroll-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const courseId = e.target.dataset.id;
            const action = e.target.dataset.action;

            if (action === 'enroll') {
                const mockCourse = { id: courseId, title: "Enrolled Course" };
                if (enrollCourse(mockCourse)) {
                    refreshEnrollmentButtons();
                }
            } else if (action === 'unenroll') {
                unenrollCourse(courseId);
                refreshEnrollmentButtons();
            }
        });
    });
});