(function () {
  if (window.__fasttrakAssistant) return;
  window.__fasttrakAssistant = true;

  const css = `
  .assistant-btn{margin-left:auto;margin-right:12px}
  .assistant-dialog{border:1px solid var(--plan-line,#c6cbd4);border-radius:14px;padding:0;width:min(760px,96vw);max-height:92vh;background:var(--plan-surface,#fff);color:var(--plan-text,#23262d);box-shadow:0 20px 50px #0004}
  .assistant-dialog::backdrop,.registrar-dialog::backdrop,.course-research-dialog::backdrop{background:var(--plan-overlay,#0009)}
  .assistant-inner{display:flex;flex-direction:column;height:min(720px,88vh)}
  .assistant-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--plan-line,#c6cbd4);font-weight:700}
  .assistant-close{background:none;border:none;font-size:20px;cursor:pointer;color:inherit}
  .assistant-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.45;min-height:100px}
  .assistant-msg{padding:9px 12px;border-radius:10px;max-width:88%;white-space:pre-wrap;word-wrap:break-word}
  .assistant-msg.user{align-self:flex-end;background:var(--plan-blue,#096bdc);color:var(--plan-on-accent,#fff)}
  .assistant-msg.assistant{align-self:flex-start;background:var(--plan-band,#e9edf3)}
  .assistant-quick{display:flex;gap:7px;flex-wrap:wrap;padding:9px 12px 0;border-top:1px solid var(--plan-line,#c6cbd4)}
  .assistant-quick .btn{padding:7px 10px;font-size:12px}
  .userdata-status{width:100%;margin:0;color:var(--plan-muted,#667081);font-size:11px}
  .assistant-form{padding:10px 12px;border-top:1px solid var(--plan-line,#c6cbd4)}
  .assistant-input-row{display:flex;gap:8px}
  .assistant-form textarea{flex:1;resize:none;padding:9px;border-radius:8px;border:1px solid var(--plan-line,#c6cbd4);background:var(--plan-bg,#f3f5f8);color:inherit;font:inherit}
  .assistant-form button{padding:9px 14px}
  .registrar-submit{width:100%;margin-bottom:8px;background:var(--plan-green,#138c49);color:var(--plan-on-accent,#fff)}
  .registrar-target{display:block;font-size:11px;margin-bottom:8px;color:var(--plan-muted,#667081)}
  .curriculum-builder{overflow-y:auto;padding:14px 16px;border-top:1px solid var(--plan-line,#c6cbd4);background:var(--plan-bg,#f3f5f8);max-height:480px}
  .builder-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
  .builder-heading h2{margin:0;font-size:17px}
  .builder-steps{color:var(--plan-muted,#667081);font-size:12px;margin:0 0 12px}
  .builder-slider{overflow:hidden}
  .builder-step-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:12px}
  .builder-step-button{border:1px solid var(--plan-line,#c6cbd4);border-radius:7px;background:var(--plan-surface,#fff);color:var(--plan-muted,#667081);padding:8px;text-align:left;font-size:11px;line-height:1.3}
  .builder-step-button strong{display:block;color:var(--plan-text,#23262d);font-size:12px}
  .builder-step-button[aria-current="step"]{border-color:var(--plan-blue,#096bdc);box-shadow:inset 0 -3px var(--plan-blue,#096bdc)}
  .builder-step-button:disabled{opacity:.48;cursor:not-allowed}
  .builder-viewport{overflow:hidden}
  .builder-track{display:flex;align-items:flex-start;transition:transform .25s ease}
  .builder-page{min-width:100%;padding:1px}
  .builder-card{background:var(--plan-surface,#fff);border:1px solid var(--plan-line,#c6cbd4);border-radius:9px;padding:14px}
  .builder-card label,.registrar-dialog label{display:block;font-size:12px;font-weight:600;margin:10px 0 5px}
  .builder-card input,.builder-card textarea,.builder-card select,.registrar-dialog input,.registrar-dialog textarea,.registrar-dialog select{width:100%;padding:9px;border:1px solid var(--plan-line,#c6cbd4);border-radius:6px;background:var(--plan-bg,#f3f5f8);color:inherit;font:inherit}
  .builder-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .builder-actions .btn{padding:8px 12px}
  .skill-suggestions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
  .course-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;max-height:220px;overflow:auto;margin-top:10px}
  .course-choice{display:block;border:1px solid var(--plan-line,#c6cbd4);border-radius:7px;padding:9px;background:var(--plan-bg,#f3f5f8);font-size:12px}
  .course-choice input{width:auto;margin-right:7px}
  .course-choice strong{display:block;margin-left:22px}
  .custom-course-form{border-top:1px solid var(--plan-line,#c6cbd4);margin-top:14px;padding-top:6px}
  .builder-status,.registrar-status{font-size:12px;color:var(--plan-muted,#667081);margin:10px 0 0;white-space:pre-wrap}
  .review-list{padding-left:20px;font-size:13px;line-height:1.6}
  .registrar-dialog{border:1px solid var(--plan-line,#c6cbd4);border-radius:12px;padding:0;width:min(600px,94vw);max-height:90vh;background:var(--plan-surface,#fff);color:var(--plan-text,#23262d)}
  .registrar-inner{padding:20px;overflow-y:auto;max-height:88vh}
  .registrar-inner h2{margin:0;font-size:20px}
  .registrar-summary{padding:10px;background:var(--plan-band,#e9edf3);border-radius:7px;font-size:12px;white-space:pre-wrap}
  .registrar-consent{display:flex!important;gap:8px;align-items:flex-start;font-weight:400!important;line-height:1.4}
  .registrar-consent input{width:auto;margin-top:3px}
  .registrar-address{border:1px solid var(--plan-line,#c6cbd4);border-radius:7px;margin:14px 0;padding:4px 12px 12px}
  .registrar-address legend{font-size:13px;font-weight:700;padding:0 5px}
  .address-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}
  .research-reply{padding:10px;background:var(--plan-band,#e9edf3);border-radius:7px;white-space:pre-wrap;line-height:1.5}
  .research-sources{margin:10px 0;padding-left:20px;font-size:12px;line-height:1.6}
  @media(max-width:600px){.assistant-inner{height:90vh}.assistant-dialog{max-height:96vh}.curriculum-builder{max-height:55vh}.assistant-quick{overflow-x:auto;flex-wrap:nowrap}.userdata-status{display:none}.assistant-btn{margin-right:4px}.builder-step-button{padding:6px 4px;text-align:center}.builder-step-button span{display:none}.address-grid{grid-template-columns:1fr}}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const topbar = document.querySelector(".plan-topbar");
  if (!topbar || !window.FastTrakUserData) return;
  const store = window.FastTrakUserData;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-subtle assistant-btn";
  btn.textContent = "✦ Ask AI";
  btn.setAttribute("aria-haspopup", "dialog");
  const actions = topbar.querySelector(".account-actions");
  actions ? topbar.insertBefore(btn, actions) : topbar.appendChild(btn);

  const dlg = document.createElement("dialog");
  dlg.className = "assistant-dialog";
  dlg.setAttribute("aria-label", "FastTrak AI assistant");
  dlg.innerHTML = `<div class="assistant-inner">
    <div class="assistant-head"><span>FastTrak Assistant</span><span><button type="button" class="assistant-clear btn btn-subtle" style="padding:3px 8px;font-size:12px">Clear chat</button> <button type="button" class="assistant-close" aria-label="Close">×</button></span></div>
    <div class="assistant-log" aria-live="polite"></div>
    <div class="assistant-quick">
      <button type="button" class="btn btn-primary builder-open">Build custom curriculum</button>
      <button type="button" class="btn btn-subtle course-research-open">Build custom course</button>
    </div>
    <section class="curriculum-builder" hidden aria-label="Custom curriculum builder"></section>
    <form class="assistant-form">
      <button type="button" class="btn registrar-submit" hidden>Submit course suggestion to registrar</button>
      <span class="registrar-target" hidden></span>
      <div class="assistant-input-row"><textarea rows="2" placeholder="Ask about courses, prerequisites, your plan…" aria-label="Message" maxlength="4000"></textarea><button class="btn btn-primary assistant-send" type="submit">Send</button></div>
    </form>
  </div>`;
  document.body.appendChild(dlg);

  const registrarDlg = document.createElement("dialog");
  registrarDlg.className = "registrar-dialog";
  registrarDlg.setAttribute("aria-label", "Submit curriculum to registrar");
  registrarDlg.innerHTML = `<div class="registrar-inner">
    <div class="builder-heading"><h2>Registrar course suggestion</h2><button type="button" class="assistant-close registrar-close" aria-label="Close registrar form">×</button></div>
    <p>Provide your information and justify why this curriculum should be accepted. Required fields must be completed before submission.</p>
    <div class="registrar-summary"></div>
    <form id="registrar-form">
      <label for="registrar-name">Full name</label><input id="registrar-name" name="fullName" autocomplete="name" required minlength="2" maxlength="120">
      <label for="registrar-email">Email</label><input id="registrar-email" name="email" type="email" autocomplete="email" required maxlength="255">
      <label for="registrar-student-id">Student ID</label><input id="registrar-student-id" name="studentId" required minlength="2" maxlength="30" pattern="[A-Za-z0-9-]+" autocomplete="off">
      <label for="registrar-campus">Campus</label><select id="registrar-campus" name="campus" required><option>Residential</option><option>Online</option></select>
      <label for="registrar-essay">Why should this curriculum be accepted?</label><textarea id="registrar-essay" name="essay" rows="7" required minlength="100" maxlength="5000" placeholder="Explain the career goal, skills, course choices, and academic value (at least 100 characters)."></textarea>
      <label class="registrar-consent"><input type="checkbox" name="consent" required> I confirm this is my proposal and understand it is a suggestion, not an approved course or degree plan.</label>
      <p class="registrar-status" role="status"></p>
      <div class="builder-actions"><button type="submit" class="btn btn-primary registrar-send">Submit suggestion</button><button type="button" class="btn btn-subtle registrar-cancel">Cancel</button></div>
    </form>
  </div>`;
  document.body.appendChild(registrarDlg);

  const dataPanel = document.createElement("section");
  dataPanel.className = "assistant-quick userdata-panel";
  dataPanel.setAttribute("aria-label", "Your saved userdata");
  dataPanel.innerHTML = `<h3 style="width:100%;margin:8px 0 2px;font-size:14px">Your userdata</h3>
      <button type="button" class="btn btn-subtle userdata-load">Load userdata</button>
      <button type="button" class="btn btn-subtle userdata-connect">Choose userdata folder</button>
      <button type="button" class="btn btn-subtle userdata-download">Download userdata</button>
      <p class="userdata-status" role="status">Loading userdata…</p>`;
  const authDialog = document.getElementById("auth-dialog");
  if (authDialog) {
    (authDialog.querySelector("form") || authDialog).appendChild(dataPanel);
  } else {
    const accountDlg = document.createElement("dialog");
    accountDlg.className = "assistant-dialog account-dialog";
    accountDlg.setAttribute("aria-label", "Account and userdata");
    accountDlg.innerHTML = `<div class="assistant-inner" style="height:auto"><div class="assistant-head"><span>Account</span><button type="button" class="assistant-close" aria-label="Close">×</button></div><p style="margin:12px 16px 0">Sign in is available on the Degree Completion Plan page. Manage your saved userdata here.</p></div>`;
    accountDlg.querySelector(".assistant-inner").appendChild(dataPanel);
    accountDlg.querySelector(".assistant-close").addEventListener("click", () => accountDlg.close());
    document.body.appendChild(accountDlg);
    document.getElementById("account-btn")?.addEventListener("click", () => accountDlg.showModal());
  }

  const log = dlg.querySelector(".assistant-log");
  const form = dlg.querySelector(".assistant-form");
  const input = dlg.querySelector("textarea");
  const sendBtn = dlg.querySelector(".assistant-send");
  const builder = dlg.querySelector(".curriculum-builder");
  const registrarButton = dlg.querySelector(".registrar-submit");
  const registrarTarget = dlg.querySelector(".registrar-target");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/json,.json";
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  const HISTORY_KEY = "fasttrak_chat_history";
  const ACTIVE_KEY = "fasttrak_active_curriculum";
  let history = [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
    if (Array.isArray(saved)) history = saved.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-30);
  } catch {}
  const saveHistory = () => { try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-30))); } catch {} };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function md(value) {
    return esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/^#{1,6}\s*(.+)$/gm, "<strong>$1</strong>").replace(/^\s*[-*]\s+/gm, "• ");
  }
  function add(role, text) {
    const message = document.createElement("div");
    message.className = "assistant-msg " + role;
    message.innerHTML = role === "assistant" ? md(text) : esc(text);
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
    return message;
  }
  const GREETING = "Would you like help with 1. Information regarding a specific course, 2. Deciding a course order, 3. Making a custom curriculum, or 4. Something else?";
  function renderAll() {
    log.innerHTML = "";
    add("assistant", GREETING);
    history.forEach((message) => add(message.role, message.content));
  }

  function studentContext() {
    let enrolled = [];
    try { enrolled = JSON.parse(localStorage.getItem("enrolled_courses") || "[]"); } catch {}
    const data = store.getState();
    const parts = [];
    if (Array.isArray(enrolled) && enrolled.length) parts.push("Calendar courses: " + enrolled.slice(0, 30).map((c) => [c.code || c.id, c.title || c.name].filter(Boolean).join(" ")).join("; "));
    if (data.curricula.length) parts.push("Custom curricula: " + data.curricula.slice(-5).map((c) => `${c.title} for ${c.careerGoal}; skills ${c.skills.join(", ")}; courses ${c.courseIds.join(", ")}; ${c.status}`).join(" | "));
    return parts.join("\n").slice(0, 2000);
  }

  function requestParent(type, payload, responseType, timeoutMs = 120000) {
    return new Promise((resolve, reject) => {
      if (window.parent === window) {
        reject(new Error("Open the assistant through the FastTrak app."));
        return;
      }
      const requestId = crypto.randomUUID();
      function receive(event) {
        if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== responseType || event.data.requestId !== requestId) return;
        cleanup();
        if (event.data.error) reject(new Error(event.data.error));
        else if (type === "browser-assistant-request" && typeof event.data.reply === "string") resolve(event.data.reply);
        else if (type === "registrar-submission-request" && event.data.result) resolve(event.data.result);
        else reject(new Error("The app returned an invalid response."));
      }
      function cleanup() { clearTimeout(timer); window.removeEventListener("message", receive); }
      const timer = setTimeout(() => { cleanup(); reject(new Error("The request took too long. Please try again.")); }, timeoutMs);
      window.addEventListener("message", receive);
      window.parent.postMessage({ type, requestId, ...payload }, window.location.origin);
    });
  }

  let builderStep = 0;
  let showCustomForm = false;
  let draft = freshDraft();
  function freshDraft() { return { title: "", careerGoal: "", skills: [], courseIds: [], status: "draft" }; }
  function activeCurriculum() {
    const id = localStorage.getItem(ACTIVE_KEY) || "";
    return store.getCurriculum(id);
  }
  function updateRegistrarButton() {
    const data = store.getState();
    let curriculum = activeCurriculum();
    if (!curriculum || curriculum.status !== "ready") {
      curriculum = [...data.curricula].reverse().find((item) => item.status === "ready") || null;
      if (curriculum) localStorage.setItem(ACTIVE_KEY, curriculum.id);
    }
    registrarButton.hidden = !curriculum;
    registrarTarget.hidden = !curriculum;
    if (curriculum) registrarTarget.textContent = `Ready: ${curriculum.title} · ${curriculum.totalCredits} credits · Recipient: example@liberty.edu`;
  }
  function setBuilderStatus(message) {
    const status = builder.querySelector(".builder-status");
    if (status) status.textContent = message;
  }
  function openBuilder(curriculum) {
    draft = curriculum ? JSON.parse(JSON.stringify(curriculum)) : freshDraft();
    builderStep = curriculum ? 3 : 0;
    showCustomForm = false;
    builder.hidden = false;
    renderBuilder();
    builder.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function closeBuilder() { builder.hidden = true; }

  function skillSuggestions() {
    const goal = draft.careerGoal.toLowerCase();
    if (/cyber|security|software|data|computer|technology/.test(goal)) return ["Programming", "Data analysis", "Information security", "Systems thinking"];
    if (/nurs|health|medical/.test(goal)) return ["Patient care", "Clinical reasoning", "Communication", "Evidence-based practice"];
    if (/business|market|manage|account/.test(goal)) return ["Financial analysis", "Leadership", "Communication", "Project management"];
    if (/teach|education/.test(goal)) return ["Lesson design", "Assessment", "Communication", "Classroom leadership"];
    return ["Research", "Communication", "Problem solving", "Project management"];
  }
  function recommendedCourses() {
    const terms = `${draft.careerGoal} ${draft.skills.join(" ")}`.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
    return courseDatabase.map((course) => {
      const haystack = `${course.id} ${course.name} ${course.desc} ${(course.skills || []).join(" ")}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0) + (draft.courseIds.includes(course.id) ? 100 : 0);
      return { course, score };
    }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score || a.course.id.localeCompare(b.course.id)).slice(0, 12).map((entry) => entry.course);
  }

  function renderBuilder() {
    const headings = ["Career goal", "Career skills", "Courses", "Review and approval"];
    builder.innerHTML = `<div class="builder-heading"><h2>Custom curriculum</h2><button type="button" class="assistant-close builder-close" aria-label="Close curriculum builder">×</button></div>
      <p class="builder-steps">Step ${builderStep + 1} of 4 · ${headings[builderStep]}</p><div class="builder-card"></div><p class="builder-status" role="status"></p>`;
    builder.querySelector(".builder-close").addEventListener("click", closeBuilder);
    const card = builder.querySelector(".builder-card");

    if (builderStep === 0) {
      const saved = store.getState().curricula;
      card.innerHTML = `${saved.length ? `<label for="saved-curriculum">Continue a saved curriculum</label><select id="saved-curriculum"><option value="">Choose saved work…</option>${saved.map((c) => `<option value="${esc(c.id)}">${esc(c.title)} (${esc(c.status)})</option>`).join("")}</select><div class="builder-actions"><button type="button" class="btn btn-subtle load-curriculum">Load selected</button></div>` : ""}
        <label for="career-goal">What career are you preparing for?</label><input id="career-goal" required minlength="2" maxlength="120" value="${esc(draft.careerGoal)}" placeholder="For example, cybersecurity analyst">
        <p>Next, you will identify useful skills, choose matching catalog courses, and add custom courses where the catalog has gaps.</p>
        <div class="builder-actions"><button type="button" class="btn btn-primary career-next">Continue to skills</button></div>`;
      card.querySelector(".load-curriculum")?.addEventListener("click", () => {
        const selected = store.getCurriculum(card.querySelector("#saved-curriculum").value);
        if (!selected) { setBuilderStatus("Choose a saved curriculum first."); return; }
        localStorage.setItem(ACTIVE_KEY, selected.id);
        openBuilder(selected);
        updateRegistrarButton();
      });
      card.querySelector(".career-next").addEventListener("click", () => {
        const goal = card.querySelector("#career-goal").value.trim();
        if (goal.length < 2) { setBuilderStatus("Enter a career goal to continue."); return; }
        draft.careerGoal = goal;
        if (!draft.title) draft.title = `${goal} Curriculum`;
        builderStep = 1;
        renderBuilder();
      });
    } else if (builderStep === 1) {
      card.innerHTML = `<label for="career-skills">Which skills should this curriculum develop?</label><input id="career-skills" value="${esc(draft.skills.join(", "))}" placeholder="Separate skills with commas">
        <p>Suggestions for ${esc(draft.careerGoal)}:</p><div class="skill-suggestions">${skillSuggestions().map((skill) => `<button type="button" class="btn btn-subtle skill-chip" data-skill="${esc(skill)}">+ ${esc(skill)}</button>`).join("")}</div>
        <div class="builder-actions"><button type="button" class="btn btn-subtle back">Back</button><button type="button" class="btn btn-primary skills-next">Find relevant courses</button></div>`;
      card.querySelectorAll(".skill-chip").forEach((chip) => chip.addEventListener("click", () => {
        const field = card.querySelector("#career-skills");
        const values = field.value.split(",").map((value) => value.trim()).filter(Boolean);
        if (!values.includes(chip.dataset.skill)) values.push(chip.dataset.skill);
        field.value = values.join(", ");
      }));
      card.querySelector(".back").addEventListener("click", () => { builderStep = 0; renderBuilder(); });
      card.querySelector(".skills-next").addEventListener("click", () => {
        const values = card.querySelector("#career-skills").value.split(",").map((value) => value.trim()).filter(Boolean);
        if (!values.length) { setBuilderStatus("Add at least one skill to continue."); return; }
        draft.skills = values.slice(0, 12);
        builderStep = 2;
        renderBuilder();
      });
    } else if (builderStep === 2) {
      const recommendations = recommendedCourses();
      card.innerHTML = `<p>Select existing courses related to <strong>${esc(draft.careerGoal)}</strong>. Selected: <strong>${draft.courseIds.length}</strong></p>
        <div class="course-choices">${recommendations.length ? recommendations.map((course) => `<label class="course-choice"><input type="checkbox" value="${esc(course.id)}" ${draft.courseIds.includes(course.id) ? "checked" : ""}> ${esc(course.id)} · ${course.credits} credits<strong>${esc(course.name)}</strong></label>`).join("") : "<p>No close catalog matches. Add a custom course below or change your skills.</p>"}</div>
        <div class="builder-actions"><button type="button" class="btn btn-subtle back">Back</button><button type="button" class="btn btn-subtle toggle-custom">Add a custom course</button><button type="button" class="btn btn-primary courses-next" ${draft.courseIds.length ? "" : "disabled"}>Review curriculum</button></div>
        <form class="custom-course-form" ${showCustomForm ? "" : "hidden"}>
          <label for="custom-code">Custom course code</label><input id="custom-code" name="id" required pattern="[A-Za-z]{2,6} [0-9]{3}[A-Za-z]?" placeholder="CSIS 490" maxlength="20">
          <label for="custom-name">Course title</label><input id="custom-name" name="name" required minlength="2" maxlength="120">
          <label for="custom-credits">Credits (1–6)</label><input id="custom-credits" name="credits" type="number" required min="1" max="6" step="1" value="3">
          <label for="custom-description">Course description and learning outcomes</label><textarea id="custom-description" name="desc" required minlength="10" maxlength="1000" rows="3"></textarea>
          <label for="custom-skills">Skills taught (comma separated)</label><input id="custom-skills" name="skills" required value="${esc(draft.skills.join(", "))}">
          <div class="builder-actions"><button type="submit" class="btn btn-primary save-custom-course">Save custom course to userdata</button></div>
        </form>`;
      card.querySelectorAll(".course-choice input").forEach((checkbox) => checkbox.addEventListener("change", () => {
        draft.courseIds = [...card.querySelectorAll(".course-choice input:checked")].map((input) => input.value);
        renderBuilder();
      }));
      card.querySelector(".back").addEventListener("click", () => { builderStep = 1; renderBuilder(); });
      card.querySelector(".toggle-custom").addEventListener("click", () => { showCustomForm = !showCustomForm; renderBuilder(); });
      card.querySelector(".courses-next").addEventListener("click", () => { builderStep = 3; renderBuilder(); });
      card.querySelector(".custom-course-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const customForm = event.currentTarget;
        if (!customForm.reportValidity()) return;
        const values = new FormData(customForm);
        const submit = customForm.querySelector(".save-custom-course");
        submit.disabled = true;
        try {
          const course = await store.addCourse({
            id: values.get("id"), name: values.get("name"), credits: Number(values.get("credits")),
            desc: values.get("desc"), skills: values.get("skills"), careerGoal: draft.careerGoal, prerequisites: [],
          });
          if (!draft.courseIds.includes(course.id)) draft.courseIds.push(course.id);
          showCustomForm = false;
          renderBuilder();
          setBuilderStatus(`${course.id} was added to userdata and Course Search.`);
        } catch (error) {
          setBuilderStatus(error.message || "The custom course could not be saved.");
          submit.disabled = false;
        }
      });
    } else {
      const courses = draft.courseIds.map((id) => store.getCourseById(id)).filter(Boolean);
      const credits = courses.reduce((total, course) => total + Number(course.credits || 0), 0);
      card.innerHTML = `<label for="curriculum-title">Curriculum title</label><input id="curriculum-title" value="${esc(draft.title)}" required minlength="2" maxlength="120">
        <p><strong>Career:</strong> ${esc(draft.careerGoal)}<br><strong>Skills:</strong> ${esc(draft.skills.join(", "))}<br><strong>Total:</strong> ${credits} credits</p>
        <ul class="review-list">${courses.map((course) => `<li>${esc(course.id)} — ${esc(course.name)} (${course.credits} credits)${course.custom ? " · Custom proposal" : ""}</li>`).join("")}</ul>
        <p>This is an illustrative proposal, not an approved Liberty course or degree audit. Mark it ready only when you intend to send it for official review.</p>
        <div class="builder-actions"><button type="button" class="btn btn-subtle back">Back</button><button type="button" class="btn btn-subtle save-draft">Save draft to userdata</button><button type="button" class="btn btn-primary mark-ready">Mark ready &amp; save</button></div>`;
      card.querySelector(".back").addEventListener("click", () => { builderStep = 2; renderBuilder(); });
      const save = async (status) => {
        draft.title = card.querySelector("#curriculum-title").value.trim();
        draft.status = status;
        try {
          const saved = await store.upsertCurriculum(draft);
          draft = JSON.parse(JSON.stringify(saved));
          localStorage.setItem(ACTIVE_KEY, saved.id);
          updateRegistrarButton();
          renderBuilder();
          setBuilderStatus(status === "ready" ? `${saved.title} is ready. Use the registrar button below the chat input.` : `${saved.title} was saved as a draft in userdata.`);
        } catch (error) { setBuilderStatus(error.message || "The curriculum could not be saved."); }
      };
      card.querySelector(".save-draft").addEventListener("click", () => save("draft"));
      card.querySelector(".mark-ready").addEventListener("click", () => save("ready"));
    }
  }

  function openRegistrar() {
    const curriculum = activeCurriculum();
    if (!curriculum || curriculum.status !== "ready") { updateRegistrarButton(); return; }
    const courses = curriculum.courseIds.map((id) => store.getCourseById(id)).filter(Boolean);
    registrarDlg.querySelector(".registrar-summary").textContent = `${curriculum.title}\nCareer: ${curriculum.careerGoal}\n${curriculum.totalCredits} credits\n${courses.map((course) => `${course.id} — ${course.name}`).join("\n")}`;
    registrarDlg.querySelector(".registrar-status").textContent = "";
    registrarDlg.showModal();
  }

  dlg.querySelector(".registrar-form");
  registrarDlg.querySelector(".registrar-close").addEventListener("click", () => registrarDlg.close());
  registrarDlg.querySelector(".registrar-cancel").addEventListener("click", () => registrarDlg.close());
  registrarButton.addEventListener("click", openRegistrar);
  registrarDlg.querySelector("#registrar-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const registrarForm = event.currentTarget;
    if (!registrarForm.reportValidity()) return;
    const curriculum = activeCurriculum();
    if (!curriculum || curriculum.status !== "ready") { registrarDlg.querySelector(".registrar-status").textContent = "Mark a curriculum ready before submitting."; return; }
    const values = new FormData(registrarForm);
    const essay = String(values.get("essay") || "").trim();
    if (essay.length < 100) { registrarDlg.querySelector(".registrar-status").textContent = "The justification essay must be at least 100 characters."; return; }
    const submit = registrarForm.querySelector(".registrar-send");
    submit.disabled = true;
    registrarDlg.querySelector(".registrar-status").textContent = "Validating submission…";
    try {
      const result = await requestParent("registrar-submission-request", {
        payload: {
          fullName: values.get("fullName"), email: values.get("email"), studentId: values.get("studentId"),
          campus: values.get("campus"), essay, curriculum,
          customCourses: store.getState().customCourses.filter((course) => curriculum.courseIds.includes(course.id)),
        },
      }, "registrar-submission-response");
      await store.recordSubmission({
        fullName: values.get("fullName"), email: values.get("email"), studentId: values.get("studentId"),
        campus: values.get("campus"), essay, curriculumId: curriculum.id,
        deliveryStatus: result.delivered ? "sent" : "pending-email-setup",
      });
      registrarDlg.querySelector(".registrar-status").textContent = result.delivered
        ? `Submitted to ${result.recipient}. A copy was saved in userdata.`
        : "Saved in userdata. No email was sent because registrar email delivery has not been configured for this app.";
      if (result.delivered) registrarForm.reset();
    } catch (error) {
      registrarDlg.querySelector(".registrar-status").textContent = error.message || "The submission could not be completed.";
    } finally { submit.disabled = false; }
  });

  dlg.querySelector(".builder-open").addEventListener("click", () => openBuilder());
  dataPanel.querySelector(".userdata-load").addEventListener("click", () => fileInput.click());
  dataPanel.querySelector(".userdata-download").addEventListener("click", () => store.download());
  dataPanel.querySelector(".userdata-connect").addEventListener("click", async () => {
    const status = dataPanel.querySelector(".userdata-status");
    status.textContent = "Choose the site folder containing index.html; FastTrak will read and write its userdata file.";
    try { await store.connectFolder(); status.textContent = "Connected to the userdata file in your chosen folder."; updateRegistrarButton(); }
    catch (error) { if (error.name !== "AbortError") status.textContent = error.message || "The userdata folder could not be connected."; }
  });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try { await store.importFile(file); dataPanel.querySelector(".userdata-status").textContent = "userdata loaded. Custom courses are now available."; updateRegistrarButton(); }
    catch (error) { dataPanel.querySelector(".userdata-status").textContent = error.message || "userdata could not be loaded."; }
    fileInput.value = "";
  });

  dlg.querySelector(".assistant-clear").addEventListener("click", () => { history = []; saveHistory(); renderAll(); });
  btn.addEventListener("click", () => { updateRegistrarButton(); dlg.showModal(); input.focus(); });
  dlg.querySelector(".assistant-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (event) => { if (event.target === dlg) dlg.close(); });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value || sendBtn.disabled) return;
    input.value = "";
    add("user", value);
    history.push({ role: "user", content: value });
    saveHistory();
    if (/^(3|3\.|make (a )?custom curriculum|build (a )?custom curriculum|custom curriculum)$/i.test(value)) {
      const reply = "Use the guided builder below to choose a career goal, skills, catalog courses, and custom courses. Your work is saved in userdata.";
      add("assistant", reply);
      history.push({ role: "assistant", content: reply });
      saveHistory();
      openBuilder();
      return;
    }
    sendBtn.disabled = true;
    const pending = add("assistant", "Thinking…");
    try {
      const reply = await requestParent("browser-assistant-request", { messages: history.slice(-30), context: studentContext() }, "browser-assistant-response");
      pending.innerHTML = md(reply);
      history.push({ role: "assistant", content: reply });
      saveHistory();
    } catch (error) {
      pending.textContent = error.message || "Something went wrong.";
      history.pop();
      saveHistory();
    } finally { sendBtn.disabled = false; input.focus(); }
  });

  renderAll();
  store.ready.then(() => {
    dataPanel.querySelector(".userdata-status").textContent = "userdata loaded. New work downloads an updated file unless you connect a folder.";
    updateRegistrarButton();
  });
})();
