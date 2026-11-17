# Custom curriculum assistant
- [ ] Add a Build custom course popup with sourced university-course research.
- [ ] Rework curriculum planning into a four-page slider with clear step navigation.
- [ ] Require and validate mailing address fields in registrar submissions.
- [ ] Guide users from career goals and skills through catalog or custom courses to a saved curriculum.
- [ ] Load and save a local `userdata` file, with browser backup and download/import support.
- [ ] Add readiness-gated registrar form and store submissions in `userdata`.
- [ ] Connect registrar email to example@liberty.edu after a verified sender domain is configured (blocked: no email domain).
- [ ] Reconnect the hosted assistant parent-frame bridge and verify the complete browser flow.

# Degree Completion Plan
- [x] Switch assistant back to hosted AI (user request).

- [x] Research relevant Liberty catalogs and generate ten illustrative 120-credit plans from existing courses, including 9–20 related elective credits.
- [x] Recreate the reference page elements and editable academic profile, progress, course statuses, filters, comparison, and print/export.
- [x] Add private user-specific storage.
- [ ] Verify saved profile behavior end-to-end (needs signed-in test).

# Design consistency
- [ ] Restyle Course Search and Course Calendar to match the Degree Completion Plan look.
- [ ] Add a Course Optimizer link to the shared header (page itself not built yet).
- Assistant only answers course selection, curriculum development, and academic legal/policy topics; prompt and reply checks refuse with "I can't discuss that."
