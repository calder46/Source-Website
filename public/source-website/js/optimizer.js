
/**
 * FastTrak Optimizer Engine
 * Handles degree requirement analysis and path optimization.
 */

document.addEventListener('DOMContentLoaded', () => {
    const degreeSelect = document.getElementById('opt-degree');
    const gradSemesterSelect = document.getElementById('opt-grad-semester');
    const maxCreditsInput = document.getElementById('opt-max-credits');
    const prioritySelect = document.getElementById('opt-priority');
    const generateBtn = document.getElementById('btn-generate');
    const resultsContainer = document.getElementById('optimizer-results');

    // 1. Initialize Degree Dropdown from degrees.js
    if (typeof degreePlans !== 'undefined') {
        degreePlans.forEach(plan => {
            const opt = document.createElement('option');
            opt.value = plan.id;
            opt.textContent = `${plan.name} (${plan.award})`;
            degreeSelect.appendChild(opt);
        });
    }

    // 2. Populate Semester Dropdown (Fall 2026 to Summer 2035)
    const semesters = [];
    const terms = ['Fall', 'Spring', 'Summer'];
    let startYear = 2026;

    for (let year = startYear; year <= startYear + 9; year++) {
        terms.forEach(term => {
            if (term === 'Summer' && year === startYear) return; // Start with Fall
            semesters.push(`${term} ${year}`);
        });
    }

    semesters.forEach(sem => {
        const opt = document.createElement('option');
        opt.value = sem;
        opt.textContent = sem;
        gradSemesterSelect.appendChild(opt);
    });

    // 3. Event Listener
    generateBtn.addEventListener('click', () => {
        const degreeId = degreeSelect.value;
        if (!degreeId) return alert("Please select a degree first.");
        runOptimization(degreeId);
    });

    function runOptimization(degreeId) {
        const plan = degreePlans.find(p => p.id === degreeId);
        if (!plan) return;

        let neededCourseIds = [];
        plan.sections.forEach(section => {
            neededCourseIds = [...neededCourseIds, ...section.courseIds];
        });

        // Expand course list to include all prerequisites for required courses
        const expandedCourseSet = new Set();
        const courseMap = new Map();
        courseDatabase.forEach(c => courseMap.set(c.id, c));

        function addWithPrereqs(cid) {
            if (expandedCourseSet.has(cid)) return;
            expandedCourseSet.add(cid);
            const data = courseMap.get(cid);
            if (data && data.prerequisites) {
                data.prerequisites.forEach(pId => addWithPrereqs(pId));
            }
        }

        neededCourseIds.forEach(cid => addWithPrereqs(cid));
        const finalNeededCourseIds = Array.from(expandedCourseSet);

        const maxCredits = parseInt(maxCreditsInput.value) || 18;
        const priority = prioritySelect.value;

        // Calculate available semesters until target graduation to allow for "stretching"
        const gradSemesterValue = gradSemesterSelect.value;
        const semesterList = Array.from(gradSemesterSelect.options).map(opt => opt.value);
        const targetIndex = semesterList.indexOf(gradSemesterValue);
        const availableSemesters = targetIndex > -1 ? targetIndex + 1 : 1;

        // Calculate total credits needed to determine if we should spread them out
        let totalRequiredCredits = 0;
        finalNeededCourseIds.forEach(cid => {
            const c = courseMap.get(cid);
            if (c) totalRequiredCredits += c.credits;
        });

        const roadmap = computeRoadmap(finalNeededCourseIds, maxCredits, priority, availableSemesters, totalRequiredCredits);
        renderRoadmap(roadmap, plan.name, finalNeededCourseIds);
    }

    /**
     * Core Optimization Algorithm: Constrained Topological Sort
     */
    function computeRoadmap(courseIds, maxCredits, priority, availableSemesters, totalRequiredCredits) {
        const schedule = [];
        let remaining = [...new Set(courseIds)];
        let currentSemesterIndex = 1;
        const courseMap = new Map();
        courseDatabase.forEach(c => courseMap.set(c.id, c));

        // Calculate priority for each course based on the longest dependency chain it starts
        // This ensures prerequisite chains are prioritized to prevent graduation delays.
        const priorities = new Map();
        function getPriority(cid) {
            if (priorities.has(cid)) return priorities.get(cid);
            let maxChildPriority = 0;
            for (const c of courseDatabase) {
                if (c.prerequisites && c.prerequisites.includes(cid)) {
                    maxChildPriority = Math.max(maxChildPriority, getPriority(c.id));
                }
            }
            const p = 1 + maxChildPriority;
            priorities.set(cid, p);
            return p;
        }

        // Pre-calculate priorities for all required courses
        courseIds.forEach(cid => getPriority(cid));

        // Determine the effective credit limit for this run
        let effectiveMaxCredits = maxCredits;
        if (availableSemesters > 1 && priority !== "speed") {
            const idealLoad = totalRequiredCredits / availableSemesters;
            effectiveMaxCredits = Math.min(maxCredits, idealLoad * 1.2);
        }

        while (remaining.length > 0 && currentSemesterIndex <= 48) {
            const semesterCourses = [];
            let currentSemesterCredits = 0;

            // Sort remaining courses by priority descending so we pick the ones that unlock most dependencies first
            remaining.sort((a, b) => (priorities.get(b) || 0) - (priorities.get(a) || 0));

            for (let i = 0; i < remaining.length; i++) {
                const cid = remaining[i];
                const data = courseMap.get(cid);

                // If the course isn't in our database, we treat it as having no prereqs to avoid blocking the whole plan
                const credits = data ? data.credits : 3;

                if (currentSemesterCredits + credits > effectiveMaxCredits) continue;

                const prereqs = data?.prerequisites || [];
                // A prerequisite is met if it has already been added to a previous semester's schedule
                const prereqsMet = prereqs.every(pId =>
                    schedule.some(sem => sem.courses.some(sc => sc.id === pId))
                );

                if (prereqsMet) {
                    semesterCourses.push({
                        id: cid,
                        name: data ? data.name : "Unknown Course",
                        credits: credits,
                        univ: data ? data.univ : 'N/A',
                        isMissing: !data
                    });
                    currentSemesterCredits += credits;
                    remaining.splice(i, 1);
                    i--;
                }
            }

            if (semesterCourses.length === 0) {
                // If no courses could be scheduled this semester but there are still remaining ones,
                // it means we've hit a bottleneck or circular dependency.
                break;
            }

            schedule.push({
                term: `Semester ${currentSemesterIndex}`,
                courses: semesterCourses,
                totalCredits: currentSemesterCredits
            });
            currentSemesterIndex++;
        }

        return {
            schedule,
            unresolved: remaining
        };
    }

    function renderRoadmap(result, degreeName, neededCourseIds) {
        resultsContainer.innerHTML = `<h2>Optimized Path: ${degreeName}</h2>`;

        if (result.schedule.length === 0 && result.unresolved.length > 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.innerHTML = `<p class="badge badge-prereq">No courses could be scheduled. Check your degree requirements or catalog data.</p>`;
            resultsContainer.appendChild(emptyDiv);
            return;
        }

        // Use a Set for efficient lookup of the current degree's requirements
        const neededSet = new Set(neededCourseIds);
        const prereqMap = new Map(); // Key: Prereq ID, Value: Array of dependent IDs in this plan

        // Build the dependency map by checking every course in the database
        // to see if it's a prerequisite for something in our current degree plan.
        courseDatabase.forEach(c => {
            if (c.prerequisites && c.prerequisites.length > 0) {
                c.prerequisites.forEach(pId => {
                    // If the prerequisite is part of our required courses...
                    if (neededSet.has(pId)) {
                        // ...and if this current course 'c' is also part of our plan...
                        if (neededSet.has(c.id)) {
                            if (!prereqMap.has(pId)) prereqMap.set(pId, []);
                            prereqMap.get(pId).push(c.id);
                        }
                    }
                });
            }
        });

        // Render Scheduled Semesters
        const timeline = document.createElement('div');
        timeline.className = 'timeline-container';

        result.schedule.forEach(sem => {
            const block = document.createElement('div');
            block.className = 'semester-block';
            let coursesHtml = sem.courses.map(c => {
                // Check if this specific course is a prerequisite for something in our map
                const dependents = prereqMap.get(c.id);
                const isPrereq = dependents && dependents.length > 0;

                let statusBadge = `<span class="badge badge-flexible" style="background: #e2e8f0; color: #475569;">Flexible</span>`;
                if (isPrereq) {
                    statusBadge = `<span class="badge badge-prereq">Required for: ${dependents.join(', ')}</span>`;
                }

                return `
                    <div class="course-row">
                        <div class="course-info">
                            <h4>${c.id} - ${c.name}</h4>
                            <p>${c.univ}</p>
                            ${statusBadge}
                        </div>
                        <span class="badge badge-credits">${c.credits} Cr</span>
                    </div>
                `;
            }).join('');

            block.innerHTML = `
                <div class="semester-header">
                    <span>${sem.term}</span>
                    <strong>${sem.totalCredits} Credits</strong>
                </div>
                <div class="course-list">${coursesHtml}</div>
            `;
            timeline.appendChild(block);
        });

        resultsContainer.appendChild(timeline);

        // Render Unresolved Courses (The "Best Effort" part)
        if (result.unresolved.length > 0) {
            const warningSection = document.createElement('div');
            warningSection.className = 'semester-block';
            warningSection.style.borderLeft = '4px solid #d93025'; // Red accent for warnings

            let unresolvedHtml = `
                <div class="semester-header" style="background: #b91c1c;">
                    <span>Unscheduled Courses</span>
                    <small>Requires manual review</small>
                </div>
                <p style="padding: 10px; font-size: 0.85rem; color: var(--text-main);">
                    The following courses could not be scheduled because their prerequisites are missing from the database or form a circular dependency:
                </p>
            `;

            result.unresolved.forEach(cid => {
                unresolvedHtml += `
                    <div class="course-row">
                        <strong>${cid}</strong>
                        <span class="badge badge-prereq">Missing Prerequisite Data</span>
                    </div>
                `;
            });

            warningSection.innerHTML = unresolvedHtml;
            resultsContainer.appendChild(warningSection);
        }
    }
});