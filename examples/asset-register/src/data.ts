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
  related: string[];
};

export const devices: Record<string, Device> = {
  d1: {
    id: "d1",
    name: "MacBook Pro 16″",
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
};

export const services: Record<string, Service> = {
  s1: {
    id: "s1",
    name: "Microsoft 365 E5",
    provider: "co1",
    status: "Active",
    type: "SaaS",
    cost: "$12,000/yr",
    renewalDate: "2025-12-01",
    linkedDevices: ["d1", "d2", "d4"],
  },
  s2: {
    id: "s2",
    name: "AWS Infrastructure",
    provider: "co2",
    status: "Active",
    type: "IaaS",
    cost: "$8,500/mo",
    renewalDate: "2025-06-15",
    linkedDevices: ["d5"],
  },
  s3: {
    id: "s3",
    name: "Jira Software Cloud",
    provider: "co2",
    status: "Active",
    type: "SaaS",
    cost: "$3,200/yr",
    renewalDate: "2025-09-01",
    linkedDevices: [],
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
    linkedDevices: ["d5"],
  },
};

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
    devices: ["d5"],
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
};

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
};

export const reports: Record<string, Report> = {
  r1: {
    id: "r1",
    title: "Q4 Security Audit: Vulnerability Assessment",
    author: "David Kim",
    date: "2025-12-15",
    type: "Security",
    linkedServices: ["s1", "s2"],
    related: ["r2"],
  },
  r2: {
    id: "r2",
    title: "Cloud Cost Optimization Review",
    author: "Sarah Chen",
    date: "2025-11-28",
    type: "Cost Analysis",
    linkedServices: ["s2", "s5"],
    related: ["r1", "r3"],
  },
  r3: {
    id: "r3",
    title: "License Compliance: Annual Review",
    author: "Priya Sharma",
    date: "2026-01-10",
    type: "Compliance",
    linkedServices: ["s1", "s4"],
    related: ["r2"],
  },
};

export const deviceList = Object.values(devices);
export const serviceList = Object.values(services);
export const companyList = Object.values(companies);
export const userList = Object.values(users);
export const reportList = Object.values(reports);
