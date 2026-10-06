
const universities = {
    "Liberty University": { costPerCredit: 705 },
    "State College": { costPerCredit: 450 }
};

const courseDatabase = [
    {
        id: "BIBL 105",
        name: "Old Testament Survey",
        desc: "An introduction to the authorship and contents of the Old Testament books.",
        univ: "Liberty University",
        credits: 2,
        prof: "Matthew Bovard",
        day: "M,W",
        startTime: "8:15",
        endTime: "9:05"
    },
    {
        id: "BIBL 110",
        name: "New Testament Survey",
        desc: "An introduction to the authorship and contents of the New Testament books.",
        univ: "Liberty University",
        credits: 2,
        prof: "Dorothy Rhoads",
        day: "M,W",
        startTime: "13:05",
        endTime: "13:55"
    },
    {
        id: "EVAN 101",
        name: "Evangelism and the Christian Life",
        desc: "An in-depth study of how to lead people to Christ. Special attention will be given to the theology of all aspects of evangelism including the follow-up.",
        univ: "Liberty University",
        credits: 2,
        prof: "David Wheeler",
        day: "T,H",
        startTime: "12:45",
        endTime: "13:35"
    },
    {
        id: "CSIS 100",
        name: "Introduction to Information Systems and Information Technology",
        desc: "This course examines the design, selection, implementation and management of enterprise Business solutions.",
        univ: "Liberty University",
        credits: 3,
        prof: "David Donahoo",
        day: "M,W,F",
        startTime: "13:05",
        endTime: "13:55"
    },
    {
        id: "CSIS 209",
        name: "C# Programming",
        desc: "Development of computer and programming skills using the C# language.",
        univ: "Liberty University",
        credits: 3,
        prof: "Mark Merry",
        day: "M,W,F",
        startTime: "14:15",
        endTime: "15:30"
    },
    {
        id: "CSIS 212",
        name: "Object-Oriented Programming",
        desc: "A study of the general-purpose, secure, object-oriented, portable programs.",
        univ: "Liberty University",
        credits: 3,
        prof: "Nomikos Kipreos",
        day: "M,W,F",
        startTime: "13:05",
        endTime: "13:55"
    },
    {
        id: "CSIS 312",
        name: "Advanced Object-Oriented Programming",
        desc: "In-depth study of the advanced features of Java.",
        univ: "Liberty University",
        credits: 3,
        prof: "Festus Oderanti",
        day: "M,W,F",
        startTime: "12:00",
        endTime: "12:50"
    },
    {
        id: "CSIS 320",
        name: "IS Hardware and Software",
        desc: "Emphasis is placed on the role of the computer in information processing, including the design of computer hardware.",
        univ: "Liberty University",
        credits: 3,
        prof: "David Holder",
        day: "M",
        startTime: "17:30",
        endTime: "20:30"
    },
    {
        id: "CSIS 325",
        name: "Database Management Systems",
        desc: "The study of relational database architecture, design, access, administration and implementation in the context of various organizational environments.",
        univ: "Liberty University",
        credits: 3,
        prof: "Nomikos Kipreos",
        day: "T,H",
        startTime: "12:00",
        endTime: "12:50"
    }
];