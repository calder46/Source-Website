(() => {
  const courses = window.prerequisiteCatalog;
  const programSelect = document.querySelector("#degree-program");
  const select = document.querySelector("#degree-flow-target");
  const button = document.querySelector("#show-degree-flow");
  const viewport = document.querySelector("#degree-flow-viewport");
  const chart = document.querySelector("#degree-flowchart");
  const message = document.querySelector("#degree-flow-message");
  const description = document.querySelector("#degree-flow-description");

  if (
    !programSelect ||
    !select ||
    !button ||
    !viewport ||
    !chart ||
    !message ||
    !description
  ) {
    console.error("Degree planner elements are missing from dcp.html.");
    return;
  }

  if (!courses) {
    select.innerHTML = '<option value="">Course catalog not found</option>';
    message.textContent =
      "The course catalog did not load. Check that prerequisite-flow.js loads before degree-plan-visual.js.";
    button.disabled = true;
    return;
  }

  const acctCodes = Object.keys(courses)
    .filter((code) => code.startsWith("ACCT "))
    .sort();

  select.replaceChildren();

  for (const code of acctCodes) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} — ${courses[code].title}`;
    select.append(option);
  }

  programSelect.addEventListener("change", () => {
    const isAccounting = programSelect.value === "accounting";
    select.disabled = !isAccounting;
    button.disabled = !isAccounting || acctCodes.length === 0;

    if (isAccounting) {
      description.textContent =
        "Select an ACCT course, then view its prerequisite flowchart.";
      message.textContent = "";
      return;
    }

    const programName =
      programSelect.options[programSelect.selectedIndex].textContent.replace(
        " Course Plan",
        "",
      );
    description.textContent = `${programName} course plans are not available yet.`;
    message.textContent = `${programName} courses are not available in this planner yet.`;
    viewport.hidden = true;
    button.textContent = "View course plan";
    button.setAttribute("aria-expanded", "false");
  });

  if (acctCodes.length === 0) {
    select.innerHTML = '<option value="">No ACCT courses found</option>';
    message.textContent = "No ACCT courses were found in the loaded catalog.";
    button.disabled = true;
    return;
  }

  function renderFlow(targetCode) {
    chart.replaceChildren();

    try {
      const nodes = new Map();
      const visiting = new Set();

      function visit(code) {
        if (visiting.has(code)) {
          throw new Error(`A prerequisite cycle was found for ${code}.`);
        }
        if (nodes.has(code)) return nodes.get(code);

        const course = courses[code] || {
          title: "Course details not provided",
          prerequisites: [],
        };

        const node = {
          code,
          course,
          depth: 0,
          prerequisites: course.prerequisites || [],
        };

        visiting.add(code);
        nodes.set(code, node);

        for (const prerequisite of node.prerequisites) {
          const prerequisiteNode = visit(prerequisite);
          node.depth = Math.max(node.depth, prerequisiteNode.depth + 1);
        }

        visiting.delete(code);
        return node;
      }

      visit(targetCode);

      const maxDepth = Math.max(
        ...[...nodes.values()].map((node) => node.depth),
      );
      const levels = Array.from({ length: maxDepth + 1 }, () => []);

      for (const node of nodes.values()) {
        levels[node.depth].push(node);
      }

      chart.style.gridTemplateColumns = `repeat(${levels.length}, minmax(230px, 1fr))`;
      chart.style.minWidth = `${levels.length * 250}px`;

      const columns = document.createElement("div");
      columns.className = "degree-flow-columns";
      chart.append(columns);

      const cardElements = new Map();

      levels.forEach((level, index) => {
        const section = document.createElement("section");
        section.className = "degree-flow-column";

        const heading = document.createElement("h2");
        heading.textContent =
          index === maxDepth
            ? "Selected course"
            : `Prerequisite step ${index + 1}`;

        const cards = document.createElement("div");
        cards.className = "degree-flow-cards";

        for (const node of level) {
          const card = document.createElement("article");
          card.className = "degree-flow-card";
          if (node.code === targetCode) card.classList.add("is-target");

          const code = document.createElement("strong");
          code.textContent = node.code;

          const title = document.createElement("span");
          title.textContent = node.course.title;

          const requirements = document.createElement("span");
          requirements.className = "flow-requirements";
          requirements.textContent = node.prerequisites.length
            ? `Requires: ${node.prerequisites.join(", ")}`
            : "No prerequisites listed";

          card.append(code, title, requirements);

          const courseNumber = Number(node.code.match(/\d+/)?.[0]);

          if (
            node.code.startsWith("ACCT ") &&
            courseNumber > 0 &&
            courseNumber < 300
          ) {
            const providers = [
              {
                name: "Sophia Learning",
                equivalency: "ACCT 1XX elective · 3 credits",
                courses: ["Financial Accounting"],
              },
              {
                name: "Study.com",
                equivalency: "ACCT 1XX elective · 3 credits",
                courses: [
                  "Accounting 101 — Financial Accounting",
                  "Accounting 102 — Introduction to Managerial Accounting",
                  "Accounting 201 — Intermediate Financial Accounting I",
                  "Accounting 202 — Intermediate Accounting II",
                  "Accounting 301 — Applied Managerial Accounting",
                  "Accounting 302 — Advanced Accounting",
                  "Accounting 303 — Cost Accounting",
                ],
              },
              {
                name: "StraighterLine",
                equivalency: "ACCT 1XX elective · 3 credits",
                courses: [
                  "ACC101 — Accounting I",
                  "ACC102 — Accounting II",
                  "ACC151 — Financial Accounting",
                ],
              },
            ];

            for (const provider of providers) {
              const bubble = document.createElement("div");
              bubble.className = "transfer-provider-bubble";

              const heading = document.createElement("strong");
              heading.textContent = provider.name;

              const equivalency = document.createElement("p");
              equivalency.textContent = `Listed transfer equivalency: ${provider.equivalency}`;

              const list = document.createElement("ul");
              for (const courseName of provider.courses) {
                const item = document.createElement("li");
                item.textContent = courseName;
                list.append(item);
              }

              const note = document.createElement("small");
              note.textContent =
                "Possible lower-level elective credit; not confirmed as a substitute for this required course.";

              bubble.append(heading, equivalency, list, note);
              card.append(bubble);
            }
          }

          cards.append(card);
          cardElements.set(node.code, card);
        }

        section.append(heading, cards);
        columns.append(section);
      });

      // Draw arrows from each prerequisite card to the course that requires it.
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("degree-flow-connections");
      svg.setAttribute("aria-hidden", "true");

      const defs = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs",
      );
      const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "marker",
      );
      marker.id = "degree-flow-arrow";
      marker.setAttribute("viewBox", "0 0 10 10");
      marker.setAttribute("refX", "8");
      marker.setAttribute("refY", "5");
      marker.setAttribute("markerWidth", "7");
      marker.setAttribute("markerHeight", "7");
      marker.setAttribute("orient", "auto");

      const arrow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
      arrow.setAttribute("fill", "#c6283d");
      marker.append(arrow);
      defs.append(marker);
      svg.append(defs);
      chart.prepend(svg);

      function drawArrows() {
        const chartRect = chart.getBoundingClientRect();
        svg.setAttribute("width", chart.scrollWidth);
        svg.setAttribute("height", chart.scrollHeight);
        svg.setAttribute(
          "viewBox",
          `0 0 ${chart.scrollWidth} ${chart.scrollHeight}`,
        );
        svg.querySelectorAll(".flow-edge").forEach((edge) => edge.remove());

        for (const node of nodes.values()) {
          const targetCard = cardElements.get(node.code);
          const targetRect = targetCard.getBoundingClientRect();

          for (const prerequisite of node.prerequisites) {
            const sourceCard = cardElements.get(prerequisite);
            if (!sourceCard) continue;

            const sourceRect = sourceCard.getBoundingClientRect();
            const startX = sourceRect.right - chartRect.left;
            const startY =
              sourceRect.top + sourceRect.height / 2 - chartRect.top;
            const endX = targetRect.left - chartRect.left;
            const endY = targetRect.top + targetRect.height / 2 - chartRect.top;
            const curve = Math.max(25, (endX - startX) / 2);

            const path = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path",
            );
            path.classList.add("flow-edge");
            path.setAttribute(
              "d",
              `M ${startX} ${startY} C ${startX + curve} ${startY}, ` +
                `${endX - curve} ${endY}, ${endX} ${endY}`,
            );
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "#c6283d");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("marker-end", "url(#degree-flow-arrow)");
            svg.append(path);
          }
        }
      }

      requestAnimationFrame(drawArrows);
      window.addEventListener("resize", drawArrows, { passive: true });
      message.textContent =
        "Follow the arrows from prerequisite courses toward your selected course.";
    } catch (error) {
      chart.replaceChildren();
      message.textContent = error.message;
    }
  }

  button.addEventListener("click", () => {
    const opening = viewport.hidden;
    viewport.hidden = !opening;
    button.textContent = opening ? "Hide course plan" : "View course plan";
    button.setAttribute("aria-expanded", String(opening));

    if (opening) renderFlow(select.value);
  });

  select.addEventListener("change", () => {
    if (!viewport.hidden) renderFlow(select.value);
  });
})();
