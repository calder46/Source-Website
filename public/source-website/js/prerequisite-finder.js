export const DATA_STORAGE_KEY = "fasttrak-prerequisite-transfer-data";

export const VERIFICATION_STATUSES = [
  "verified-liberty-guide",
  "official-needs-confirmation",
  "unverified-suggestion",
];

export const STATUS_LABELS = {
  "verified-liberty-guide": "Verified in official Liberty guide",
  "official-needs-confirmation":
    "Imported from an official source — current confirmation needed",
  "unverified-suggestion": "Suggested alternative — not verified or approved",
};

const EMPTY_DATA = {
  courses: [],
  prerequisiteRules: [],
  sendingInstitutions: [],
  transferEquivalencies: [],
};

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

const isValidUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

const isLibertyUrl = (value) => {
  if (!isValidUrl(value)) return false;
  const hostname = new URL(value).hostname.toLowerCase();
  return hostname === "liberty.edu" || hostname.endsWith(".liberty.edu");
};

const addError = (errors, message) => errors.push(message);

function validateRecordSource(record, label, errors) {
  for (const field of ["sourceInstitution", "sourceUrl", "importedAt"]) {
    if (!isNonEmptyString(record[field])) {
      addError(errors, `${label}: ${field} is required.`);
    }
  }
  if (isNonEmptyString(record.sourceUrl) && !isValidUrl(record.sourceUrl)) {
    addError(errors, `${label}: sourceUrl must be an HTTPS URL.`);
  }
  if (isNonEmptyString(record.importedAt) && !isValidDate(record.importedAt)) {
    addError(errors, `${label}: importedAt must use YYYY-MM-DD.`);
  }
  if (!VERIFICATION_STATUSES.includes(record.verificationStatus)) {
    addError(
      errors,
      `${label}: verificationStatus must be one of ${VERIFICATION_STATUSES.join(", ")}.`,
    );
  }
  if (
    record.verificationStatus === "verified-liberty-guide" &&
    !isLibertyUrl(record.sourceUrl)
  ) {
    addError(errors, `${label}: verified Liberty records need a Liberty source URL.`);
  }
}

function ensureUnique(records, key, label, errors) {
  const seen = new Set();
  for (const record of records) {
    if (!isRecord(record)) continue;
    const value = record[key];
    if (!isNonEmptyString(value)) continue;
    if (seen.has(value)) addError(errors, `Duplicate ${label}: ${value}.`);
    seen.add(value);
  }
}

export function validateImportData(input) {
  const errors = [];
  if (!isRecord(input)) {
    return { valid: false, errors: ["The JSON root must be an object."] };
  }

  for (const key of Object.keys(EMPTY_DATA)) {
    if (!Array.isArray(input[key])) {
      addError(errors, `${key} must be an array.`);
    }
  }
  if (errors.length) return { valid: false, errors };

  const { courses, prerequisiteRules, sendingInstitutions, transferEquivalencies } =
    input;
  if (courses.length > 10000 || prerequisiteRules.length > 30000) {
    addError(errors, "Import is too large (maximum 10,000 courses and 30,000 prerequisite rules).");
  }

  for (const [label, rows] of Object.entries({
    courses,
    prerequisiteRules,
    sendingInstitutions,
    transferEquivalencies,
  })) {
    for (const [index, row] of rows.entries()) {
      if (!isRecord(row)) {
        addError(errors, `${label}[${index}] must be an object.`);
        continue;
      }
      if (!isNonEmptyString(row.id)) {
        addError(errors, `${label}[${index}]: id is required.`);
      }
      validateRecordSource(row, `${label}[${index}]`, errors);
    }
    ensureUnique(rows, "id", `${label} id`, errors);
  }

  const coursesById = new Map();
  const coursesByCode = new Set();
  for (const [index, course] of courses.entries()) {
    if (!isRecord(course)) continue;
    for (const field of [
      "courseCode",
      "title",
      "description",
      "department",
      "catalogYear",
    ]) {
      if (!isNonEmptyString(course[field])) {
        addError(errors, `courses[${index}]: ${field} is required.`);
      }
    }
    if (!isValidUrl(course.catalogUrl)) {
      addError(errors, `courses[${index}]: catalogUrl must be an HTTPS URL.`);
    }
    if (
      typeof course.creditHours !== "number" ||
      !Number.isFinite(course.creditHours) ||
      course.creditHours <= 0 ||
      course.creditHours > 30
    ) {
      addError(errors, `courses[${index}]: creditHours must be greater than 0 and no more than 30.`);
    }
    if (
      course.lastVerifiedDate !== undefined &&
      !isValidDate(course.lastVerifiedDate)
    ) {
      addError(errors, `courses[${index}]: lastVerifiedDate must use YYYY-MM-DD.`);
    }
    if (!["documented", "unavailable"].includes(course.prerequisitesStatus)) {
      addError(errors, `courses[${index}]: prerequisitesStatus must be documented or unavailable.`);
    }
    if (isNonEmptyString(course.id)) coursesById.set(course.id, course);
    if (isNonEmptyString(course.courseCode)) {
      const code = course.courseCode.trim().toUpperCase();
      if (coursesByCode.has(code)) addError(errors, `Duplicate course code: ${course.courseCode}.`);
      coursesByCode.add(code);
    }
  }

  const institutionsById = new Map();
  for (const [index, institution] of sendingInstitutions.entries()) {
    if (!isRecord(institution)) continue;
    if (!isNonEmptyString(institution.name)) {
      addError(errors, `sendingInstitutions[${index}]: name is required.`);
    }
    if (!isValidUrl(institution.websiteUrl)) {
      addError(errors, `sendingInstitutions[${index}]: websiteUrl must be an HTTPS URL.`);
    }
    if (isNonEmptyString(institution.id)) {
      institutionsById.set(institution.id, institution);
    }
  }

  const rulesByCourse = new Map();
  const groupTypes = new Map();
  const prerequisiteKeys = new Set();
  for (const [index, rule] of prerequisiteRules.entries()) {
    if (!isRecord(rule)) continue;
    for (const field of [
      "courseId",
      "prerequisiteCourseId",
      "ruleGroupId",
    ]) {
      if (!isNonEmptyString(rule[field])) {
        addError(errors, `prerequisiteRules[${index}]: ${field} is required.`);
      }
    }
    if (!["AND", "OR"].includes(rule.relationshipType)) {
      addError(errors, `prerequisiteRules[${index}]: relationshipType must be AND or OR.`);
    }
    if (
      rule.minimumGrade !== undefined &&
      !isNonEmptyString(rule.minimumGrade)
    ) {
      addError(errors, `prerequisiteRules[${index}]: minimumGrade must be a non-empty string when provided.`);
    }
    if (
      rule.lastVerifiedDate !== undefined &&
      !isValidDate(rule.lastVerifiedDate)
    ) {
      addError(errors, `prerequisiteRules[${index}]: lastVerifiedDate must use YYYY-MM-DD.`);
    }
    const prerequisiteKey = `${rule.courseId}\u0000${rule.ruleGroupId}\u0000${rule.prerequisiteCourseId}`;
    if (
      isNonEmptyString(rule.courseId) &&
      isNonEmptyString(rule.ruleGroupId) &&
      isNonEmptyString(rule.prerequisiteCourseId)
    ) {
      if (prerequisiteKeys.has(prerequisiteKey)) {
        addError(errors, `Duplicate prerequisite rule for ${rule.courseId} and ${rule.prerequisiteCourseId} in group ${rule.ruleGroupId}.`);
      }
      prerequisiteKeys.add(prerequisiteKey);
    }
    if (isNonEmptyString(rule.courseId) && !coursesById.has(rule.courseId)) {
      addError(errors, `prerequisiteRules[${index}]: courseId does not reference an imported course.`);
    }
    if (
      isNonEmptyString(rule.prerequisiteCourseId) &&
      !coursesById.has(rule.prerequisiteCourseId)
    ) {
      addError(errors, `prerequisiteRules[${index}]: prerequisiteCourseId does not reference an imported course.`);
    }
    if (isNonEmptyString(rule.courseId)) {
      const rules = rulesByCourse.get(rule.courseId) || [];
      rules.push(rule);
      rulesByCourse.set(rule.courseId, rules);
      if (isNonEmptyString(rule.ruleGroupId)) {
        const key = `${rule.courseId}\u0000${rule.ruleGroupId}`;
        const previousType = groupTypes.get(key);
        if (previousType && previousType !== rule.relationshipType) {
          addError(errors, `Prerequisite group ${rule.ruleGroupId} mixes AND and OR relationships.`);
        }
        groupTypes.set(key, rule.relationshipType);
      }
    }
  }

  for (const [courseId, course] of coursesById) {
    const rules = rulesByCourse.get(courseId) || [];
    if (course.prerequisitesStatus === "unavailable" && rules.length > 0) {
      addError(errors, `${course.courseCode}: unavailable prerequisite data cannot include prerequisite rules.`);
    }
  }

  const equivalencyStatuses = new Set(VERIFICATION_STATUSES);
  const equivalencyKeys = new Set();
  for (const [index, equivalency] of transferEquivalencies.entries()) {
    if (!isRecord(equivalency)) continue;
    for (const field of [
      "universityCourseId",
      "sendingInstitutionId",
      "sendingCourseCode",
      "sendingCourseTitle",
      "equivalencyStatus",
      "sendingCourseCatalogUrl",
    ]) {
      if (!isNonEmptyString(equivalency[field])) {
        addError(errors, `transferEquivalencies[${index}]: ${field} is required.`);
      }
    }
    if (
      typeof equivalency.sendingCreditHours !== "number" ||
      !Number.isFinite(equivalency.sendingCreditHours) ||
      equivalency.sendingCreditHours <= 0 ||
      equivalency.sendingCreditHours > 30
    ) {
      addError(errors, `transferEquivalencies[${index}]: sendingCreditHours must be greater than 0 and no more than 30.`);
    }
    if (!isValidUrl(equivalency.sendingCourseCatalogUrl)) {
      addError(errors, `transferEquivalencies[${index}]: sendingCourseCatalogUrl must be an HTTPS URL.`);
    }
    if (!equivalencyStatuses.has(equivalency.equivalencyStatus)) {
      addError(errors, `transferEquivalencies[${index}]: equivalencyStatus must be a supported verification status.`);
    }
    if (
      equivalency.lastVerifiedDate !== undefined &&
      !isValidDate(equivalency.lastVerifiedDate)
    ) {
      addError(errors, `transferEquivalencies[${index}]: lastVerifiedDate must use YYYY-MM-DD.`);
    }
    if (
      equivalency.effectiveDate !== undefined &&
      !isValidDate(equivalency.effectiveDate)
    ) {
      addError(errors, `transferEquivalencies[${index}]: effectiveDate must use YYYY-MM-DD.`);
    }
    const equivalencyKey = `${equivalency.universityCourseId}\u0000${equivalency.sendingInstitutionId}\u0000${equivalency.sendingCourseCode}`;
    if (
      isNonEmptyString(equivalency.universityCourseId) &&
      isNonEmptyString(equivalency.sendingInstitutionId) &&
      isNonEmptyString(equivalency.sendingCourseCode)
    ) {
      if (equivalencyKeys.has(equivalencyKey)) {
        addError(errors, `Duplicate transfer equivalency for ${equivalency.sendingCourseCode} and ${equivalency.universityCourseId}.`);
      }
      equivalencyKeys.add(equivalencyKey);
    }
    if (
      isNonEmptyString(equivalency.universityCourseId) &&
      !coursesById.has(equivalency.universityCourseId)
    ) {
      addError(errors, `transferEquivalencies[${index}]: universityCourseId does not reference an imported course.`);
    }
    if (
      isNonEmptyString(equivalency.sendingInstitutionId) &&
      !institutionsById.has(equivalency.sendingInstitutionId)
    ) {
      addError(errors, `transferEquivalencies[${index}]: sendingInstitutionId does not reference an imported institution.`);
    }
    if (
      equivalency.equivalencyStatus !== equivalency.verificationStatus
    ) {
      addError(errors, `transferEquivalencies[${index}]: equivalencyStatus and verificationStatus must match.`);
    }
  }

  const states = new Map();
  for (const startId of coursesById.keys()) {
    if (states.has(startId)) continue;
    const stack = [{ courseId: startId, nextRule: 0 }];
    states.set(startId, 1);
    while (stack.length) {
      const current = stack[stack.length - 1];
      const rules = rulesByCourse.get(current.courseId) || [];
      if (current.nextRule >= rules.length) {
        states.set(current.courseId, 2);
        stack.pop();
        continue;
      }
      const prerequisiteId = rules[current.nextRule].prerequisiteCourseId;
      current.nextRule += 1;
      if (!coursesById.has(prerequisiteId)) continue;
      const state = states.get(prerequisiteId);
      if (state === 1) {
        addError(
          errors,
          `Prerequisite cycle detected at ${coursesById.get(prerequisiteId)?.courseCode || prerequisiteId}.`,
        );
      } else if (state !== 2) {
        states.set(prerequisiteId, 1);
        stack.push({ courseId: prerequisiteId, nextRule: 0 });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function searchCourses(courses, query) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return courses
    .filter((course) =>
      `${course.courseCode} ${course.title}`.toLocaleLowerCase().includes(normalized),
    )
    .sort((left, right) => left.courseCode.localeCompare(right.courseCode));
}

export function getCourseById(data, courseId) {
  return data.courses.find((course) => course.id === courseId) || null;
}

export function buildPrerequisiteSequence(data, targetCourseId) {
  const coursesById = new Map(data.courses.map((course) => [course.id, course]));
  const rulesByCourse = new Map();
  for (const rule of data.prerequisiteRules) {
    const rules = rulesByCourse.get(rule.courseId) || [];
    rules.push(rule);
    rulesByCourse.set(rule.courseId, rules);
  }

  const ordered = [];
  const visiting = new Set();
  const visited = new Set();
  function visit(courseId, depth) {
    if (depth > 50) throw new Error("Prerequisite chain exceeds the 50-course display limit.");
    if (visiting.has(courseId)) throw new Error(`Prerequisite cycle detected at ${courseId}.`);
    if (visited.has(courseId)) return;
    const course = coursesById.get(courseId);
    if (!course) throw new Error(`Missing course record for ${courseId}.`);
    visiting.add(courseId);
    for (const rule of rulesByCourse.get(courseId) || []) {
      visit(rule.prerequisiteCourseId, depth + 1);
    }
    visiting.delete(courseId);
    visited.add(courseId);
    ordered.push(course);
  }
  visit(targetCourseId, 0);
  return ordered;
}

export function getTransferEquivalencies(data, courseId) {
  const institutions = new Map(
    data.sendingInstitutions.map((institution) => [institution.id, institution]),
  );
  return data.transferEquivalencies
    .filter((record) => record.universityCourseId === courseId)
    .map((record) => ({
      ...record,
      sendingInstitution: institutions.get(record.sendingInstitutionId),
    }));
}

export function hasVerifiedTransferEquivalencies(records) {
  return records.some(
    (record) => record.equivalencyStatus === "verified-liberty-guide",
  );
}

function readStoredData() {
  const raw = localStorage.getItem(DATA_STORAGE_KEY);
  if (raw === null) return { ...EMPTY_DATA };
  const parsed = JSON.parse(raw);
  const validation = validateImportData(parsed);
  if (!validation.valid) {
    throw new Error(`Saved course data is invalid: ${validation.errors.join(" ")}`);
  }
  return parsed;
}

const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};

function addSourceLink(parent, label, url) {
  const link = element("a", `${label} ↗`);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  parent.append(link);
}

function initializeFinder() {
  const search = document.querySelector("#course-search");
  const searchStatus = document.querySelector("#course-search-status");
  const results = document.querySelector("#course-results");
  const content = document.querySelector("#finder-content");
  const selectedSummary = document.querySelector("#selected-course");
  const prerequisites = document.querySelector("#prerequisite-details");
  const transferHeading = document.querySelector("#transfer-section-heading");
  const transferResults = document.querySelector("#transfer-results");
  const institutionFilter = document.querySelector("#institution-filter");
  const statusFilter = document.querySelector("#status-filter");
  const fileInput = document.querySelector("#data-import");
  const importButton = document.querySelector("#import-data");
  const clearButton = document.querySelector("#clear-data");
  const importStatus = document.querySelector("#import-status");
  if (!search) return;
  const requiredElements = [
    search,
    searchStatus,
    results,
    content,
    selectedSummary,
    prerequisites,
    transferHeading,
    transferResults,
    institutionFilter,
    statusFilter,
    fileInput,
    importButton,
    clearButton,
    importStatus,
  ];
  if (requiredElements.some((node) => !node)) {
    console.error("Course finder page is missing required controls.");
    return;
  }

  let data;
  let selectedCourseId = null;
  searchStatus.textContent = "Loading imported course records…";
  try {
    data = readStoredData();
    searchStatus.textContent = data.courses.length
      ? `${data.courses.length} imported course records loaded.`
      : "No course records are loaded. Use the JSON import below; unverified example course data is not used as official catalog information.";
  } catch (error) {
    data = { ...EMPTY_DATA };
    searchStatus.textContent = `Course data could not be loaded: ${error.message}`;
  }

  function createCourseButton(course, labelPrefix = "", focusOptions = false) {
    const button = element(
      "button",
      `${labelPrefix}${course.courseCode} — ${course.title}`,
      "finder-course-link",
    );
    button.type = "button";
    button.addEventListener("click", () =>
      selectCourse(course.id, focusOptions),
    );
    return button;
  }

  function renderSearchResults(query) {
    results.replaceChildren();
    const matches = searchCourses(data.courses, query);
    if (!query.trim()) {
      searchStatus.textContent = data.courses.length
        ? "Enter a course code or title to search."
        : "Course search is waiting for imported catalog data.";
      return;
    }
    if (!matches.length) {
      searchStatus.textContent = "";
      return;
    }
    searchStatus.textContent = `${matches.length} matching course${matches.length === 1 ? "" : "s"}.`;
    for (const course of matches) {
      const item = element("li");
      item.append(createCourseButton(course));
      results.append(item);
    }
  }

  function renderPrerequisiteGroups(courseId, container, ancestors = new Set()) {
    const course = data.courses.find((record) => record.id === courseId);
    if (!course) return;
    if (ancestors.has(courseId)) {
      container.append(element("p", "A prerequisite cycle was detected; this chain cannot be displayed."));
      return;
    }

    const rules = data.prerequisiteRules.filter((rule) => rule.courseId === courseId);
    if (course.prerequisitesStatus === "unavailable") {
      container.append(element("p", "Prerequisite information is unavailable in the imported sources."));
      return;
    }
    if (!rules.length) {
      container.append(
        element(
          "p",
          "No prerequisites are listed in this imported record. Confirm with Liberty's current catalog.",
        ),
      );
      return;
    }
    container.append(
      element(
        "p",
        "All prerequisite groups below apply. Within an OR group, complete one listed alternative.",
      ),
    );

    const grouped = new Map();
    for (const rule of rules) {
      const group = grouped.get(rule.ruleGroupId) || {
        relationshipType: rule.relationshipType,
        rules: [],
      };
      group.rules.push(rule);
      grouped.set(rule.ruleGroupId, group);
    }
    const nextAncestors = new Set(ancestors);
    nextAncestors.add(courseId);

    for (const [groupId, group] of grouped) {
      const section = element("section", undefined, "prerequisite-rule-group");
      section.append(
        element(
          "h3",
          group.relationshipType === "OR"
            ? "Choose one of these alternatives"
            : "Complete all of these required courses",
        ),
      );
      section.dataset.groupId = groupId;
      const list = element("ul", undefined, "finder-results");
      for (const rule of group.rules) {
        const prerequisite = data.courses.find(
          (record) => record.id === rule.prerequisiteCourseId,
        );
        if (!prerequisite) continue;
        const item = element("li");
        const prefix = rule.minimumGrade
          ? `Minimum grade ${rule.minimumGrade}: `
          : "";
        item.append(createCourseButton(prerequisite, prefix));
        item.append(
          element("p", `Status: ${STATUS_LABELS[rule.verificationStatus]}`),
        );
        if (rule.lastVerifiedDate) {
          item.append(element("p", `Last verified: ${rule.lastVerifiedDate}`));
        } else {
          item.append(element("p", "Last-verified date not provided."));
        }
        addSourceLink(item, "Requirement source", rule.sourceUrl);
        list.append(item);
      }
      section.append(list);
      container.append(section);
    }
  }

  function renderTransferResults() {
    transferResults.replaceChildren();
    if (!selectedCourseId) return;
    const allMatches = getTransferEquivalencies(data, selectedCourseId);
    const matching = allMatches.filter((record) => {
      const institutionMatches =
        !institutionFilter.value ||
        record.sendingInstitutionId === institutionFilter.value;
      const statusMatches =
        !statusFilter.value ||
        record.equivalencyStatus === statusFilter.value;
      return institutionMatches && statusMatches;
    });

    if (!hasVerifiedTransferEquivalencies(allMatches)) {
      transferResults.append(
        element("p", "No verified transfer equivalencies found in the available sources."),
      );
    }
    if (!matching.length) {
      if (allMatches.length) {
        transferResults.append(element("p", "No results match the selected filters."));
      } else {
        transferResults.append(
          element(
            "p",
            "No equivalency records have been imported for this course. Search provider catalogs below for possible courses; these searches are not transfer approvals.",
          ),
        );
      }
    }

    for (const record of matching) {
      const card = element("article", undefined, "transfer-result-card");
      const status = record.equivalencyStatus;
      card.append(
        element("h3", record.sendingInstitution?.name || "Institution unavailable"),
        element("p", `${record.sendingCourseCode} — ${record.sendingCourseTitle}`),
        element("p", `Sending course credits: ${record.sendingCreditHours}`),
        element(
          "p",
          `Liberty equivalent: ${record.libertyEquivalentCourseCode || getCourseById(data, selectedCourseId)?.courseCode || selectedCourseId}`,
        ),
        element("p", `Status: ${STATUS_LABELS[status]}`),
      );
      if (record.lastVerifiedDate) {
        card.append(element("p", `Last verified: ${record.lastVerifiedDate}`));
      } else {
        card.append(element("p", "Last-verified date not provided."));
      }
      addSourceLink(card, "Equivalency source", record.sourceUrl);
      addSourceLink(card, "Sending institution course catalog", record.sendingCourseCatalogUrl);
      transferResults.append(card);
    }

    const course = getCourseById(data, selectedCourseId);
    if (course) {
      const suggestions = element("section", undefined, "provider-search-options");
      suggestions.append(
        element("h3", "Explore possible courses at other learning providers"),
        element(
          "p",
          "These links search provider course catalogs using the selected Liberty course title and code. Similar titles do not establish transfer credit; confirm any equivalency with Liberty before enrolling.",
        ),
      );
      const list = element("ul", undefined, "provider-search-list");
      for (const provider of [
        { name: "Study.com", domain: "study.com" },
        { name: "Sophia Learning", domain: "sophia.org" },
        { name: "StraighterLine", domain: "straighterline.com" },
      ]) {
        const item = element("li");
        const link = element(
          "a",
          `Search ${provider.name} for ${course.courseCode} ${course.title} ↗`,
        );
        const searchTerms = `site:${provider.domain} ${course.courseCode} ${course.title}`;
        link.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        item.append(link);
        list.append(item);
      }
      suggestions.append(list);
      transferResults.append(suggestions);
    }
  }

  function renderInstitutionFilter() {
    const currentValue = institutionFilter.value;
    institutionFilter.replaceChildren(
      element("option", "All institutions"),
    );
    institutionFilter.firstElementChild.value = "";
    const usedInstitutionIds = new Set(
      data.transferEquivalencies.map((record) => record.sendingInstitutionId),
    );
    for (const institution of data.sendingInstitutions) {
      if (!usedInstitutionIds.has(institution.id)) continue;
      const option = element("option", institution.name);
      option.value = institution.id;
      institutionFilter.append(option);
    }
    institutionFilter.value = currentValue;
  }

  function selectCourse(courseId, focusOptions = false) {
    const course = data.courses.find((record) => record.id === courseId);
    if (!course) {
      searchStatus.textContent = "The selected course is not present in the imported catalog.";
      return;
    }
    selectedCourseId = course.id;
    content.hidden = false;
    const courseHeading = element(
      "h2",
      `${course.courseCode} — ${course.title}`,
      "finder-course-title",
    );
    courseHeading.id = "selected-course-heading";
    selectedSummary.replaceChildren(
      courseHeading,
      element("p", course.description),
      element(
        "p",
        `${course.creditHours} credit hours · ${course.department} · Catalog year ${course.catalogYear}`,
      ),
    );
    if (course.lastVerifiedDate) {
      selectedSummary.append(
        element("p", `Last verified: ${course.lastVerifiedDate}`),
      );
    } else {
      selectedSummary.append(element("p", "Last-verified date not provided."));
    }
    selectedSummary.append(
      element("p", `Source status: ${STATUS_LABELS[course.verificationStatus]}`),
    );
    addSourceLink(selectedSummary, "Liberty catalog course", course.catalogUrl);
    addSourceLink(selectedSummary, "Imported record source", course.sourceUrl);

    prerequisites.replaceChildren();
    renderPrerequisiteGroups(course.id, prerequisites);
    try {
      const sequence = buildPrerequisiteSequence(data, course.id);
      if (sequence.length > 1) {
        const chain = element("section", undefined, "dependency-view");
        chain.append(
          element("h3", "Prerequisite chain"),
          element(
            "p",
            "Courses are shown in prerequisite order. Click any course to inspect its requirements and transfer options. OR-group courses are alternatives, not all mandatory.",
          ),
        );
        const cards = element("div", undefined, "prerequisite-chain-cards");
        for (const [index, itemCourse] of sequence.entries()) {
          const card = element(
            "article",
            undefined,
            `prerequisite-chain-card${itemCourse.id === course.id ? " is-selected" : ""}`,
          );
          card.append(
            element(
              "span",
              index === sequence.length - 1
                ? "Selected course"
                : `Prerequisite ${index + 1}`,
              "chain-step-label",
            ),
            createCourseButton(itemCourse, "", true),
          );
          cards.append(card);
        }
        chain.append(cards);
        prerequisites.append(chain);
      }
    } catch (error) {
      prerequisites.append(
        element("p", `Dependency view unavailable: ${error.message}`),
      );
    }
    renderTransferResults();
    (focusOptions ? transferHeading : selectedSummary).scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }

  search.addEventListener("input", () => renderSearchResults(search.value));
  institutionFilter.addEventListener("change", renderTransferResults);
  statusFilter.addEventListener("change", renderTransferResults);
  importButton.addEventListener("click", async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      importStatus.textContent = "Choose a JSON file to import.";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      importStatus.textContent = "Import file is too large; maximum size is 5 MB.";
      return;
    }
    try {
      const imported = JSON.parse(await file.text());
      const validation = validateImportData(imported);
      if (!validation.valid) {
        importStatus.textContent = `Import rejected: ${validation.errors.join(" ")}`;
        return;
      }
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(imported));
      data = imported;
      selectedCourseId = null;
      content.hidden = true;
      search.value = "";
      renderInstitutionFilter();
      renderSearchResults("");
      importStatus.textContent = `Imported ${data.courses.length} courses, ${data.prerequisiteRules.length} prerequisite rules, ${data.sendingInstitutions.length} institutions, and ${data.transferEquivalencies.length} transfer records into this browser.`;
    } catch (error) {
      importStatus.textContent = `Import failed: ${error.message}`;
    }
  });
  clearButton.addEventListener("click", () => {
    try {
      localStorage.removeItem(DATA_STORAGE_KEY);
      data = { ...EMPTY_DATA };
      selectedCourseId = null;
      content.hidden = true;
      search.value = "";
      renderInstitutionFilter();
      renderSearchResults("");
      importStatus.textContent = "Imported course and transfer data cleared from this browser.";
    } catch (error) {
      importStatus.textContent = `Could not clear imported data: ${error.message}`;
    }
  });

  renderInstitutionFilter();
  renderSearchResults("");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFinder, { once: true });
} else {
  initializeFinder();
}
