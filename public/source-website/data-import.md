# Course and transfer data import

The prerequisite finder currently has no official Liberty API connection,
server-side course database, or automatic catalog importer. It accepts a
normalized JSON file selected in the page and stores the imported data in that
browser's local storage. Importing data does not make it official or verified.
The external Liberty pages could not be inspected from this development
session, so no download format or authorized API is claimed here.

## JSON structure

The top-level object must contain four arrays:

- `courses`
- `prerequisiteRules`
- `sendingInstitutions`
- `transferEquivalencies`

Arrays can be empty. Every record has a unique `id`, `sourceInstitution`,
HTTPS `sourceUrl`, `importedAt` date (`YYYY-MM-DD`), and a
`verificationStatus`:

- `verified-liberty-guide`
- `official-needs-confirmation`
- `unverified-suggestion`

Each course record also contains `courseCode`, `title`, `description`,
`creditHours` (greater than 0 and no more than 30), `department`, HTTPS
`catalogUrl`, `catalogYear`, and `prerequisitesStatus`. The latter is
`documented` or `unavailable`; use `documented` with no prerequisite rules only
when the source confirms that none are listed. `lastVerifiedDate` is optional.

Each prerequisite rule contains `courseId`, `prerequisiteCourseId`,
`ruleGroupId`, and `relationshipType` (`AND` or `OR`). Rules in one group must
use the same relationship type. Separate groups are all requirements; rules
within an `OR` group are alternatives. `minimumGrade` and `lastVerifiedDate`
are optional. Both course IDs must refer to course records in the same import.

Each sending institution record contains `name` and an HTTPS `websiteUrl`.
Each transfer equivalency contains `universityCourseId`,
`sendingInstitutionId`, `sendingCourseCode`, `sendingCourseTitle`,
`sendingCreditHours`, `equivalencyStatus`, HTTPS `sendingCourseCatalogUrl`,
and optional `libertyEquivalentCourseCode`, `effectiveDate`, and
`lastVerifiedDate`. The university course and institution IDs must exist in the
same import. `equivalencyStatus` must match `verificationStatus`.

The importer rejects duplicate IDs, duplicate course codes, invalid credit
hours, malformed dates or URLs, unsupported status values, missing references,
mixed AND/OR groups, and prerequisite cycles. It does not check the truth of
imported claims. A record marked verified is shown as verified only when its
source URL is on `liberty.edu`; the import does not inspect that page or prove
the equivalency appears there. Users must confirm that the linked source and
transfer guide apply to their program and term.

## Updating data

1. Obtain data from Liberty's transfer equivalency and catalog resources, or
   another source you are authorized to use. Preserve the source URL and
   source institution for each record.
2. Normalize it to the fields above. Do not infer transfer equivalencies from
   similar titles. Use `official-needs-confirmation` or
   `unverified-suggestion` when approval/current status is not established.
3. In the finder page, import the complete updated JSON bundle. A successful
   import replaces the previous bundle in that browser. Use **Clear imported
   data** to remove it.
4. Re-import when catalog years or transfer guides change, including updated
   source and last-verified dates where available.

This is a per-browser convenience import, not a shared production database.
It has no authenticated administrator role or server-side import endpoint.
