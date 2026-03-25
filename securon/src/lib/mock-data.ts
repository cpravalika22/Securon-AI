
/**
 * @fileOverview Static mock data for simulated dashboard testing.
 * Focused on gender diversity and anonymous college-related complaints.
 */

export type Severity = "low" | "medium" | "high";
export type Status = "pending" | "in-progress" | "resolved";
export type Category = "Academic" | "Ragging" | "Harassment" | "Discrimination" | "Security" | "Privacy";

export interface MockComplaint {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  category: Category;
  date: string;
  organization: string;
  userId: string;
}

export const MOCK_COMPLAINTS: MockComplaint[] = [
  {
    id: "SEC-8801",
    title: "Faculty Retaliation Threat",
    description: "A senior professor made inappropriate gender-based remarks and threatened my grades if I didn't perform personal errands. I am raising this anonymously to avoid direct confrontation.",
    severity: "high",
    status: "pending",
    category: "Academic",
    date: "2024-03-01T10:00:00Z",
    organization: "CMR Engineering College",
    userId: "user-001"
  },
  {
    id: "SEC-8802",
    title: "Hostel Ragging Incident",
    description: "Group of seniors entered the freshman wing at midnight and forced me to perform humiliating acts. They recorded it and are using it as leverage to prevent reporting.",
    severity: "high",
    status: "in-progress",
    category: "Ragging",
    date: "2024-03-02T14:30:00Z",
    organization: "CMR Engineering College",
    userId: "user-002"
  },
  {
    id: "SEC-8803",
    title: "Persistent Cyberstalking",
    description: "I am being tracked via my campus location. Anonymous messages on social media indicate they know exactly when I leave the library and which block I go to.",
    severity: "medium",
    status: "pending",
    category: "Harassment",
    date: "2024-03-03T09:15:00Z",
    organization: "CMR Engineering College",
    userId: "user-003"
  },
  {
    id: "SEC-8804",
    title: "Gender-based Exclusion",
    description: "I was explicitly told by the lab group lead that they 'don't want girls in the robotics team' because it's too technical. The TA witnessed this and did not intervene.",
    severity: "medium",
    status: "resolved",
    category: "Discrimination",
    date: "2024-03-04T16:45:00Z",
    organization: "VNR Vignana Jyothi Institute",
    userId: "user-004"
  },
  {
    id: "SEC-8805",
    title: "Unauthorized Wing Entry",
    description: "Two unidentified men were seen near the common room of the girls' hostel after 10 PM. The security protocols for that wing were not followed.",
    severity: "high",
    status: "pending",
    category: "Security",
    date: "2024-03-05T11:20:00Z",
    organization: "VNR Vignana Jyothi Institute",
    userId: "user-005"
  },
  {
    id: "SEC-8806",
    title: "Intimidation by Senior Batch",
    description: "Final-year students are intimidating juniors during project submissions, demanding that we 'pay our dues' by completing their documentation under threat of ragging.",
    severity: "high",
    status: "in-progress",
    category: "Ragging",
    date: "2024-03-06T08:00:00Z",
    organization: "Osmania University",
    userId: "user-006"
  },
  {
    id: "SEC-8807",
    title: "Inappropriate Touch in Lab",
    description: "The lab assistant repeatedly made me uncomfortable with physical proximity and inappropriate touching during the chemistry practicals today.",
    severity: "high",
    status: "in-progress",
    category: "Harassment",
    date: "2024-03-07T13:10:00Z",
    organization: "Osmania University",
    userId: "user-007"
  },
  {
    id: "SEC-8808",
    title: "Privacy Breach Claim",
    description: "There is suspicion of unauthorized monitoring devices in the private study areas of the library. Multiple students have noticed unusual equipment in the vents.",
    severity: "high",
    status: "pending",
    category: "Privacy",
    date: "2024-03-08T22:30:00Z",
    organization: "IIT Hyderabad",
    userId: "user-008"
  },
  {
    id: "SEC-8809",
    title: "Sexist Remarks in Classroom",
    description: "A faculty member consistently makes derogatory remarks about 'gender roles in science' and undermines the contributions of female students in open discussions.",
    severity: "medium",
    status: "resolved",
    category: "Discrimination",
    date: "2024-03-09T15:00:00Z",
    organization: "IIT Hyderabad",
    userId: "user-009"
  },
  {
    id: "SEC-8810",
    title: "Workplace Harassment",
    description: "During my internship at the campus research cell, my supervisor has been making unwanted sexual advances and pressuring me for personal favors.",
    severity: "high",
    status: "pending",
    category: "Harassment",
    date: "2024-03-10T10:30:00Z",
    organization: "ABC Company",
    userId: "user-010"
  },
  {
    id: "SEC-8811",
    title: "Threat after Reporting",
    description: "After reporting a minor harassment incident, I was followed to the bus stop and threatened with physical harm if I didn't withdraw the complaint.",
    severity: "high",
    status: "pending",
    category: "Security",
    date: "2024-03-11T19:00:00Z",
    organization: "ABC Company",
    userId: "user-011"
  },
  {
    id: "SEC-8812",
    title: "Verbal Abuse by Admin Staff",
    description: "The admin staff used sexist slurs when I requested a change in my hostel allotment. They were extremely loud and dismissive in front of other students.",
    severity: "low",
    status: "resolved",
    category: "Harassment",
    date: "2024-03-12T00:45:00Z",
    organization: "CMR Engineering College",
    userId: "user-012"
  },
  {
    id: "SEC-8813",
    title: "Systematic Bullying",
    description: "I am being targeted by a group of students in my class who share morphed photos and sexist jokes about me in various college-related WhatsApp groups.",
    severity: "medium",
    status: "in-progress",
    category: "Ragging",
    date: "2024-03-13T14:15:00Z",
    organization: "CMR Engineering College",
    userId: "user-013"
  },
  {
    id: "SEC-8814",
    title: "Poor Lighting in Corridors",
    description: "The corridors behind the girl's hostel are always dark after 7 PM. This creates a safety hazard as there have been reports of catcalling from the adjacent street.",
    severity: "low",
    status: "resolved",
    category: "Security",
    date: "2024-03-14T11:00:00Z",
    organization: "Osmania University",
    userId: "user-014"
  },
  {
    id: "SEC-8815",
    title: "Academic Intimidation",
    description: "A student from the same department is demanding access to my private research, threatening to use their 'departmental influence' to get me disqualified if I refuse.",
    severity: "medium",
    status: "pending",
    category: "Academic",
    date: "2024-03-15T12:00:00Z",
    organization: "VNR Vignana Jyothi Institute",
    userId: "user-015"
  }
];
