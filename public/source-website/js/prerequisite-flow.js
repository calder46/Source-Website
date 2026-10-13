(() => {
  // Catalog data from the course information you provided.
  const courses = {
    "ACCT 209": {
      title: "Survey of Accounting and Finance",
      prerequisites: [],
    },
    "ACCT 211": { title: "Financial Principles", prerequisites: [] },
    "ACCT 212": { title: "Managerial Principles", prerequisites: ["ACCT 211"] },
    "ACCT 299": { title: "Internship", prerequisites: [] },
    "ACCT 301": {
      title: "Intermediate Financial Accounting I",
      prerequisites: ["ACCT 211", "ACCT 212"],
    },
    "ACCT 302": {
      title: "Intermediate Financial Accounting II",
      prerequisites: ["ACCT 301"],
    },
    "ACCT 311": { title: "Corporate Accounting", prerequisites: ["ACCT 212"] },
    "ACCT 332": {
      title: "Accounting and Control",
      prerequisites: ["ACCT 301", "BUSI 201"],
    },
    "ACCT 340": { title: "Accounting Ethics", prerequisites: ["ACCT 212"] },
    "ACCT 350": {
      title: "Accounting Ethics and Professional Responsibility",
      prerequisites: ["ACCT 212"],
    },
    "ACCT 370": {
      title: "Financial Statement Analysis",
      prerequisites: ["ACCT 211", "ACCT 212"],
    },
    "ACCT 401": { title: "Individual Taxation", prerequisites: ["ACCT 212"] },
    "ACCT 402": {
      title: "Consolidations and Advanced Accounting Topics",
      prerequisites: ["ACCT 302"],
    },
    "ACCT 403": {
      title: "Fund Accounting for Government and Not for Profits",
      prerequisites: ["ACCT 402"],
    },
    "ACCT 404": {
      title: "Assurance and Attestation",
      prerequisites: ["ACCT 302"],
    },
    "ACCT 406": {
      title: "Principles of Forensic Accounting",
      prerequisites: ["ACCT 404"],
    },
    "ACCT 409": {
      title: "Financial Reporting for Nonprofit Entities",
      prerequisites: ["BUSI 320"],
    },
    "ACCT 412": {
      title: "Corporate/Partnership/Estate Taxation",
      prerequisites: ["ACCT 401"],
    },
    "ACCT 432": {
      title: "IT Audit",
      prerequisites: ["ACCT 332", "ACCT 404"],
    },
    "ACCT 470": {
      title: "Advanced Data Analysis and Reporting",
      prerequisites: ["ACCT 332"],
    },
    "ACCT 495": { title: "Directed Research", prerequisites: [] },
    "ACCT 497": { title: "Special Topics in Accounting", prerequisites: [] },
    "ACCT 499": { title: "Internships", prerequisites: [] },

    // Add the official BUSI course details when available.
    "BUSI 201": { title: "BUSI 201 — details needed", prerequisites: [] },
    "BUSI 320": { title: "BUSI 320 — details needed", prerequisites: [] },
  };

  // Make the catalog available to other scripts if needed.
  window.prerequisiteCatalog = courses;

  function initializePlanner() {
    const select = document.querySelector("#prerequisite-target");
    const output = document.querySelector("#prerequisite-output");

    if (!select || !output) {
      console.error("Planner elements are missing from dcp.html.");
      return;
    }

    const accountingCourses = Object.keys(courses)
      .filter((code) => code.startsWith("ACCT "))
      .sort();

    select.replaceChildren();

    for (const code of accountingCourses) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${code} — ${courses[code].title}`;
      select.append(option);
    }

    function renderPlan(targetCode) {
      output.replaceChildren();

      try {
        const sequence = [];
        const visited = new Set();
        const visiting = new Set();

        function visit(code) {
          if (visited.has(code)) return;

          if (visiting.has(code)) {
            throw new Error(`A prerequisite cycle was found for ${code}.`);
          }

          const course = courses[code];
          if (!course) {
            throw new Error(`Course information is missing for ${code}.`);
          }

          visiting.add(code);

          for (const prerequisite of course.prerequisites) {
            visit(prerequisite);
          }

          visiting.delete(code);
          visited.add(code);
          sequence.push(code);
        }

        visit(targetCode);

        const heading = document.createElement("h3");
        heading.textContent = "Courses to complete, in order";
        output.append(heading);

        const table = document.createElement("table");
        table.className = "prerequisite-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        for (const label of ["Course", "Required prerequisites"]) {
          const th = document.createElement("th");
          th.scope = "col";
          th.textContent = label;
          headerRow.append(th);
        }

        thead.append(headerRow);

        const tbody = document.createElement("tbody");

        for (const code of sequence) {
          const course = courses[code];
          const row = document.createElement("tr");

          if (code === targetCode) row.classList.add("target-course");

          const courseCell = document.createElement("td");
          courseCell.textContent = `${code} — ${course.title}`;

          const prerequisitesCell = document.createElement("td");
          prerequisitesCell.textContent = course.prerequisites.length
            ? course.prerequisites
                .map(
                  (prerequisite) =>
                    `${prerequisite} — ${courses[prerequisite].title}`,
                )
                .join("; ")
            : "None listed";

          row.append(courseCell, prerequisitesCell);
          tbody.append(row);
        }

        table.append(thead, tbody);
        output.append(table);
      } catch (error) {
        output.textContent = error.message;
      }
    }

    select.addEventListener("change", () => renderPlan(select.value));

    if (accountingCourses.length > 0) {
      renderPlan(select.value);
    } else {
      output.textContent = "No ACCT courses are present in the catalog.";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePlanner);
  } else {
    initializePlanner();
  }
})();
