import { User, DEFAULT_PERMISSIONS } from '../models/user.model';
import { Transaction } from '../models/transaction.model';
import { Analysis } from '../models/analysis.model';

// ─── Users ────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    firstName: 'Byron',
    lastName: 'Quetsana',
    email: 'byron@quetsana.com',
    phone: '+502 5555-0001',
    position: 'CEO & Founder',
    role: 'admin',
    status: 'active',
    avatarInitials: 'BQ',
    avatarColor: '#8b1538',
    permissions: DEFAULT_PERMISSIONS['admin'],
    preferences: { language: 'es', theme: 'dark', emailNotifications: true, pushNotifications: true, timezone: 'America/Guatemala' },
    createdAt: '2023-01-15T08:00:00Z',
    lastLogin: '2026-04-08T07:45:00Z'
  },
  {
    id: 'usr-002',
    firstName: 'María',
    lastName: 'López',
    email: 'maria@quetsana.com',
    phone: '+502 5555-0002',
    position: 'Contadora',
    role: 'accountant',
    status: 'active',
    avatarInitials: 'ML',
    avatarColor: '#9b8ec4',
    permissions: DEFAULT_PERMISSIONS['accountant'],
    preferences: { language: 'es', theme: 'light', emailNotifications: true, pushNotifications: false, timezone: 'America/Guatemala' },
    createdAt: '2023-03-10T09:00:00Z',
    lastLogin: '2026-04-07T17:30:00Z'
  },
  {
    id: 'usr-003',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos@quetsana.com',
    phone: '+502 5555-0003',
    position: 'Gerente de Ventas',
    role: 'manager',
    status: 'active',
    avatarInitials: 'CM',
    avatarColor: '#c9a227',
    permissions: DEFAULT_PERMISSIONS['manager'],
    preferences: { language: 'es', theme: 'light', emailNotifications: true, pushNotifications: true, timezone: 'America/Guatemala' },
    createdAt: '2023-05-20T10:00:00Z',
    lastLogin: '2026-04-08T06:15:00Z'
  },
  {
    id: 'usr-004',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@quetsana.com',
    phone: '+502 5555-0004',
    position: 'Recepcionista',
    role: 'viewer',
    status: 'active',
    avatarInitials: 'AG',
    avatarColor: '#4a7c59',
    permissions: DEFAULT_PERMISSIONS['viewer'],
    preferences: { language: 'en', theme: 'light', emailNotifications: false, pushNotifications: false, timezone: 'America/Guatemala' },
    createdAt: '2024-01-08T08:30:00Z',
    lastLogin: '2026-04-06T14:00:00Z'
  },
  {
    id: 'usr-005',
    firstName: 'Roberto',
    lastName: 'Fuentes',
    email: 'roberto@quetsana.com',
    phone: '+502 5555-0005',
    position: 'Instructor',
    role: 'viewer',
    status: 'inactive',
    avatarInitials: 'RF',
    avatarColor: '#3b82f6',
    permissions: DEFAULT_PERMISSIONS['viewer'],
    preferences: { language: 'es', theme: 'dark', emailNotifications: false, pushNotifications: false, timezone: 'America/Guatemala' },
    createdAt: '2024-03-15T11:00:00Z',
    lastLogin: '2025-12-20T09:00:00Z'
  },
  {
    id: 'usr-006',
    firstName: 'Sofía',
    lastName: 'Ramírez',
    email: 'sofia@quetsana.com',
    phone: '+502 5555-0006',
    position: 'Asistente Contable',
    role: 'accountant',
    status: 'active',
    avatarInitials: 'SR',
    avatarColor: '#ef4444',
    permissions: DEFAULT_PERMISSIONS['accountant'],
    preferences: { language: 'es', theme: 'light', emailNotifications: true, pushNotifications: true, timezone: 'America/Guatemala' },
    createdAt: '2024-06-01T08:00:00Z',
    lastLogin: '2026-04-07T11:30:00Z'
  }
];

// ─── Transactions (12 months of data) ────────────────────────────
function makeId(prefix: string, n: number) { return `${prefix}-${String(n).padStart(4,'0')}`; }
function dateStr(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

const MONTHS_2025 = [1,2,3,4,5,6,7,8,9,10,11,12];

export const MOCK_TRANSACTIONS: Transaction[] = (() => {
  const txns: Transaction[] = [];
  let n = 1;

  for (const m of MONTHS_2025) {
    // Income: gym memberships
    const basicCount = 40 + Math.floor(Math.random()*20);
    const premiumCount = 18 + Math.floor(Math.random()*10);
    for (let i=0;i<basicCount;i++) {
      txns.push({ id: makeId('tx',n++), type:'income', amount:20, category:'gym_membership_basic',
        description:'Monthly gym membership - Basic plan', date: dateStr(2025,m,Math.ceil(Math.random()*28)),
        reference:`GYM-BASIC-${n}`, createdAt: dateStr(2025,m,1)+'T08:00:00Z', createdBy:'usr-001' });
    }
    for (let i=0;i<premiumCount;i++) {
      txns.push({ id: makeId('tx',n++), type:'income', amount:40, category:'gym_membership_premium',
        description:'Monthly gym membership - Premium plan', date: dateStr(2025,m,Math.ceil(Math.random()*28)),
        reference:`GYM-PREM-${n}`, createdAt: dateStr(2025,m,1)+'T08:00:00Z', createdBy:'usr-001' });
    }
    // Income: product sales
    const prodSales = 5 + Math.floor(Math.random()*8);
    for (let i=0;i<prodSales;i++) {
      const amt = [35,55,75,120,250][Math.floor(Math.random()*5)];
      txns.push({ id: makeId('tx',n++), type:'income', amount:amt, category:'product_sales',
        description:'Protein supplements & sportswear sale', date: dateStr(2025,m,Math.ceil(Math.random()*28)),
        reference:`PROD-${n}`, createdAt: dateStr(2025,m,5)+'T10:00:00Z', createdBy:'usr-003' });
    }
    // Income: services
    const svcSales = 2 + Math.floor(Math.random()*4);
    for (let i=0;i<svcSales;i++) {
      const amt = [80,150,200,300][Math.floor(Math.random()*4)];
      txns.push({ id: makeId('tx',n++), type:'income', amount:amt, category:'services',
        description:'Personal training & group classes', date: dateStr(2025,m,Math.ceil(Math.random()*28)),
        reference:`SVC-${n}`, createdAt: dateStr(2025,m,10)+'T14:00:00Z', createdBy:'usr-003' });
    }
    // Expenses
    txns.push({ id: makeId('tx',n++), type:'expense', amount:1500, category:'rent',
      description:'Monthly facility rent', date: dateStr(2025,m,1),
      reference:`RENT-${m}-2025`, createdAt: dateStr(2025,m,1)+'T09:00:00Z', createdBy:'usr-002' });
    const salaryBase = 2200 + Math.floor(Math.random()*200);
    txns.push({ id: makeId('tx',n++), type:'expense', amount:salaryBase, category:'salaries',
      description:'Staff salaries', date: dateStr(2025,m,28),
      reference:`SAL-${m}-2025`, createdAt: dateStr(2025,m,28)+'T17:00:00Z', createdBy:'usr-002' });
    const utilsAmt = 300 + Math.floor(Math.random()*100);
    txns.push({ id: makeId('tx',n++), type:'expense', amount:utilsAmt, category:'utilities',
      description:'Electricity, water & internet', date: dateStr(2025,m,15),
      reference:`UTIL-${m}-2025`, createdAt: dateStr(2025,m,15)+'T11:00:00Z', createdBy:'usr-002' });
    const suppAmt = 400 + Math.floor(Math.random()*200);
    txns.push({ id: makeId('tx',n++), type:'expense', amount:suppAmt, category:'suppliers',
      description:'Equipment & supplies purchase', date: dateStr(2025,m,10),
      reference:`SUPP-${m}-2025`, createdAt: dateStr(2025,m,10)+'T10:30:00Z', createdBy:'usr-001' });
    if (m % 3 === 0) {
      txns.push({ id: makeId('tx',n++), type:'expense', amount:180+Math.floor(Math.random()*120), category:'maintenance',
        description:'Equipment maintenance & repairs', date: dateStr(2025,m,20),
        reference:`MAINT-Q${Math.ceil(m/3)}-2025`, createdAt: dateStr(2025,m,20)+'T13:00:00Z', createdBy:'usr-001' });
    }
    if (m % 2 === 0) {
      txns.push({ id: makeId('tx',n++), type:'expense', amount:250+Math.floor(Math.random()*150), category:'marketing',
        description:'Social media & promotion', date: dateStr(2025,m,5),
        reference:`MKT-${m}-2025`, createdAt: dateStr(2025,m,5)+'T09:00:00Z', createdBy:'usr-003' });
    }
  }

  // Add some 2026 data (Jan-Apr)
  for (const m of [1,2,3,4]) {
    const basicCount = 48 + Math.floor(Math.random()*15);
    const premiumCount = 22 + Math.floor(Math.random()*8);
    for (let i=0;i<basicCount;i++) {
      txns.push({ id: makeId('tx',n++), type:'income', amount:20, category:'gym_membership_basic',
        description:'Monthly gym membership - Basic plan', date: dateStr(2026,m,Math.ceil(Math.random()*28)),
        reference:`GYM-BASIC-${n}`, createdAt: dateStr(2026,m,1)+'T08:00:00Z', createdBy:'usr-001' });
    }
    for (let i=0;i<premiumCount;i++) {
      txns.push({ id: makeId('tx',n++), type:'income', amount:40, category:'gym_membership_premium',
        description:'Monthly gym membership - Premium plan', date: dateStr(2026,m,Math.ceil(Math.random()*28)),
        reference:`GYM-PREM-${n}`, createdAt: dateStr(2026,m,1)+'T08:00:00Z', createdBy:'usr-001' });
    }
    const prodSales = 6 + Math.floor(Math.random()*8);
    for (let i=0;i<prodSales;i++) {
      const amt = [35,55,75,120,250][Math.floor(Math.random()*5)];
      txns.push({ id: makeId('tx',n++), type:'income', amount:amt, category:'product_sales',
        description:'Protein supplements & sportswear sale', date: dateStr(2026,m,Math.ceil(Math.random()*28)),
        reference:`PROD-${n}`, createdAt: dateStr(2026,m,5)+'T10:00:00Z', createdBy:'usr-003' });
    }
    txns.push({ id: makeId('tx',n++), type:'expense', amount:1500, category:'rent',
      description:'Monthly facility rent', date: dateStr(2026,m,1),
      reference:`RENT-${m}-2026`, createdAt: dateStr(2026,m,1)+'T09:00:00Z', createdBy:'usr-002' });
    txns.push({ id: makeId('tx',n++), type:'expense', amount:2300+Math.floor(Math.random()*200), category:'salaries',
      description:'Staff salaries', date: dateStr(2026,m,28),
      reference:`SAL-${m}-2026`, createdAt: dateStr(2026,m,28)+'T17:00:00Z', createdBy:'usr-002' });
    txns.push({ id: makeId('tx',n++), type:'expense', amount:320+Math.floor(Math.random()*80), category:'utilities',
      description:'Electricity, water & internet', date: dateStr(2026,m,15),
      reference:`UTIL-${m}-2026`, createdAt: dateStr(2026,m,15)+'T11:00:00Z', createdBy:'usr-002' });
    txns.push({ id: makeId('tx',n++), type:'expense', amount:450+Math.floor(Math.random()*150), category:'suppliers',
      description:'Equipment & supplies purchase', date: dateStr(2026,m,10),
      reference:`SUPP-${m}-2026`, createdAt: dateStr(2026,m,10)+'T10:30:00Z', createdBy:'usr-001' });
  }

  return txns.sort((a,b) => b.date.localeCompare(a.date));
})();

// ─── AI Analyses ─────────────────────────────────────────────────
export const MOCK_ANALYSES: Analysis[] = [
  {
    id: 'an-001', type:'monthly', period:'2026-04', periodLabel:'April 2026',
    metrics: { totalRevenue:5840, totalCosts:4620, netProfit:1220, profitMargin:20.9,
      topCategory:'gym_membership_premium', topCategoryRevenue:1080,
      transactionCount:89, avgTransactionValue:65.6,
      categoryBreakdown: {
        gym_membership_basic:   { revenue:960, costs:0, count:48 },
        gym_membership_premium: { revenue:1080, costs:0, count:27 },
        product_sales:          { revenue:1120, costs:680, count:14 },
        services:               { revenue:680, costs:0, count:8 },
        salaries:               { revenue:0, costs:2300, count:1 },
        rent:                   { revenue:0, costs:1500, count:1 },
        utilities:              { revenue:0, costs:350, count:1 },
        suppliers:              { revenue:0, costs:470, count:1 }
      }
    },
    llmMessage: `**April 2026 Financial Analysis**\n\nYour gym is showing solid performance this month with a net profit of **$1,220** (20.9% margin). The membership base continues to grow, with premium memberships contributing the highest revenue at $1,080 across 27 members.\n\n**Key Observations:**\n- Basic gym memberships remain your volume driver with 48 active members at $20/month\n- Product sales are performing well at $1,120, though COGS ($680) should be monitored\n- Operating costs are stable with salaries and rent comprising 83% of expenses\n\n**Concerning Areas:**\n- Utility costs increased slightly (+9% vs March)\n- Supplier expenses are at a higher end this month\n\nOverall, April is trending positively. Consider running a premium membership promotion to convert more basic members and increase the revenue per customer ratio.`,
    insights: [
      'Premium memberships revenue grew 12% vs March',
      'Product sales margin at 39.3% — consider high-margin items',
      'Membership retention rate estimated at 87%',
      'Revenue per active member: ~$48/month'
    ],
    recommendations: [
      'Launch premium tier promotion targeting basic members',
      'Negotiate bulk supplier discount to reduce COGS',
      'Analyze utility peak hours to reduce electricity costs',
      'Introduce quarterly membership packages for cashflow stability'
    ],
    profitabilityScore: 72, riskLevel:'low', trend:'up', trendPercentage:8.4,
    createdAt:'2026-04-08T06:00:00Z'
  },
  {
    id: 'an-002', type:'monthly', period:'2026-03', periodLabel:'March 2026',
    metrics: { totalRevenue:5380, totalCosts:4550, netProfit:830, profitMargin:15.4,
      topCategory:'gym_membership_basic', topCategoryRevenue:880,
      transactionCount:82, avgTransactionValue:65.6,
      categoryBreakdown: {
        gym_membership_basic:   { revenue:880, costs:0, count:44 },
        gym_membership_premium: { revenue:960, costs:0, count:24 },
        product_sales:          { revenue:950, costs:600, count:12 },
        services:               { revenue:590, costs:0, count:7 },
        salaries:               { revenue:0, costs:2350, count:1 },
        rent:                   { revenue:0, costs:1500, count:1 },
        utilities:              { revenue:0, costs:320, count:1 },
        suppliers:              { revenue:0, costs:480, count:1 }
      }
    },
    llmMessage: `**March 2026 Financial Analysis**\n\nMarch showed moderate performance with a net profit of **$830** (15.4% margin). While revenue grew compared to February, the slight increase in salary costs impacted the bottom line.\n\n**Key Observations:**\n- Basic memberships remain the backbone with 44 active members\n- Service revenue (personal training) was below potential at $590\n- Equipment maintenance this quarter added an extra $280 to expenses\n\n**Opportunities:**\n- Service capacity appears underutilized — trainers could handle 20% more clients\n- Premium membership conversions are trending upward (24 vs 22 in February)\n\nRecommend focusing on service upselling and optimizing the schedule to maximize trainer utilization.`,
    insights: [
      'Service revenue underperforming vs capacity',
      'Premium membership conversions trending up (+9%)',
      'Quarterly maintenance expense properly accounted',
      'Salary increase of 2.2% is within acceptable range'
    ],
    recommendations: [
      'Optimize trainer scheduling to increase service revenue',
      'Target 30 premium memberships by end of Q2 2026',
      'Review maintenance schedule to batch repairs cost-effectively',
      'Consider group class expansion to increase service capacity'
    ],
    profitabilityScore: 58, riskLevel:'medium', trend:'stable', trendPercentage:2.1,
    createdAt:'2026-04-01T06:00:00Z'
  },
  {
    id: 'an-003', type:'weekly', period:'2026-W14', periodLabel:'Week 14 (Apr 1-7)',
    metrics: { totalRevenue:1420, totalCosts:980, netProfit:440, profitMargin:31,
      topCategory:'gym_membership_premium', topCategoryRevenue:480,
      transactionCount:22, avgTransactionValue:64.5,
      categoryBreakdown: {
        gym_membership_basic:   { revenue:240, costs:0, count:12 },
        gym_membership_premium: { revenue:480, costs:0, count:12 },
        product_sales:          { revenue:450, costs:280, count:6 },
        services:               { revenue:250, costs:0, count:3 },
        suppliers:              { revenue:0, costs:470, count:1 },
        utilities:              { revenue:0, costs:0, count:0 },
        maintenance:            { revenue:0, costs:230, count:1 }
      }
    },
    llmMessage: `**Week 14 (Apr 1–7) Weekly Snapshot**\n\nStrong week with **$440 net profit** and a healthy 31% margin. Premium membership renewals drove most of the weekly revenue, with product sales also performing well.\n\nNotable: maintenance expense this week ($230) is a one-time quarterly item and does not reflect recurring costs. Excluding maintenance, the margin would be ~46%.`,
    insights: [
      'Best weekly margin in Q2 so far (31%)',
      'Maintenance expense is quarterly — not recurring',
      'Premium renewals peaked mid-week (Tuesday–Wednesday)',
      'Product sales trending toward monthly record'
    ],
    recommendations: [
      'Capitalize on mid-week traffic for membership renewals',
      'Stock up on best-selling products before weekend',
      'Schedule marketing campaigns for peak renewal days'
    ],
    profitabilityScore: 78, riskLevel:'low', trend:'up', trendPercentage:15.2,
    createdAt:'2026-04-07T20:00:00Z'
  },
  {
    id: 'an-004', type:'daily', period:'2026-04-07', periodLabel:'April 7, 2026',
    metrics: { totalRevenue:340, totalCosts:0, netProfit:340, profitMargin:100,
      topCategory:'gym_membership_premium', topCategoryRevenue:160,
      transactionCount:9, avgTransactionValue:37.8,
      categoryBreakdown: {
        gym_membership_basic:   { revenue:80, costs:0, count:4 },
        gym_membership_premium: { revenue:160, costs:0, count:4 },
        product_sales:          { revenue:75, costs:0, count:1 },
        services:               { revenue:25, costs:0, count:1 }
      }
    },
    llmMessage: `**Daily Report: April 7, 2026 (Monday)**\n\nGood start to the week with **$340 in revenue** and no expense transactions recorded today. 9 transactions processed — typical for a Monday which tends to be a peak renewal day.\n\n4 premium memberships + 4 basic memberships renewed, plus a product sale and one service payment. Revenue composition is healthy with memberships at 71% and products/services at 29%.`,
    insights: [
      'Monday is historically top renewal day',
      'No expense transactions today — good cashflow day',
      'Membership renewal rate on track for April target',
      'Product sale margin appears strong ($75 single sale)'
    ],
    recommendations: [
      'Send renewal reminders on Sunday evenings for Monday traffic',
      'Ensure product inventory is stocked for week ahead',
      'Follow up with lapsed members due this week'
    ],
    profitabilityScore: 95, riskLevel:'low', trend:'up', trendPercentage:5.0,
    createdAt:'2026-04-07T23:00:00Z'
  },
  {
    id: 'an-005', type:'monthly', period:'2025-12', periodLabel:'December 2025',
    metrics: { totalRevenue:6120, totalCosts:5100, netProfit:1020, profitMargin:16.7,
      topCategory:'gym_membership_basic', topCategoryRevenue:1040,
      transactionCount:95, avgTransactionValue:64.4,
      categoryBreakdown: {
        gym_membership_basic:   { revenue:1040, costs:0, count:52 },
        gym_membership_premium: { revenue:1080, costs:0, count:27 },
        product_sales:          { revenue:1800, costs:1100, count:22 },
        services:               { revenue:1200, costs:0, count:14 },
        salaries:               { revenue:0, costs:2400, count:1 },
        rent:                   { revenue:0, costs:1500, count:1 },
        utilities:              { revenue:0, costs:380, count:1 },
        suppliers:              { revenue:0, costs:820, count:1 }
      }
    },
    llmMessage: `**December 2025 — Year-End Report**\n\nDecember was your strongest service month of 2025 with $1,200 in personal training revenue. Holiday product sales drove $1,800 in revenue, though COGS were also elevated.\n\n**Annual Perspective:** 2025 was a growth year. Total estimated annual revenue ~$58,000, with an average monthly profit of ~$900. The business is stable and showing signs of scaling readiness.\n\n**Year-End Recommendations:** Review pricing for premium memberships (no increase since launch), invest in marketing Q1 2026 to capture New Year resolution members, and consider expanding service offerings.`,
    insights: [
      'Holiday season drove 58% more product sales vs average',
      'Service revenue hit annual high in December',
      'Year-over-year membership growth estimated at 18%',
      'Q4 2025 was the most profitable quarter'
    ],
    recommendations: [
      'Increase premium membership price to $45 in Q1 2026',
      'Launch January "New Year" membership campaign',
      'Expand personal training slots in Q1',
      'Diversify suppliers to reduce COGS on products'
    ],
    profitabilityScore: 65, riskLevel:'low', trend:'up', trendPercentage:22.3,
    createdAt:'2026-01-02T06:00:00Z'
  }
];
