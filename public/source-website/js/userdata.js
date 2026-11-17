(function () {
  if (window.FastTrakUserData) return;

  const FILE_NAME = "userdata";
  const STORAGE_KEY = "fasttrak_userdata";
  const scriptUrl = document.currentScript?.src || new URL("js/userdata.js", location.href).href;
  const defaultFileUrl = new URL("../userdata", scriptUrl).href;
  const emptyData = () => ({ version: 1, customCourses: [], curricula: [], registrarSubmissions: [], updatedAt: null });
  let writableHandle = null;

  const text = (value, max = 120) => String(value ?? "").trim().slice(0, max);
  const skills = (value) => (Array.isArray(value) ? value : String(value || "").split(","))
    .map((skill) => text(skill, 80)).filter(Boolean).slice(0, 12);
  const courseCode = (value) => text(value, 20).toUpperCase().replace(/\s+/g, " ");
  const validCode = (value) => /^[A-Z]{2,6} \d{3}[A-Z]?$/.test(value);
  const copy = (value) => JSON.parse(JSON.stringify(value));

  function normalizeCourse(course) {
    const id = courseCode(course?.id);
    const credits = Number(course?.credits);
    if (!validCode(id) || !text(course?.name, 120) || !Number.isInteger(credits) || credits < 1 || credits > 6) return null;
    return {
      id,
      name: text(course.name, 120),
      desc: text(course.desc, 1000),
      credits,
      skills: skills(course.skills),
      careerGoal: text(course.careerGoal, 120),
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites.map(courseCode).filter(validCode).slice(0, 6) : [],
      univ: "Custom proposal",
      prof: "To be assigned",
      day: "",
      startTime: "",
      endTime: "",
      custom: true,
    };
  }

  function normalizeCurriculum(curriculum) {
    if (!curriculum?.id || !curriculum?.title) return null;
    return {
      id: text(curriculum.id, 100),
      title: text(curriculum.title, 120),
      careerGoal: text(curriculum.careerGoal, 120),
      skills: skills(curriculum.skills),
      courseIds: Array.isArray(curriculum.courseIds) ? [...new Set(curriculum.courseIds.map(courseCode).filter(validCode))].slice(0, 40) : [],
      totalCredits: Math.max(0, Math.min(240, Number(curriculum.totalCredits) || 0)),
      status: curriculum.status === "ready" ? "ready" : "draft",
      createdAt: text(curriculum.createdAt, 40),
      updatedAt: text(curriculum.updatedAt, 40),
    };
  }

  function normalizeData(input) {
    return {
      version: 1,
      customCourses: (Array.isArray(input?.customCourses) ? input.customCourses : []).map(normalizeCourse).filter(Boolean).slice(0, 100),
      curricula: (Array.isArray(input?.curricula) ? input.curricula : []).map(normalizeCurriculum).filter(Boolean).slice(0, 50),
      registrarSubmissions: (Array.isArray(input?.registrarSubmissions) ? input.registrarSubmissions : []).filter((item) => item && typeof item === "object").slice(-50),
      updatedAt: input?.updatedAt ? text(input.updatedAt, 40) : null,
    };
  }

  function readCache() {
    try { return normalizeData(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")); }
    catch { return emptyData(); }
  }

  let state = readCache();

  function mergeData(...sources) {
    const courses = new Map();
    const curricula = new Map();
    const submissions = new Map();
    for (const source of sources) {
      const normalized = normalizeData(source);
      normalized.customCourses.forEach((course) => courses.set(course.id, course));
      normalized.curricula.forEach((curriculum) => curricula.set(curriculum.id, curriculum));
      normalized.registrarSubmissions.forEach((submission) => submissions.set(submission.id || JSON.stringify(submission), submission));
    }
    return normalizeData({
      customCourses: [...courses.values()],
      curricula: [...curricula.values()],
      registrarSubmissions: [...submissions.values()],
      updatedAt: new Date().toISOString(),
    });
  }

  function applyCustomCourses() {
    if (typeof courseDatabase !== "undefined" && Array.isArray(courseDatabase)) {
      for (const customCourse of state.customCourses) {
        const index = courseDatabase.findIndex((course) => course.id === customCourse.id);
        if (index >= 0 && courseDatabase[index].custom) courseDatabase[index] = customCourse;
        else if (index < 0) courseDatabase.push(customCourse);
      }
    }
    window.dispatchEvent(new CustomEvent("fasttrak:userdata", { detail: getState() }));
  }

  function cache() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function download() {
    const blob = new Blob([JSON.stringify(state, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = FILE_NAME;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function writeConnectedFile() {
    if (!writableHandle) return false;
    const permission = await writableHandle.queryPermission?.({ mode: "readwrite" });
    if (permission === "prompt") await writableHandle.requestPermission?.({ mode: "readwrite" });
    const writable = await writableHandle.createWritable();
    await writable.write(JSON.stringify(state, null, 2) + "\n");
    await writable.close();
    return true;
  }

  async function save(options = {}) {
    state.updatedAt = new Date().toISOString();
    cache();
    applyCustomCourses();
    if (await writeConnectedFile()) return { location: "file" };
    if (options.downloadFallback !== false) download();
    return { location: "download" };
  }

  async function load() {
    try {
      const response = await fetch(defaultFileUrl, { cache: "no-store" });
      if (response.ok) {
        const fromFile = normalizeData(await response.json());
        state = mergeData(fromFile, readCache());
        cache();
        applyCustomCourses();
      }
    } catch {}
    return getState();
  }

  async function connectFolder() {
    if (!window.showDirectoryPicker) throw new Error("This browser cannot write a folder directly. Use Load userdata and the downloaded file instead.");
    const directory = await window.showDirectoryPicker({ mode: "readwrite" });
    writableHandle = await directory.getFileHandle(FILE_NAME, { create: true });
    try {
      const file = await writableHandle.getFile();
      if (file.size) state = mergeData(normalizeData(JSON.parse(await file.text())), state);
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error("The selected userdata file is not valid JSON.");
    }
    await save({ downloadFallback: false });
    return getState();
  }

  async function importFile(file) {
    if (!file || file.size > 2 * 1024 * 1024) throw new Error("Choose a userdata JSON file smaller than 2 MB.");
    const imported = normalizeData(JSON.parse(await file.text()));
    state = mergeData(imported, state);
    await save({ downloadFallback: false });
    return getState();
  }

  function validateNewCourse(course) {
    const normalized = normalizeCourse(course);
    if (!normalized) throw new Error("Use a valid course code, title, and 1–6 credits.");
    if (normalized.desc.length < 10) throw new Error("Describe the custom course in at least 10 characters.");
    if (!normalized.skills.length) throw new Error("Add at least one skill for the custom course.");
    if (!normalized.careerGoal) throw new Error("Add the career goal this course supports.");
    if (state.customCourses.some((item) => item.id === normalized.id) || (typeof courseDatabase !== "undefined" && courseDatabase.some((item) => item.id === normalized.id))) {
      throw new Error(`${normalized.id} already exists. Choose a different course code.`);
    }
    return normalized;
  }

  async function addCourse(course) {
    const normalized = validateNewCourse(course);
    state.customCourses.push(normalized);
    await save();
    return normalized;
  }

  function courseById(id) {
    if (typeof courseDatabase !== "undefined") return courseDatabase.find((course) => course.id === id);
    return state.customCourses.find((course) => course.id === id);
  }

  async function upsertCurriculum(curriculum) {
    const now = new Date().toISOString();
    const existing = state.curricula.find((item) => item.id === curriculum.id);
    const courseIds = [...new Set((curriculum.courseIds || []).map(courseCode).filter(validCode))];
    if (!text(curriculum.title, 120) || !text(curriculum.careerGoal, 120)) throw new Error("Name the curriculum and its career goal.");
    if (!skills(curriculum.skills).length) throw new Error("Add at least one career skill.");
    if (!courseIds.length) throw new Error("Add at least one catalog or custom course.");
    const totalCredits = courseIds.reduce((total, id) => {
      const course = courseById(id);
      if (!course) throw new Error(`${id} is not available in the catalog.`);
      return total + Number(course.credits || 0);
    }, 0);
    const normalized = normalizeCurriculum({
      ...curriculum,
      id: existing?.id || text(curriculum.id, 100) || `curriculum-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      courseIds,
      totalCredits,
      skills: skills(curriculum.skills),
      status: curriculum.status === "ready" ? "ready" : "draft",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    const index = state.curricula.findIndex((item) => item.id === normalized.id);
    if (index >= 0) state.curricula[index] = normalized;
    else state.curricula.push(normalized);
    await save();
    return normalized;
  }

  async function recordSubmission(submission) {
    state.registrarSubmissions.push({
      ...submission,
      id: `submission-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      recipient: "example@liberty.edu",
      createdAt: new Date().toISOString(),
    });
    state.registrarSubmissions = state.registrarSubmissions.slice(-50);
    await save();
  }

  function getState() { return copy(state); }
  function getCurriculum(id) { return state.curricula.find((item) => item.id === id) || null; }

  applyCustomCourses();
  const ready = load();

  window.FastTrakUserData = {
    FILE_NAME,
    ready,
    getState,
    getCurriculum,
    getCourseById: courseById,
    addCourse,
    upsertCurriculum,
    recordSubmission,
    connectFolder,
    importFile,
    download: () => download(),
    reload: load,
  };
})();
