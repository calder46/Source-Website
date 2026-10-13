(() => {
    const courses = new Map(courseDatabase.map(c => [c.id, c]));
    const defaults = () => ({
        campus: 'Residential',
        current_degree: 'information-technology',
        academic_standing: 'Not provided',
        gpa: null,
        classification: 'Not provided',
        program_year: '2026-27',
        course_records: {},
        service_complete: false,
        graduation_application: false
    });
    let profile = defaults(), signedIn = false, filter = 'all',
        hiddenPrereqs = localStorage.getItem('hide_prereqs') === 'true', sequenceMode = false;
    let saveVersion = 0, loading = false;
    const pending = new Map();
    let requestNumber = 0;
    const el = id => document.getElementById(id);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
    const request = (action, payload) => new Promise((resolve, reject) => {
        if (window.parent === window) {
            reject(Error('Open the plan from FastTrak Home to access your account.'));
            return;
        }
        const requestId = String(++requestNumber);
        const timer = setTimeout(() => {
            pending.delete(requestId);
            reject(Error('Student storage did not respond. Please retry.'));
        }, 25000);
        pending.set(requestId, {resolve, reject, timer});
        window.parent.postMessage({type: 'academic-request', requestId, action, payload}, location.origin);
    });
    window.addEventListener('message', e => {
        if (e.origin !== location.origin || e.source !== window.parent) return;
        if (e.data?.type === 'academic-auth-changed') {
            load();
            return;
        }
        if (e.data?.type !== 'academic-response') return;
        const p = pending.get(e.data.requestId);
        if (!p) return;
        clearTimeout(p.timer);
        pending.delete(e.data.requestId);
        e.data.error ? p.reject(Error(e.data.error)) : p.resolve(e.data.result);
    });
    const current = () => degreePlans.find(p => p.id === profile.current_degree) || degreePlans[2];
    const allIds = p => p.sections.flatMap(s => s.courseIds);
    const record = id => profile.course_records[id] || {
        status: getEnrolledCourses().some(c => c.id === id) ? 'progress' : 'needed',
        grade: '',
        term: ''
    };
    const stats = p => {
        let complete = 0, progress = 0, upper = 0, major = 0;
        const majorIds = new Set(p.sections.filter(s => s.id !== 'general').flatMap(s => s.courseIds));
        for (const id of allIds(p)) {
            const c = courses.get(id);
            if (!c) continue;
            const status = record(id).status;
            if (status === 'complete') {
                complete += c.credits;
                if (parseInt(id.split(' ')[1]) >= 300) upper += c.credits;
                if (majorIds.has(id)) major += c.credits;
            } else if (status === 'progress') progress += c.credits;
        }
        return {complete, progress, upper, major};
    };
    const dirty = () => {
        saveVersion++;
        el('save-state').textContent = signedIn ? 'Unsaved changes' : 'Not saved · sign in to save';
    };
    const icon = status => `<span class="status-icon is-${status}">${status === 'complete' ? '✓' : status === 'progress' ? '◷' : '△'}</span>`;
    const check = (label, met, detail) => `<div class="check">${icon(met ? 'complete' : 'needed')}<div><strong>${label}</strong><small>${detail}</small></div></div>`;

    function render() {
        const p = current(), s = stats(p);
        el('degree-select').value = p.id;
        el('degree-school').textContent = p.school;
        el('catalog-source').href = p.source;
        el('student-summary').innerHTML = [['Campus', profile.campus], ['Current degree', `${p.award} ${p.name}`], ['Program year', profile.program_year], ['Classification', profile.classification], ['Overall GPA', profile.gpa === null ? 'Not provided' : Number(profile.gpa).toFixed(2)], ['Academic standing', profile.academic_standing]].map(([k, v]) => `<div class="${k === 'Current degree' ? 'student-degree' : ''}"><span>${k}</span><strong>${esc(v)}</strong></div>`).join('');
        const gpaMet = profile.gpa !== null && profile.gpa >= 2;
        const allMet = s.complete >= 120 && s.upper >= 30 && s.major >= Math.ceil((120 - 42) * .25) && gpaMet && profile.service_complete && profile.graduation_application;
        el('graduation-checks').innerHTML = check('Minimum Hours Overall', s.complete >= 120, `Current: ${s.complete} Credits · Required: 120 Credits`) + check('Minimum Graduation GPA', gpaMet, `Current: ${profile.gpa ?? 'Not provided'} · Required: 2.0 GPA`) + check('Minimum Upper Level Credits', s.upper >= 30, `Current: ${s.upper} Credits · Required: 30 Credits`) + check('Minimum Major Residency', s.major >= 20, `Current: ${s.major} Credits · Required: 20 Credits`) + check('Minimum Institutional Credits', s.complete >= 30, `Current: ${s.complete} Credits · Required: 30 Credits`) + `<div class="check">${icon(profile.graduation_application ? 'complete' : 'needed')}<label><strong>Degree Completion Application</strong><small><input type="checkbox" id="application-check" ${profile.graduation_application ? 'checked' : ''}> Submitted</small></label></div>` + check('All Requirements Met', allMet, 'Illustrative requirements; advisor verification required');
        el('credit-labels').innerHTML = `<span><strong>${s.complete}/120</strong> Credits Completed${s.progress ? ` · ${s.progress} In Progress` : ''}</span><span>${120 - s.complete} Remaining</span>`;
        el('complete-bar').style.width = `${s.complete / 120 * 100}%`;
        el('progress-bar').style.width = `${s.progress / 120 * 100}%`;
        document.querySelectorAll('[data-filter]').forEach(b => {
            b.classList.toggle('btn-primary', b.dataset.filter === filter);
            b.classList.toggle('btn-subtle', b.dataset.filter !== filter);
            b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
        });
        document.body.classList.toggle('hide-plan-prereqs', hiddenPrereqs);
        el('toggle-plan-prereqs').textContent = hiddenPrereqs ? 'Display prerequisites' : "Don't display prerequisites";
        const openIds = new Set([...document.querySelectorAll('.requirement-group[open]')].map(d => d.dataset.group));
        const hasGroups = !!el('requirement-groups').children.length;
        const groups = p.sections.map(section => {
            const ids = section.courseIds.filter(id => filter === 'all' || record(id).status === filter);
            const completed = section.courseIds.reduce((n, id) => n + (record(id).status === 'complete' ? courses.get(id).credits : 0), 0);
            return `<details class="requirement-group" data-group="${section.id}" ${!hasGroups || openIds.has(section.id) ? 'open' : ''}><summary>${icon(completed === section.credits ? 'complete' : 'progress')}${section.name}<span class="group-credits">${completed}/${section.credits} Credits</span></summary><div class="section-caption">${section.id === 'electives' ? `${section.credits} credits of degree-related electives` : `${section.credits} credits required`}</div><div class="table-scroll"><table class="course-table"><thead><tr><th></th><th>Course</th><th>Requirement</th><th>Credits</th><th>Status</th><th>Grade</th><th>Term</th></tr></thead><tbody>${ids.map(id => {
                const c = courses.get(id), r = record(id);
                return `<tr>${`<td>${icon(r.status)}</td><td>${esc(id)}</td><td>${esc(c.name)}<small class="plan-prereqs">Prerequisites: ${esc(c.prerequisites?.join(', ') || 'None')}</small></td><td>${c.credits}</td><td><select class="status-select" data-course="${esc(id)}" data-field="status" aria-label="Status for ${esc(id)}">${[['needed', 'Still Needed'], ['progress', 'In Progress'], ['complete', 'Complete']].map(([v, n]) => `<option value="${v}" ${v === r.status ? 'selected' : ''}>${n}</option>`).join('')}</select></td><td><input class="record-input" data-course="${esc(id)}" data-field="grade" aria-label="Grade for ${esc(id)}" maxlength="4" value="${esc(r.grade)}" placeholder="—"></td><td><input class="record-input term-input" data-course="${esc(id)}" data-field="term" aria-label="Term for ${esc(id)}" maxlength="40" value="${esc(r.term)}" placeholder="Not set"></td>`}</tr>`;
            }).join('') || '<tr><td colspan="7">No courses in this category.</td></tr>'}</tbody></table></div></details>`;
        }).join('');
        el('requirement-groups').innerHTML = `<details class="requirement-group" data-group="service" open><summary>${icon(profile.service_complete ? 'complete' : 'needed')}Christian Service<span class="group-credits">0/0 Credits</span></summary><div class="section-caption">Non-credit service requirement</div><div class="service-content"><input type="checkbox" id="service-check" ${profile.service_complete ? 'checked' : ''}><label for="service-check">Christian service requirements satisfied</label></div></details>` + groups;
    }

    async function load() {
        if (loading) return;
        loading = true;
        try {
            const result = await request('load');
            signedIn = result.signedIn;
            profile = result.profile ? {...defaults(), ...result.profile} : defaults();
            el('account-state').textContent = signedIn ? 'Student record' : 'Guest record';
            el('account-btn').textContent = signedIn ? 'Sign out' : 'Sign in';
            el('save-state').textContent = signedIn ? (result.profile ? 'Saved student record' : 'New student record · not saved') : 'Not saved · sign in to save';
            render();
        } catch (e) {
            el('save-state').textContent = e.message;
        } finally {
            loading = false;
        }
    }

    async function save() {
        if (!signedIn) {
            el('auth-dialog').showModal();
            return;
        }
        const version = saveVersion;
        el('save-record').disabled = true;
        el('save-state').textContent = 'Saving…';
        try {
            await request('save', profile);
            el('save-state').textContent = version === saveVersion ? 'Saved student record' : 'Unsaved changes';
        } catch (e) {
            el('save-state').textContent = e.message;
        } finally {
            el('save-record').disabled = false;
        }
    }

    degreePlans.forEach(p => {
        for (const id of ['degree-select', 'compare-degree']) {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.award} ${p.name}`;
            el(id).appendChild(option);
        }
    });
    el('degree-select').addEventListener('change', e => {
        profile.current_degree = e.target.value;
        dirty();
        render();
    });
    document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
        filter = b.dataset.filter;
        render();
    }));
    el('requirement-groups').addEventListener('change', e => {
        const id = e.target.dataset.course, field = e.target.dataset.field;
        if (id && field) {
            profile.course_records[id] = {...record(id), [field]: e.target.value};
            dirty();
            if (field === 'status') render();
        }
        if (e.target.id === 'service-check') {
            profile.service_complete = e.target.checked;
            dirty();
            render();
        }
    });
    el('graduation-checks').addEventListener('change', e => {
        if (e.target.id === 'application-check') {
            profile.graduation_application = e.target.checked;
            dirty();
            render();
        }
    });
    el('toggle-plan-prereqs').addEventListener('click', () => {
        hiddenPrereqs = !hiddenPrereqs;
        localStorage.setItem('hide_prereqs', String(hiddenPrereqs));
        render();
    });
    el('save-record').addEventListener('click', save);
    el('edit-profile').addEventListener('click', () => {
        const form = el('profile-form');
        for (const k of ['campus', 'academic_standing', 'gpa', 'classification', 'program_year']) form.elements[k].value = profile[k] ?? '';
        el('profile-dialog').showModal();
    });
    el('profile-form').addEventListener('submit', e => {
        e.preventDefault();
        const data = new FormData(e.target);
        for (const k of ['campus', 'academic_standing', 'classification', 'program_year']) profile[k] = data.get(k);
        profile.gpa = data.get('gpa') === '' ? null : Number(data.get('gpa'));
        dirty();
        render();
        el('profile-dialog').close();
    });
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
    el('account-btn').addEventListener('click', async () => {
        if (!signedIn) {
            el('auth-dialog').showModal();
            return;
        }
        try {
            await request('signout');
            await load();
        } catch (e) {
            el('save-state').textContent = e.message;
        }
    });

    async function auth(action) {
        el('auth-feedback').textContent = 'Please wait…';
        const f = el('auth-form');
        try {
            const result = await request(action, {email: f.elements.email.value, password: f.elements.password.value});
            f.elements.password.value = '';
            if (result?.confirmationRequired) {
                el('auth-feedback').textContent = 'Check your email to confirm your account, then sign in.';
                return;
            }
            el('auth-dialog').close();
            await load();
        } catch (e) {
            el('auth-feedback').textContent = e.message;
        }
    }

    el('auth-form').addEventListener('submit', e => {
        e.preventDefault();
        auth('signin');
    });
    el('create-account').addEventListener('click', () => {
        if (el('auth-form').reportValidity()) auth('signup');
    });
    el('google-signin').addEventListener('click', () => auth('google'));

    function compare() {
        const p = degreePlans.find(p => p.id === el('compare-degree').value);
        const s = stats(p);
        el('comparison-result').innerHTML = `<p class="comparison-stat">${s.complete} / 120</p><p>Completed credits applicable to ${esc(p.name)}</p><p>${s.progress} credits in progress · ${120 - s.complete} credits remaining</p><p>${p.electiveCredits} related elective credits required</p><a class="text-action" href="${p.source}" target="_blank" rel="noopener noreferrer">Liberty catalog reference ↗</a>`;
    }

    el('what-if').addEventListener('click', () => {
        el('compare-degree').value = degreePlans.find(p => p.id !== current().id).id;
        compare();
        el('analysis-dialog').showModal();
    });
    el('compare-degree').addEventListener('change', compare);
    el('view-sequence').addEventListener('click', () => {
        const ids = allIds(current()).sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]));
        let term = 1, total = 0, terms = [[]];
        for (const id of ids) {
            const c = courses.get(id);
            if (total + c.credits > 16) {
                terms.push([]);
                total = 0;
                term++;
            }
            terms[terms.length - 1].push(c);
            total += c.credits;
        }
        el('sequence-content').innerHTML = terms.map((list, i) => `<section class="sequence-term"><h3>Term ${i + 1} · ${list.reduce((n, c) => n + c.credits, 0)} credits</h3><ul>${list.map(c => `<li>${esc(c.id)} — ${esc(c.name)} (${c.credits})</li>`).join('')}</ul></section>`).join('');
        el('sequence-dialog').showModal();
    });
    el('print-plan').addEventListener('click', () => {
        filter = 'all';
        render();
        document.querySelectorAll('.requirement-group').forEach(d => d.open = true);
        window.print();
    });
    el('download-plan').addEventListener('click', () => {
        const data = {
            degree: current(),
            student: profile,
            courses: allIds(current()).map(id => ({...courses.get(id), record: record(id)})),
            notice: 'Illustrative FastTrak plan; not an official Liberty degree audit.'
        };
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${current().id}-degree-plan.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    const initialTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.dataset.theme = initialTheme;
    el('checkbox').checked = initialTheme === 'dark';
    render();
    load();
})();
