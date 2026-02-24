export type Client = {
  id: string;
  name: string;
  description: string;
  portfolioIds: string[];
};

export type Portfolio = {
  id: string;
  name: string;
  description: string;
  clientId: string;
  fundIds: string[];
};

export type Fund = {
  id: string;
  name: string;
  ticker: string;
  description: string;
  category: string;
  relatedFundIds: string[];
  researchIds: string[];
};

export type Research = {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  fundIds: string[];
};

export const clients: Record<string, Client> = {
  c1: {
    id: "c1",
    name: "Sarah Chen",
    description: "High net worth individual. Long-term growth focus with moderate risk tolerance.",
    portfolioIds: ["p1", "p2"],
  },
  c2: {
    id: "c2",
    name: "TechVentures LLC",
    description: "Corporate treasury account. Sector-concentrated strategy in technology.",
    portfolioIds: ["p3"],
  },
  c3: {
    id: "c3",
    name: "Dr. James Morton",
    description: "Retirement planning client. Conservative allocation shifting to income-focused.",
    portfolioIds: ["p4"],
  },
};

export const portfolios: Record<string, Portfolio> = {
  p1: {
    id: "p1",
    name: "Growth Portfolio",
    description: "Aggressive growth allocation targeting long-term capital appreciation.",
    clientId: "c1",
    fundIds: ["f1", "f3", "f5"],
  },
  p2: {
    id: "p2",
    name: "Conservative Income",
    description: "Income-generating fixed-income focus with capital preservation.",
    clientId: "c1",
    fundIds: ["f2", "f4"],
  },
  p3: {
    id: "p3",
    name: "Tech Sector Focus",
    description: "Concentrated technology sector exposure across growth and innovation themes.",
    clientId: "c2",
    fundIds: ["f3", "f5"],
  },
  p4: {
    id: "p4",
    name: "Balanced Retirement",
    description: "60/40 balanced allocation transitioning toward income as retirement approaches.",
    clientId: "c3",
    fundIds: ["f1", "f2", "f4"],
  },
};

export const funds: Record<string, Fund> = {
  f1: {
    id: "f1",
    name: "Vanguard Growth Index",
    ticker: "VIGAX",
    description: "Tracks the CRSP US Large Cap Growth Index. Low-cost broad market growth exposure.",
    category: "Large Cap Growth",
    relatedFundIds: ["f3", "f5"],
    researchIds: ["r1"],
  },
  f2: {
    id: "f2",
    name: "BlackRock Total Bond",
    ticker: "BKAGX",
    description: "Investment-grade US bond market exposure. Core fixed-income holding.",
    category: "Intermediate Bond",
    relatedFundIds: ["f4"],
    researchIds: ["r2"],
  },
  f3: {
    id: "f3",
    name: "Fidelity Tech Innovation",
    ticker: "FTECX",
    description: "Actively managed technology sector fund focused on AI and semiconductor themes.",
    category: "Technology",
    relatedFundIds: ["f1", "f5"],
    researchIds: ["r3"],
  },
  f4: {
    id: "f4",
    name: "PIMCO Total Return",
    ticker: "PTTRX",
    description: "Actively managed bond fund seeking maximum total return with capital preservation.",
    category: "Intermediate Bond",
    relatedFundIds: ["f2"],
    researchIds: ["r2", "r4"],
  },
  f5: {
    id: "f5",
    name: "ARK Innovation ETF",
    ticker: "ARKK",
    description: "Thematic ETF investing in disruptive innovation across genomics, AI, and fintech.",
    category: "Thematic Growth",
    relatedFundIds: ["f1", "f3"],
    researchIds: ["r1", "r3"],
  },
};

export const research: Record<string, Research> = {
  r1: {
    id: "r1",
    title: "Q4 Growth Equity Outlook",
    description:
      "Growth equities face headwinds from rising rates but AI-driven earnings revisions provide support. Overweight large-cap growth, selective on thematic.",
    author: "Maria Lopez, CFA",
    date: "2024-10-15",
    fundIds: ["f1", "f5"],
  },
  r2: {
    id: "r2",
    title: "Fixed Income Strategy Update",
    description:
      "Duration positioning favors intermediate maturities as the yield curve normalizes. Investment-grade spreads remain attractive relative to historical averages.",
    author: "David Park",
    date: "2024-11-01",
    fundIds: ["f2", "f4"],
  },
  r3: {
    id: "r3",
    title: "AI & Semiconductor Deep Dive",
    description:
      "Semiconductor capex cycle entering second phase driven by inference demand. Key beneficiaries in foundry and memory subsectors. Maintain overweight.",
    author: "Priya Sharma, PhD",
    date: "2024-11-20",
    fundIds: ["f3", "f5"],
  },
  r4: {
    id: "r4",
    title: "Emerging Markets Fixed Income",
    description:
      "Local currency EM debt offers compelling yield pickup. FX risks manageable with selective country exposure. Complement to core bond allocation.",
    author: "Carlos Rivera",
    date: "2024-12-05",
    fundIds: ["f4"],
  },
};

export const clientList = Object.values(clients);
export const portfolioList = Object.values(portfolios);
export const fundList = Object.values(funds);
export const researchList = Object.values(research);
