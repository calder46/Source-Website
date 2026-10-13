window.prerequisiteCatalog = {
  "ACCT 209": { title: "Survey of Accounting and Finance", prerequisites: [] },
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

  // These BUSI courses are prerequisites, but their catalog details
  // were not included in the pasted information. Add their real details.
  "BUSI 201": { title: "BUSI 201 — details needed", prerequisites: [] },
  "BUSI 320": { title: "BUSI 320 — details needed", prerequisites: [] },
};
