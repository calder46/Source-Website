// Illustrative FastTrak plans using existing catalog courses; not official Liberty degree audits.
const degreePlans = [
  {
    "id": "aviation",
    "name": "Aviation",
    "award": "B.S.",
    "school": "School of Aeronautics",
    "totalCredits": 120,
    "electiveCredits": 12,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/aeronautics/aviation-major-bs/aviation-online/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "PHYS 102",
          "PHYS 104",
          "MATH 120",
          "MATH 123",
          "GEOG 107",
          "GEOG 108"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 48,
        "courseIds": [
          "AVIA 301",
          "AVIA 302",
          "AVIA 305",
          "AVIA 308",
          "AVIA 315",
          "AVIA 319",
          "AVIA 320",
          "AVIA 323",
          "AVIA 334",
          "AVIA 336",
          "AVIA 341",
          "AVIA 354",
          "AVIA 363",
          "AVIA 366",
          "AVIA 377"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 12,
        "courseIds": [
          "AVIA 386",
          "GEOG 303",
          "BUSI 301",
          "BUSI 304"
        ]
      }
    ]
  },
  {
    "id": "nursing",
    "name": "Nursing",
    "award": "B.S.N.",
    "school": "School of Nursing",
    "totalCredits": 120,
    "electiveCredits": 9,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/nursing/nursing-major-bsn/nursing-bsn-pre-licensure-resident/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "BIOL 105",
          "BIOL 117",
          "CHEM 103",
          "CHEM 107",
          "HLTH 103",
          "HLTH 138",
          "PSYC 100",
          "PSYC 104",
          "PSYC 108"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 51,
        "courseIds": [
          "NURS 313",
          "NURS 318",
          "NURS 321",
          "NURS 323",
          "NURS 332",
          "NURS 340",
          "NURS 358",
          "NURS 359",
          "NURS 360",
          "NURS 367",
          "NURS 375",
          "NURS 376",
          "NURS 379",
          "NURS 380",
          "NURS 381",
          "NURS 382",
          "NURS 390"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 9,
        "courseIds": [
          "NURS 397",
          "HLTH 301",
          "PSYC 300"
        ]
      }
    ]
  },
  {
    "id": "information-technology",
    "name": "Information Technology",
    "award": "B.S.",
    "school": "School of Business",
    "totalCredits": 120,
    "electiveCredits": 15,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/business/information-technology-major-bs/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "MATH 120",
          "MATH 123",
          "MATH 124",
          "BUSI 104",
          "BUSI 107",
          "BUSI 111"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 45,
        "courseIds": [
          "CSIS 301",
          "CSIS 305",
          "CSIS 311",
          "CSIS 312",
          "CSIS 317",
          "CSIS 320",
          "CSIS 325",
          "CSIS 345",
          "CSIS 346",
          "CSIS 353",
          "CSIS 367",
          "CSIS 378",
          "CSIS 389",
          "CSIS 397",
          "CSIS 402"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 15,
        "courseIds": [
          "CSIS 409",
          "BUSI 301",
          "MKTG 301",
          "MKTG 304",
          "MKTG 305"
        ]
      }
    ]
  },
  {
    "id": "chemistry",
    "name": "Chemistry",
    "award": "B.S.",
    "school": "School of Health Sciences",
    "totalCredits": 120,
    "electiveCredits": 12,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/health-sciences/chemistry-major-bs/chemistry-bs-resident/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "MATH 120",
          "MATH 123",
          "PHYS 102",
          "PHYS 104",
          "BIOL 102",
          "BIOL 105",
          "BIOL 117"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 48,
        "courseIds": [
          "CHEM 302",
          "CHEM 304",
          "CHEM 309",
          "CHEM 311",
          "CHEM 312",
          "CHEM 314",
          "CHEM 317",
          "CHEM 320",
          "CHEM 324",
          "CHEM 334",
          "CHEM 335",
          "CHEM 342",
          "CHEM 347",
          "CHEM 349",
          "CHEM 351",
          "CHEM 355"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 12,
        "courseIds": [
          "CHEM 359",
          "PHYS 304",
          "BIOL 305",
          "BIOL 310"
        ]
      }
    ]
  },
  {
    "id": "church-ministry",
    "name": "Church Ministry",
    "award": "B.S.",
    "school": "School of Divinity",
    "totalCredits": 120,
    "electiveCredits": 18,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/rawlings-divinity/christian-leadership-church-ministries-major-bs/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "COMS 101",
          "COMS 113",
          "COMS 118",
          "PSYC 100",
          "PSYC 104",
          "PSYC 108",
          "SOCI 111",
          "SOCI 114"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 42,
        "courseIds": [
          "BIBL 300",
          "RLGN 301",
          "THEO 305",
          "THEO 308",
          "RLGN 313",
          "RLGN 317",
          "RLGN 320",
          "THEO 320",
          "RLGN 321",
          "RLGN 322",
          "THEO 328",
          "THEO 339",
          "THEO 344",
          "RLGN 346"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 18,
        "courseIds": [
          "THEO 350",
          "MUSC 314",
          "RLGN 350",
          "RLGN 352",
          "RLGN 353",
          "RLGN 356"
        ]
      }
    ]
  },
  {
    "id": "forensic-science",
    "name": "Forensic Science",
    "award": "B.S.",
    "school": "School of Health Sciences",
    "totalCredits": 120,
    "electiveCredits": 9,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/health-sciences/forensic-science-major-bs/forensic-science-bs-resident/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "CHEM 103",
          "CHEM 115",
          "BIOL 199",
          "BIOL 209",
          "MATH 120",
          "MATH 123"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 51,
        "courseIds": [
          "BIOL 310",
          "CHEM 312",
          "CHEM 320",
          "CJUS 320",
          "CJUS 323",
          "CHEM 334",
          "CJUS 338",
          "BIOL 344",
          "CHEM 349",
          "CHEM 355",
          "CHEM 359",
          "CHEM 384",
          "CJUS 389",
          "CJUS 394",
          "CHEM 396",
          "BIOL 413",
          "CJUS 417",
          "CHEM 434"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 9,
        "courseIds": [
          "CJUS 375",
          "CJUS 437",
          "CHEM 440",
          "PSYC 300"
        ]
      }
    ]
  },
  {
    "id": "public-administration",
    "name": "Public Administration",
    "award": "B.S.",
    "school": "Helms School of Government",
    "totalCredits": 120,
    "electiveCredits": 18,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/helms-government/public-administration-major-bs/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "ECON 100",
          "ECON 101",
          "ACCT 107",
          "ACCT 117",
          "SOCI 111",
          "SOCI 114"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 42,
        "courseIds": [
          "PLCY 301",
          "PLCY 303",
          "BUSI 304",
          "PLCY 307",
          "PSCI 309",
          "PLCY 311",
          "PLCY 314",
          "PLCY 321",
          "PSCI 322",
          "PLCY 328",
          "PLCY 329",
          "PLCY 330",
          "PLCY 333",
          "PSCI 333",
          "BUSI 338"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 18,
        "courseIds": [
          "PLCY 354",
          "ECON 321",
          "PSCI 339",
          "PSCI 360",
          "PSCI 365",
          "PSCI 386"
        ]
      }
    ]
  },
  {
    "id": "studio-digital-arts",
    "name": "Studio and Digital Arts",
    "award": "B.S.",
    "school": "School of Communication & the Arts",
    "totalCredits": 120,
    "electiveCredits": 15,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/communication-arts/studio-digital-arts-major-bs/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "COMS 101",
          "COMS 113",
          "COMS 118",
          "MKTG 133",
          "MKTG 145",
          "CSIS 100",
          "CSIS 107"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 45,
        "courseIds": [
          "ARTS 300",
          "ARTS 312",
          "ARTS 317",
          "ARTS 321",
          "ARTS 324",
          "ARTS 325",
          "ARTS 330",
          "ARTS 338",
          "ARTS 339",
          "ARTS 344",
          "ARTS 349",
          "ARTS 354",
          "ARTS 358",
          "ARTS 362",
          "ARTS 370"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 15,
        "courseIds": [
          "ARTS 382",
          "MKTG 301",
          "COMS 305",
          "COMS 310",
          "COMS 313"
        ]
      }
    ]
  },
  {
    "id": "unmanned-aircraft",
    "name": "Unmanned Aircraft Operations",
    "award": "B.S.",
    "school": "School of Aeronautics",
    "totalCredits": 120,
    "electiveCredits": 15,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/aeronautics/unmanned-aircraft-operations-major-bs/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "CSIS 100",
          "CSIS 107",
          "MATH 120",
          "MATH 123",
          "PHYS 102",
          "PHYS 104"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 45,
        "courseIds": [
          "ENGR 304",
          "AVIA 305",
          "AVIA 315",
          "AVIA 318",
          "ENGR 318",
          "AVIA 320",
          "ENGR 321",
          "ENGR 332",
          "ENGR 334",
          "GEOG 338",
          "AVIA 341",
          "AVIA 363",
          "AVIA 366",
          "ENGR 369",
          "GEOG 371"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 15,
        "courseIds": [
          "AVIA 386",
          "GEOG 375",
          "CSIS 301",
          "CSIS 305",
          "CSIS 311"
        ]
      }
    ]
  },
  {
    "id": "zoology",
    "name": "Zoology",
    "award": "B.S.",
    "school": "School of Health Sciences",
    "totalCredits": 120,
    "electiveCredits": 12,
    "source": "https://catalog.liberty.edu/undergraduate/colleges-schools/health-sciences/zoology-major-bs/zoology-bs-resident/",
    "sections": [
      {
        "id": "general",
        "name": "General Education",
        "credits": 42,
        "courseIds": [
          "BIBL 105",
          "BIBL 110",
          "ENGL 100",
          "ENGL 112",
          "COMS 102",
          "MATH 111",
          "MATH 117",
          "THEO 102",
          "RLGN 102",
          "PHIL 102",
          "HIUS 113",
          "HIUS 114",
          "SOCI 102",
          "SOCI 107",
          "SOCI 122"
        ]
      },
      {
        "id": "foundation",
        "name": "Major Foundations",
        "credits": 18,
        "courseIds": [
          "CHEM 103",
          "CHEM 115",
          "MATH 120",
          "MATH 123",
          "GEOG 107",
          "GEOG 108"
        ]
      },
      {
        "id": "core",
        "name": "Major Requirements",
        "credits": 48,
        "courseIds": [
          "BIOL 305",
          "BIOL 307",
          "BIOL 310",
          "BIOL 319",
          "BIOL 324",
          "BIOL 325",
          "BIOL 326",
          "BIOL 338",
          "BIOL 344",
          "BIOL 348",
          "BIOL 366",
          "BIOL 371",
          "BIOL 373",
          "BIOL 386",
          "BIOL 390"
        ]
      },
      {
        "id": "electives",
        "name": "Related Electives",
        "credits": 12,
        "courseIds": [
          "BIOL 391",
          "GEOG 303",
          "HLTH 301",
          "HLTH 308"
        ]
      }
    ]
  }
];
