export type BudgetItem = { label: string; amount: number }

export type ProjectDocument = { label: string; file: string; kind: string }

export type Report = {
  slug: string
  title: string
  category: string
  date: string
  excerpt: string
  body: string[]
  image: string
  imageAlt: string
  location: { name: string; lat: number; lng: number }
  budget: { total: number; currency: string; items: BudgetItem[] }
  documents: ProjectDocument[]
  socials: { twitter?: string; facebook?: string; instagram?: string; youtube?: string }
  beneficiaries: number
}

export const REPORTS: Report[] = [
  {
    slug: 'clean-water-bayawan',
    title: 'Clean Water Well Brings Daily Relief to Bayawan',
    category: 'Water Systems',
    date: '2026-05-18',
    excerpt:
      'A deep-bore well and solar pump now serve 64 households that previously walked over an hour for safe water.',
    body: [
      'With one quarter of donated yield, we funded a deep-bore well, a solar-powered pump, and a community storage tank in a coastal barangay near Taytay, northern Palawan. The system delivers clean water to 64 households that previously relied on a contaminated creek more than an hour away on foot.',
      'A local water committee was trained to maintain the pump and manage a small upkeep fund, ensuring the system keeps running long after our team leaves. This is the heart of our teach-to-fish model: infrastructure plus ownership.',
      'Early results: reported cases of waterborne illness among children dropped sharply within the first month, and families reclaimed hours each day previously spent fetching water.',
    ],
    image: '/images/report-water.png',
    imageAlt:
      'Newly installed clean water well and pump in a rural Filipino village with families gathering water',
    location: { name: 'Taytay, Palawan', lat: 10.8131, lng: 119.5101 },
    budget: {
      total: 8400,
      currency: 'USDC',
      items: [
        { label: 'Deep-bore well drilling', amount: 3600 },
        { label: 'Solar pump & panels', amount: 2400 },
        { label: 'Storage tank & piping', amount: 1600 },
        { label: 'Committee training', amount: 800 },
      ],
    },
    documents: [
      {
        label: 'Impact report',
        file: '/docs/clean-water-bayawan-impact-report.txt',
        kind: 'TXT',
      },
      {
        label: 'Budget breakdown',
        file: '/docs/clean-water-bayawan-budget.txt',
        kind: 'TXT',
      },
    ],
    socials: {
      twitter: 'https://twitter.com',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
    },
    beneficiaries: 312,
  },
  {
    slug: 'livestock-tagbilaran',
    title: 'Goats & Poultry Start 18 Family Micro-Farms',
    category: 'Farming & Livestock',
    date: '2026-04-02',
    excerpt:
      'Breeding goats, laying hens, and feed kits give 18 families a renewable source of food and income.',
    body: [
      'In rural Roxas, central Palawan, yield funded a livestock starter program: breeding goats, laying hens, feed, and veterinary care for 18 families. Each household received training in animal husbandry and a simple record-keeping system to track births, eggs, and sales.',
      'The program is structured as a "pay-it-forward" herd — the first female offspring from each goat is passed to a new family, multiplying the impact without additional funding.',
      'Within eight weeks, families were selling surplus eggs at the local market, generating their first independent income from the project.',
    ],
    image: '/images/report-livestock.png',
    imageAlt:
      'Filipino farming family with newly donated goats and chickens on a small green farm',
    location: { name: 'Roxas, Palawan', lat: 10.3072, lng: 119.3447 },
    budget: {
      total: 6200,
      currency: 'USDC',
      items: [
        { label: 'Breeding goats (24)', amount: 3000 },
        { label: 'Laying hens & coops', amount: 1500 },
        { label: 'Feed & veterinary care', amount: 1100 },
        { label: 'Husbandry training', amount: 600 },
      ],
    },
    documents: [
      {
        label: 'Impact report',
        file: '/docs/livestock-tagbilaran-impact-report.txt',
        kind: 'TXT',
      },
      {
        label: 'Budget breakdown',
        file: '/docs/livestock-tagbilaran-budget.txt',
        kind: 'TXT',
      },
    ],
    socials: {
      twitter: 'https://twitter.com',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
    },
    beneficiaries: 96,
  },
  {
    slug: 'school-repair-tacloban',
    title: "Storm-Damaged Classroom Reopens in Brooke's Point",
    category: 'Education',
    date: '2026-02-21',
    excerpt:
      'Roof repairs, new desks, and learning materials return 140 students to a safe classroom.',
    body: [
      "After typhoon damage left an elementary classroom unusable, donated yield covered a new roof, structural repairs, 40 desks, and a full set of learning materials in Brooke's Point, southern Palawan. 140 students returned to safe, dry learning conditions.",
      'We partnered with the local parent-teacher association to oversee construction and verify spending, with every invoice published on-chain for full transparency.',
      'A small reserve was set aside for ongoing maintenance, managed jointly by the school and our local coordinator.',
    ],
    image: '/images/report-school.png',
    imageAlt:
      'Filipino schoolchildren in a newly repaired classroom with desks and books',
    location: { name: "Brooke's Point, Palawan", lat: 8.7811, lng: 117.8347 },
    budget: {
      total: 5100,
      currency: 'USDC',
      items: [
        { label: 'Roof & structural repair', amount: 2800 },
        { label: 'Desks & chairs (40)', amount: 1200 },
        { label: 'Books & supplies', amount: 700 },
        { label: 'Maintenance reserve', amount: 400 },
      ],
    },
    documents: [
      {
        label: 'Impact report',
        file: '/docs/school-repair-tacloban-impact-report.txt',
        kind: 'TXT',
      },
      {
        label: 'Budget breakdown',
        file: '/docs/school-repair-tacloban-budget.txt',
        kind: 'TXT',
      },
    ],
    socials: {
      twitter: 'https://twitter.com',
      facebook: 'https://facebook.com',
      youtube: 'https://youtube.com',
    },
    beneficiaries: 140,
  },
]

export function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`
}
