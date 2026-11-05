// --- Data Management (Persistence) ---
const getEnrolledCourses = () => {
    const saved = localStorage.getItem('enrolled_courses');
    return saved ? JSON.parse(saved) : [];
};

const enrollCourse = (course) => {
    const enrolled = getEnrolledCourses();

    // Time Conflict Check
    if (course.day && course.startTime) {
        const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
        const days = String(course.day).split(',');
        const conflict = enrolled.find(e =>
            e.id !== course.id && e.day && e.startTime &&
            String(e.day).split(',').some(d => days.includes(d)) &&
            toMin(course.startTime) < toMin(e.endTime) &&
            toMin(course.endTime) > toMin(e.startTime)
        );
        if (conflict) {
            alert(`Time Conflict! You are already enrolled in ${conflict.id} - ${conflict.name} at this time.`);
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
const escapeCourseMarkup = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

const coursesByPrerequisite = new Map();
courseDatabase.forEach(course => {
    if (!Array.isArray(course.prerequisites)) return;

    course.prerequisites.forEach(prerequisite => {
        const requiredBy = coursesByPrerequisite.get(prerequisite) || [];
        requiredBy.push(course);
        coursesByPrerequisite.set(prerequisite, requiredBy);
    });
});

const transferStatusLabels = {
    'verified-liberty-guide': 'Listed in a Liberty transfer guide',
    'official-needs-confirmation': 'Official source; confirm current applicability',
    'unverified-suggestion': 'Unverified suggestion; not an approved equivalency'
};

const transferGuideDefinitions = [
    {
        name: 'Study.com',
        fileName: 'Studycom.csv',
        url: 'https://dcfwfuaf91uza.cloudfront.net/online/wp-content/uploads/Study.com-Course-Equivalency-Guide.pdf'
    },
    {
        name: 'StraighterLine',
        fileName: 'StraighterLine.csv',
        url: 'https://www.liberty.edu/residential/wp-content/uploads/Straighterline-Transfer-Equivalency-Guide-Finalized.pdf'
    },
    {
        name: 'Liberty Online Academy',
        fileName: 'LUOA-Equivalency-Chart.csv',
        url: 'https://dcfwfuaf91uza.cloudfront.net/online-academy/wp-content/uploads/LUOA-Equivalency-Chart.pdf'
    }
].map(guide => ({
    ...guide,
    dataUrl: new URL(`../data/transfer-guides/${guide.fileName}`, document.currentScript.src).href
}));

const cleanTransferValue = value => String(value ?? '')
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    .trim();

const parseCsv = text => {
    const rows = [];
    let row = [];
    let field = '';
    let insideQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        if (insideQuotes) {
            if (character === '"' && text[index + 1] === '"') {
                field += '"';
                index += 1;
            } else if (character === '"') {
                insideQuotes = false;
            } else {
                field += character;
            }
        } else if (character === '"' && field.length === 0) {
            insideQuotes = true;
        } else if (character === ',') {
            row.push(cleanTransferValue(field));
            field = '';
        } else if (character === '\n' || character === '\r') {
            row.push(cleanTransferValue(field));
            if (row.some(Boolean)) rows.push(row);
            row = [];
            field = '';
            if (character === '\r' && text[index + 1] === '\n') index += 1;
        } else {
            field += character;
        }
    }

    row.push(cleanTransferValue(field));
    if (row.some(Boolean)) rows.push(row);
    if (insideQuotes) throw new Error('CSV contains an unterminated quoted field.');
    return rows;
};

const parseTransferGuide = (guide, text) => {
    const rows = parseCsv(text);
    if (guide.fileName === 'LUOA-Equivalency-Chart.csv') {
        const header = rows[0]?.map(value => value.toLowerCase()) || [];
        const providerCodeIndex = header.indexOf('luoa_course_code');
        const providerTitleIndex = header.indexOf('luoa_course_title');
        const libertyCodeIndex = header.indexOf('luo_course_code');
        if (providerCodeIndex < 0 || providerTitleIndex < 0 || libertyCodeIndex < 0) {
            throw new Error('LUOA CSV is missing expected course columns.');
        }
        return rows.slice(1).map(row => ({
            provider: guide.name,
            providerCourseCode: row[providerCodeIndex] || '',
            providerCourseTitle: row[providerTitleIndex] || '',
            libertyCourseCode: row[libertyCodeIndex] || '',
            libertyCourseTitle: '',
            providerCredits: '',
            libertyCredits: '',
            guideUrl: guide.url
        })).filter(record => record.providerCourseCode && record.libertyCourseCode);
    }

    const headerIndex = rows.findIndex(row =>
        row.some(value => value.toLowerCase() === 'ace number') &&
        row.some(value => value.toLowerCase() === 'course title')
    );
    if (headerIndex < 0) throw new Error(`${guide.name} CSV is missing its course table header.`);

    return rows.slice(headerIndex + 1).map(row => ({
        provider: guide.name,
        providerCourseCode: row[1] || '',
        providerCourseTitle: [row[2], row[3]].filter(Boolean).join(' — '),
        providerCredits: row[4] || '',
        libertyCourseCode: row[5] || '',
        libertyCourseTitle: row[6] || '',
        libertyCredits: row[7] || '',
        guideUrl: guide.url
    })).filter(record => record.providerCourseCode && record.libertyCourseCode);
};

let transferGuideDataPromise;
const loadTransferGuideData = () => {
    if (!transferGuideDataPromise) {
        transferGuideDataPromise = Promise.allSettled(
            transferGuideDefinitions.map(async guide => {
                const response = await fetch(guide.dataUrl);
                if (!response.ok) {
                    throw new Error(`${guide.fileName} could not be loaded (HTTP ${response.status}).`);
                }
                return parseTransferGuide(guide, await response.text());
            })
        ).then(results => {
            const records = [];
            const errors = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    records.push(...result.value);
                } else {
                    console.error(`Transfer guide ${transferGuideDefinitions[index].fileName} could not be read.`, result.reason);
                    errors.push(`${transferGuideDefinitions[index].name}: ${result.reason.message}`);
                }
            });
            return { records, errors };
        });
    }
    return transferGuideDataPromise;
};

const courseCodesIn = value => cleanTransferValue(value)
    .toUpperCase()
    .match(/[A-Z]{2,6}\s+\d{3}[A-Z]?/g)
    ?.map(code => code.replace(/\s+/g, ' ')) || [];

const appendExternalLink = (parent, label, url) => {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'https:') throw new Error('Only HTTPS source links are allowed.');
        const link = document.createElement('a');
        link.href = parsedUrl.href;
        link.textContent = `${label} ↗`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        parent.appendChild(link);
    } catch (error) {
        console.error(`Could not add ${label} link.`, error);
    }
};

const renderPrerequisiteTransferOptions = async (courseCode, panel) => {
    panel.replaceChildren();
    const course = courseDatabase.find(record => record.id === courseCode);
    const heading = document.createElement('h4');
    heading.textContent = `Transfer options for ${courseCode}${course ? `: ${course.name}` : ''}`;
    panel.appendChild(heading);
    const loading = document.createElement('p');
    loading.textContent = 'Checking the available transfer guides…';
    panel.appendChild(loading);

    let importedRecords = [];
    let importedDataError = '';
    const storedData = localStorage.getItem('fasttrak-prerequisite-transfer-data');
    if (storedData) {
        try {
            const imported = JSON.parse(storedData);
            const course = Array.isArray(imported.courses)
                ? imported.courses.find(record =>
                    cleanTransferValue(record.courseCode).toUpperCase() === courseCode.toUpperCase())
                : null;
            if (course && Array.isArray(imported.transferEquivalencies)) {
                const institutions = new Map(
                    (Array.isArray(imported.sendingInstitutions) ? imported.sendingInstitutions : [])
                        .map(institution => [institution.id, institution])
                );
                importedRecords = imported.transferEquivalencies
                    .filter(record => record.universityCourseId === course.id)
                    .map(record => ({
                        ...record,
                        institution: institutions.get(record.sendingInstitutionId)
                    }));
            }
        } catch (error) {
            console.error('Saved transfer data could not be read.', error);
            importedDataError = 'Saved transfer data could not be read. Re-import a valid JSON guide file on the Prerequisite Finder page.';
        }
    }

    const { records, errors } = await loadTransferGuideData();
    const normalizedCourseCode = cleanTransferValue(courseCode).toUpperCase();
    const guideMatches = records.filter(record =>
        courseCodesIn(record.libertyCourseCode).includes(normalizedCourseCode)
    );
    panel.replaceChildren(heading);

    for (const record of importedRecords) {
        const option = document.createElement('article');
        option.className = 'prerequisite-transfer-option';
        const status = transferStatusLabels[record.equivalencyStatus] || 'Status unavailable; verify with Liberty';
        const institutionName = record.institution?.name || 'Sending institution';
        const title = document.createElement('strong');
        title.textContent = `${institutionName}: ${record.sendingCourseCode} — ${record.sendingCourseTitle}`;
        const details = document.createElement('p');
        details.textContent = `${record.sendingCreditHours} credits · ${status}${record.lastVerifiedDate ? ` · Last verified ${record.lastVerifiedDate}` : ' · Verification date not provided'}`;
        const equivalent = document.createElement('p');
        equivalent.textContent = `Liberty equivalent: ${record.libertyEquivalentCourseCode || courseCode}`;
        option.append(title, details, equivalent);
        if (record.sourceUrl) appendExternalLink(option, 'Equivalency source', record.sourceUrl);
        if (record.sendingCourseCatalogUrl) appendExternalLink(option, 'Provider catalog', record.sendingCourseCatalogUrl);
        panel.appendChild(option);
    }

    for (const record of guideMatches) {
        const option = document.createElement('article');
        option.className = 'prerequisite-transfer-option';
        const title = document.createElement('strong');
        title.textContent = `${record.provider}: ${record.providerCourseCode} — ${record.providerCourseTitle}`;
        const details = document.createElement('p');
        details.textContent = `Provider credits: ${record.providerCredits || 'Not listed'}`;
        const equivalent = document.createElement('p');
        equivalent.textContent = `Liberty equivalent: ${record.libertyCourseCode}${record.libertyCourseTitle ? ` — ${record.libertyCourseTitle}` : ''}${record.libertyCredits ? ` (${record.libertyCredits} credits)` : ''}`;
        option.append(title, details, equivalent);
        appendExternalLink(option, 'Transfer guide source', record.guideUrl);
        panel.appendChild(option);
    }

    if (!importedRecords.length && !guideMatches.length) {
        const unavailable = document.createElement('p');
        unavailable.textContent = 'No transfer equivalencies were found.';
        panel.appendChild(unavailable);
    }
    if (importedDataError) {
        const importError = document.createElement('p');
        importError.textContent = importedDataError;
        panel.appendChild(importError);
    }
    if (errors.length) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = `Some transfer guides could not be loaded: ${errors.join('; ')}`;
        panel.appendChild(errorMessage);
    }
    const note = document.createElement('p');
    note.textContent = 'Confirm current transfer applicability with Liberty before enrolling.';
    panel.appendChild(note);
};

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
        const requiredBy = coursesByPrerequisite.get(course.id) || [];
        const requiredFor = requiredBy.length
            ? requiredBy.map(requiredCourse => `<button type="button" class="prerequisite-transfer-toggle course-required-for-button" data-course-id="${escapeCourseMarkup(requiredCourse.id)}">${escapeCourseMarkup(requiredCourse.id)}: ${escapeCourseMarkup(requiredCourse.name)}</button>`).join(' ')
            : 'None';

        return `
                <div class="course-card" data-course-id="${escapeCourseMarkup(course.id)}" tabindex="-1">
                    <h3>${course.id}: ${course.name}</h3>
                    <p><em>${course.univ} | Professor: ${course.prof}</em></p>
                    ${course.desc}
                    <div class="course-footer">
                        ${formatTime(course.startTime)} - ${formatTime(course.endTime)} - ${course.day}
                        <hr style="margin: 10px 0; opacity: 0.2;">
                        <div class="course-details">
                            <span>Credits: ${course.credits}</span> | 
                            <strong>Estimated tuition: $${tuition}</strong>
                            <small class="tuition-estimate-note">Illustrative estimate at $${uniCost} per credit; confirm current tuition with the institution.</small>
                        </div>
                        <div class="course-prereqs">
                                            <strong>Prerequisites:</strong> ${(course.prerequisites && course.prerequisites.length) ? course.prerequisites.map((prerequisite, index) => {
                                                const panelId = `transfer-options-${course.id}-${index}`.replace(/[^a-zA-Z0-9_-]/g, '-');
                                                const prerequisiteCourse = courseDatabase.find(record => record.id === prerequisite);
                                                const prerequisiteLabel = prerequisiteCourse
                                                    ? `${prerequisiteCourse.id}: ${prerequisiteCourse.name}`
                                                    : prerequisite;
                                                return `<button type="button" class="prerequisite-transfer-toggle" data-prerequisite-code="${escapeCourseMarkup(prerequisite)}" aria-controls="${panelId}" aria-expanded="false">${escapeCourseMarkup(prerequisiteLabel)}</button>`;
                                            }).join(' ') : 'None'}
                                            ${(course.prerequisites || []).map((_, index) => {
                                                const panelId = `transfer-options-${course.id}-${index}`.replace(/[^a-zA-Z0-9_-]/g, '-');
                                                return `<div id="${panelId}" class="prerequisite-transfer-options" hidden></div>`;
                                            }).join('')}
                                            <div class="course-required-for">
                                                <strong>Required for:</strong> ${requiredFor}
                                            </div>
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

    // Prerequisite visibility toggle
    const prereqBtn = document.getElementById('toggle-prereqs-btn');
    const applyPrereqPref = () => {
        const hidden = localStorage.getItem('hide_prereqs') === 'true';
        document.body.classList.toggle('hide-prereqs', hidden);
        if (prereqBtn) prereqBtn.innerText = hidden ? "Display prerequisites" : "Don't display prerequisites";
    };
    applyPrereqPref();
    if (prereqBtn) {
        prereqBtn.addEventListener('click', () => {
            const hidden = localStorage.getItem('hide_prereqs') === 'true';
            localStorage.setItem('hide_prereqs', String(!hidden));
            applyPrereqPref();
        });
    }

    // Event delegation so buttons work after every search re-render
    const resultsEl = document.getElementById('course-results');
    if (resultsEl) {
        resultsEl.addEventListener('click', (e) => {
            const requiredForButton = e.target.closest('.course-required-for-button');
            if (requiredForButton) {
                searchInput.value = requiredForButton.dataset.courseId;
                renderSearchResults(searchInput.value);
                const courseCard = Array.from(resultsEl.querySelectorAll('.course-card'))
                    .find(card => card.dataset.courseId === requiredForButton.dataset.courseId);
                if (courseCard) {
                    courseCard.focus({ preventScroll: true });
                    courseCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            const prerequisiteButton = e.target.closest('.prerequisite-transfer-toggle');
            if (prerequisiteButton) {
                const panelId = prerequisiteButton.getAttribute('aria-controls');
                const panel = document.getElementById(panelId);
                if (!panel) {
                    console.error(`Transfer options panel ${panelId} is missing.`);
                    return;
                }
                const isOpen = prerequisiteButton.getAttribute('aria-expanded') === 'true';
                document.querySelectorAll('.prerequisite-transfer-options.is-open').forEach(openPanel => {
                    if (openPanel !== panel) {
                        openPanel.hidden = true;
                        openPanel.classList.remove('is-open');
                        const openButton = Array.from(resultsEl.querySelectorAll('.prerequisite-transfer-toggle[aria-expanded="true"]'))
                            .find(button => button.getAttribute('aria-controls') === openPanel.id);
                        if (openButton) openButton.setAttribute('aria-expanded', 'false');
                    }
                });
                if (isOpen) {
                    panel.hidden = true;
                    panel.classList.remove('is-open');
                    prerequisiteButton.setAttribute('aria-expanded', 'false');
                } else {
                    panel.hidden = false;
                    panel.classList.add('is-open');
                    prerequisiteButton.setAttribute('aria-expanded', 'true');
                    renderPrerequisiteTransferOptions(prerequisiteButton.dataset.prerequisiteCode, panel)
                        .catch(error => {
                            console.error('Transfer guide matches could not be displayed.', error);
                            panel.replaceChildren();
                            const message = document.createElement('p');
                            message.textContent = 'Transfer guide matches could not be displayed. Check the browser console for details.';
                            panel.appendChild(message);
                        });
                }
                return;
            }

            const btn = e.target.closest('.enroll-btn');
            if (!btn) return;
            const courseId = btn.dataset.id;
            if (btn.dataset.action === 'enroll') {
                const course = courseDatabase.find(c => c.id === courseId);
                if (course && enrollCourse(course)) refreshEnrollmentButtons();
            } else if (btn.dataset.action === 'unenroll') {
                unenrollCourse(courseId);
                refreshEnrollmentButtons();
            }
        });
    }
});