export type Device = {
  id: string;
  name: string;
  type: "Laptop" | "Desktop" | "Phone" | "Tablet" | "Server";
  status: "Active" | "Retired" | "Repair";
  assignedTo: string;
  company: string;
  serial: string;
  purchaseDate: string;
};

export type Service = {
  id: string;
  name: string;
  provider: string;
  status: "Active" | "Inactive";
  type: "SaaS" | "PaaS" | "IaaS" | "License";
  cost: string;
  renewalDate: string;
  linkedDevices: string[];
};

export type Company = {
  id: string;
  name: string;
  type: "Vendor" | "Client" | "Internal";
  contactName: string;
  contactEmail: string;
  users: string[];
  devices: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  devices: string[];
};

export type Report = {
  id: string;
  title: string;
  author: string;
  date: string;
  type: "Audit" | "Security" | "Cost Analysis" | "Compliance";
  linkedServices: string[];
  linkedDevices: string[];
  related: string[];
};

// ── Devices ──────────────────────────────────────────────

export const devices: Record<string, Device> = {
  d1: {
    id: "d1",
    name: "MacBook Pro 16\u2033",
    type: "Laptop",
    status: "Active",
    assignedTo: "u1",
    company: "co3",
    serial: "C02ZN1LYMD6T",
    purchaseDate: "2024-03-15",
  },
  d2: {
    id: "d2",
    name: "Dell OptiPlex 7090",
    type: "Desktop",
    status: "Active",
    assignedTo: "u2",
    company: "co1",
    serial: "DL-7090-4482",
    purchaseDate: "2023-11-20",
  },
  d3: {
    id: "d3",
    name: "iPhone 15 Pro",
    type: "Phone",
    status: "Active",
    assignedTo: "u1",
    company: "co3",
    serial: "F2LXK4FHGP",
    purchaseDate: "2024-09-22",
  },
  d4: {
    id: "d4",
    name: "ThinkPad X1 Carbon",
    type: "Laptop",
    status: "Repair",
    assignedTo: "u3",
    company: "co1",
    serial: "PF-3N8K2V",
    purchaseDate: "2022-06-10",
  },
  d5: {
    id: "d5",
    name: "HP ProLiant DL380",
    type: "Server",
    status: "Active",
    assignedTo: "u4",
    company: "co2",
    serial: "MXQ2340R9P",
    purchaseDate: "2023-01-05",
  },
  d6: {
    id: "d6",
    name: "iPad Air M2",
    type: "Tablet",
    status: "Retired",
    assignedTo: "u2",
    company: "co3",
    serial: "DMPXG5Q1HF",
    purchaseDate: "2021-08-30",
  },
  d7: {
    id: "d7",
    name: "Surface Pro 9",
    type: "Tablet",
    status: "Active",
    assignedTo: "u5",
    company: "co5",
    serial: "SP9-28KL4M",
    purchaseDate: "2024-07-12",
  },
  d8: {
    id: "d8",
    name: "Dell PowerEdge R750",
    type: "Server",
    status: "Active",
    assignedTo: "u6",
    company: "co2",
    serial: "PE-R750-9921",
    purchaseDate: "2024-01-18",
  },
};

// ── Services ─────────────────────────────────────────────

export const services: Record<string, Service> = {
  s1: {
    id: "s1",
    name: "Microsoft 365 E5",
    provider: "co1",
    status: "Active",
    type: "SaaS",
    cost: "$12,000/yr",
    renewalDate: "2025-12-01",
    linkedDevices: ["d1", "d2", "d4", "d7"],
  },
  s2: {
    id: "s2",
    name: "AWS Infrastructure",
    provider: "co2",
    status: "Active",
    type: "IaaS",
    cost: "$8,500/mo",
    renewalDate: "2025-06-15",
    linkedDevices: ["d5", "d8"],
  },
  s3: {
    id: "s3",
    name: "Jira Software Cloud",
    provider: "co2",
    status: "Active",
    type: "SaaS",
    cost: "$3,200/yr",
    renewalDate: "2025-09-01",
    linkedDevices: ["d1", "d2", "d7"],
  },
  s4: {
    id: "s4",
    name: "Adobe Creative Suite",
    provider: "co1",
    status: "Inactive",
    type: "License",
    cost: "$6,000/yr",
    renewalDate: "2024-11-30",
    linkedDevices: ["d1", "d2"],
  },
  s5: {
    id: "s5",
    name: "Cloudflare Pro",
    provider: "co2",
    status: "Active",
    type: "PaaS",
    cost: "$200/mo",
    renewalDate: "2025-03-01",
    linkedDevices: ["d5", "d8"],
  },
  s6: {
    id: "s6",
    name: "Slack Business+",
    provider: "co5",
    status: "Active",
    type: "SaaS",
    cost: "$4,800/yr",
    renewalDate: "2026-02-01",
    linkedDevices: ["d1", "d2", "d3", "d7"],
  },
  s7: {
    id: "s7",
    name: "GitHub Enterprise",
    provider: "co5",
    status: "Active",
    type: "SaaS",
    cost: "$9,600/yr",
    renewalDate: "2026-04-15",
    linkedDevices: ["d1", "d2", "d4", "d7", "d8"],
  },
  s8: {
    id: "s8",
    name: "Datadog Pro",
    provider: "co2",
    status: "Active",
    type: "PaaS",
    cost: "$1,200/mo",
    renewalDate: "2026-01-01",
    linkedDevices: ["d5", "d8"],
  },
};

// ── Companies ────────────────────────────────────────────

export const companies: Record<string, Company> = {
  co1: {
    id: "co1",
    name: "Dell Technologies",
    type: "Vendor",
    contactName: "Sarah Chen",
    contactEmail: "s.chen@dell.example.com",
    users: [],
    devices: ["d2", "d4"],
  },
  co2: {
    id: "co2",
    name: "Amazon Web Services",
    type: "Vendor",
    contactName: "James Morton",
    contactEmail: "j.morton@aws.example.com",
    users: [],
    devices: ["d5", "d8"],
  },
  co3: {
    id: "co3",
    name: "Acme Corp",
    type: "Internal",
    contactName: "Priya Sharma",
    contactEmail: "p.sharma@acme.example.com",
    users: ["u1", "u2", "u3", "u4"],
    devices: ["d1", "d3", "d6"],
  },
  co4: {
    id: "co4",
    name: "Globex Industries",
    type: "Client",
    contactName: "Carlos Rivera",
    contactEmail: "c.rivera@globex.example.com",
    users: [],
    devices: [],
  },
  co5: {
    id: "co5",
    name: "Initech Solutions",
    type: "Vendor",
    contactName: "Liam O'Brien",
    contactEmail: "l.obrien@initech.example.com",
    users: ["u5"],
    devices: ["d7"],
  },
  co6: {
    id: "co6",
    name: "Umbrella Corp",
    type: "Client",
    contactName: "Nina Petrova",
    contactEmail: "n.petrova@umbrella.example.com",
    users: ["u6"],
    devices: [],
  },
};

// ── Users ────────────────────────────────────────────────

export const users: Record<string, User> = {
  u1: {
    id: "u1",
    name: "Alice Johnson",
    email: "alice@acme.example.com",
    role: "Engineer",
    company: "co3",
    devices: ["d1", "d3"],
  },
  u2: {
    id: "u2",
    name: "Bob Martinez",
    email: "bob@acme.example.com",
    role: "Designer",
    company: "co3",
    devices: ["d2", "d6"],
  },
  u3: {
    id: "u3",
    name: "Carol Williams",
    email: "carol@acme.example.com",
    role: "Product Manager",
    company: "co3",
    devices: ["d4"],
  },
  u4: {
    id: "u4",
    name: "David Kim",
    email: "david@acme.example.com",
    role: "SysAdmin",
    company: "co3",
    devices: ["d5"],
  },
  u5: {
    id: "u5",
    name: "Eve Thompson",
    email: "eve@initech.example.com",
    role: "Security Analyst",
    company: "co5",
    devices: ["d7"],
  },
  u6: {
    id: "u6",
    name: "Frank Garcia",
    email: "frank@umbrella.example.com",
    role: "DevOps Engineer",
    company: "co6",
    devices: ["d8"],
  },
};

// ── Reports ──────────────────────────────────────────────

export const reports: Record<string, Report> = {
  r1: {
    id: "r1",
    title: "Q4 Security Audit: Vulnerability Assessment",
    author: "David Kim",
    date: "2025-12-15",
    type: "Security",
    linkedServices: ["s1", "s2"],
    linkedDevices: ["d1", "d2", "d5"],
    related: ["r2", "r5"],
  },
  r2: {
    id: "r2",
    title: "Cloud Cost Optimization Review",
    author: "Sarah Chen",
    date: "2025-11-28",
    type: "Cost Analysis",
    linkedServices: ["s2", "s5", "s8"],
    linkedDevices: ["d5", "d8"],
    related: ["r1", "r3", "r6"],
  },
  r3: {
    id: "r3",
    title: "License Compliance: Annual Review",
    author: "Priya Sharma",
    date: "2026-01-10",
    type: "Compliance",
    linkedServices: ["s1", "s4"],
    linkedDevices: ["d1", "d2", "d4"],
    related: ["r2", "r7"],
  },
  r4: {
    id: "r4",
    title: "Device Lifecycle Analysis",
    author: "Carol Williams",
    date: "2026-01-22",
    type: "Audit",
    linkedServices: ["s1", "s4"],
    linkedDevices: ["d1", "d4", "d6"],
    related: ["r3"],
  },
  r5: {
    id: "r5",
    title: "Infrastructure Security Review",
    author: "David Kim",
    date: "2026-02-01",
    type: "Security",
    linkedServices: ["s2", "s5", "s8"],
    linkedDevices: ["d5", "d8"],
    related: ["r1", "r2"],
  },
  r6: {
    id: "r6",
    title: "SaaS Spend Optimization",
    author: "Sarah Chen",
    date: "2026-02-10",
    type: "Cost Analysis",
    linkedServices: ["s1", "s3", "s6", "s7"],
    linkedDevices: ["d1", "d2", "d7"],
    related: ["r2"],
  },
  r7: {
    id: "r7",
    title: "Endpoint Compliance Check",
    author: "Eve Thompson",
    date: "2026-02-15",
    type: "Compliance",
    linkedServices: ["s1", "s7"],
    linkedDevices: ["d1", "d2", "d3", "d4", "d7"],
    related: ["r3", "r4"],
  },
  r8: {
    id: "r8",
    title: "Q1 Vendor Risk Assessment",
    author: "Liam O'Brien",
    date: "2026-02-20",
    type: "Audit",
    linkedServices: ["s2", "s5", "s7"],
    linkedDevices: ["d5", "d8"],
    related: ["r1", "r5"],
  },
};

// ── Derived lists ────────────────────────────────────────

export const deviceList = Object.values(devices);
export const serviceList = Object.values(services);
export const companyList = Object.values(companies);
export const userList = Object.values(users);
export const reportList = Object.values(reports);
