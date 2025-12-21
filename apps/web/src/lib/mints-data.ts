export interface MintDetails {
  name: string;
  slug: string;
  country: string;
  founded?: string;
  purity: string;
  specialties: string[];
  notableProducts: string[];
  description: string;
  gradient: string;
  website?: string;
  fullDescription?: string;
  history?: string;
  securityFeatures?: string[];
  popularSeries?: Array<{
    name: string;
    description: string;
  }>;
}

export const MINTS: MintDetails[] = [
  {
    name: 'PAMP Suisse',
    slug: 'pamp-suisse',
    country: 'Switzerland',
    founded: '1977',
    purity: '99.99%',
    specialties: ['Refining', 'Design Innovation', 'Certification'],
    notableProducts: [
      'Lady Fortuna Series',
      'Fortuna Gold Bars',
      'CertiPAMP Bars',
      'InGold Series',
    ],
    description:
      "One of the world's leading precious metals refiners, PAMP Suisse combines Swiss precision with artistic excellence. Known for their iconic Lady Fortuna design and innovative CertiPAMP technology, they set industry standards for quality and authenticity.",
    gradient: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
    website: 'https://www.pamp.com',
    fullDescription:
      "PAMP (Produits Artistiques Métaux Précieux) Suisse SA is one of the world's leading bullion brands and a member of the MKS PAMP GROUP. Established in 1977 in Ticino, Switzerland, PAMP has built an international reputation for the manufacture of the highest quality precious metals products.",
    history:
      'Founded in 1977, PAMP Suisse quickly became a pioneer in the precious metals industry. The company revolutionized the market with their innovative designs and was the first to introduce decorated investment bars with their iconic Lady Fortuna series.',
    securityFeatures: [
      'CertiPAMP™ packaging with Veriscan® technology',
      'Unique serial numbers',
      'Assay certification',
      'Holographic security features',
    ],
    popularSeries: [
      {
        name: 'Lady Fortuna',
        description:
          'The iconic Lady Fortuna design, representing the Roman goddess of fortune, has become synonymous with PAMP Suisse and is one of the most recognizable designs in precious metals.',
      },
      {
        name: 'Lunar Calendar',
        description:
          'Annual releases celebrating the Chinese Lunar Calendar with intricate designs representing each zodiac animal.',
      },
      {
        name: 'Religious Series',
        description:
          'Including Rosa Mystica and other designs celebrating various faiths and spiritual traditions.',
      },
    ],
  },
  {
    name: 'Royal Canadian Mint',
    slug: 'royal-canadian-mint',
    country: 'Canada',
    founded: '1908',
    purity: '99.99%',
    specialties: ['Government Backing', 'Maple Leaf Series', 'Security Features'],
    notableProducts: [
      'Gold Maple Leaf',
      'Silver Maple Leaf',
      'Platinum Maple Leaf',
      'Palladium Maple Leaf',
    ],
    description:
      "As a Crown corporation of Canada, the Royal Canadian Mint produces some of the world's most recognized bullion coins. Their Maple Leaf series features advanced security features and is backed by the Canadian government, ensuring exceptional quality and liquidity.",
    gradient: 'from-blue-500/20 via-indigo-500/20 to-blue-500/20',
    website: 'https://www.mint.ca',
    fullDescription:
      "The Royal Canadian Mint is the Crown corporation that produces all of Canada's circulation coins. One of the largest and most versatile mints in the world, it offers a wide range of specialized, high quality coinage products and related services on an international scale.",
    history:
      'Established by an act of Parliament in 1908, the Royal Canadian Mint began operations in Ottawa to refine gold and produce Canadian circulation coins. Over a century later, it remains at the forefront of innovation in precious metals.',
    securityFeatures: [
      'Bullion DNA™ anti-counterfeiting technology',
      'Radial lines on the field',
      'Micro-engraved laser marks',
      'Precise radial lines',
    ],
    popularSeries: [
      {
        name: 'Gold Maple Leaf',
        description:
          'The world-renowned Gold Maple Leaf coin, first introduced in 1979, is recognized globally for its .9999 fine gold purity.',
      },
      {
        name: 'Silver Maple Leaf',
        description:
          "One of the world's purest silver bullion coins at .9999 fine silver, featuring advanced security features.",
      },
      {
        name: 'Call of the Wild',
        description:
          'A series celebrating iconic Canadian wildlife with stunning designs and limited mintages.',
      },
    ],
  },
  {
    name: 'US Mint',
    slug: 'us-mint',
    country: 'United States',
    founded: '1792',
    purity: '99.99%',
    specialties: ['Legal Tender', 'Eagle Series', 'Buffalo Series'],
    notableProducts: [
      'American Gold Eagle',
      'American Silver Eagle',
      'American Buffalo',
      'Platinum Eagle',
    ],
    description:
      'The official mint of the United States, established by Congress in 1792. Produces legal tender bullion coins including the iconic American Eagle and American Buffalo series. These coins are recognized worldwide and carry the full faith and credit of the U.S. government.',
    gradient: 'from-purple-500/20 via-violet-500/20 to-purple-500/20',
    website: 'https://www.usmint.gov',
    fullDescription:
      'The United States Mint is a bureau of the Department of the Treasury responsible for producing coinage for the United States to conduct its trade and commerce, as well as controlling the movement of bullion.',
    history:
      'Established by the Coinage Act of 1792, the United States Mint is one of the oldest federal agencies. It has played a crucial role in American commerce and has adapted to changing needs throughout its history.',
    securityFeatures: [
      'Reeded edges',
      'Unique strike patterns',
      'Government backing and authentication',
      'Distinctive designs with high relief',
    ],
    popularSeries: [
      {
        name: 'American Eagle',
        description:
          'The flagship bullion coin series featuring Lady Liberty on the obverse and the American eagle on the reverse.',
      },
      {
        name: 'American Buffalo',
        description:
          'A 24-karat gold coin featuring the iconic Buffalo Nickel design by James Earle Fraser.',
      },
      {
        name: 'American Liberty',
        description:
          'A modern series celebrating American liberty with contemporary artistic designs.',
      },
    ],
  },
  {
    name: 'Perth Mint',
    slug: 'perth-mint',
    country: 'Australia',
    founded: '1899',
    purity: '99.99%',
    specialties: ['Kangaroo Series', 'Lunar Series', 'Government Backing'],
    notableProducts: ['Australian Kangaroo', 'Australian Koala', 'Lunar Series', 'Perth Mint Bars'],
    description:
      "Australia's oldest operating mint and a government enterprise of Western Australia. Known for innovative designs and the popular Kangaroo and Lunar series. Perth Mint products are backed by the Western Australian government and recognized globally for quality.",
    gradient: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
    website: 'https://www.perthmint.com',
    fullDescription:
      "The Perth Mint is Australia's official bullion mint and wholly owned by the Government of Western Australia. Established in 1899, it has over 120 years of expertise in precious metal products.",
    history:
      'Originally part of the British Royal Mint, the Perth Mint was established in 1899 to refine gold from the Western Australian goldfields. It is the only operating mint from the colonial era.',
    securityFeatures: [
      'Government of Western Australia guarantee',
      'Unique serial numbers on bars',
      'Authentication certificates',
      'Distinctive Perth Mint hallmark',
    ],
    popularSeries: [
      {
        name: 'Australian Kangaroo',
        description:
          'Annual releases featuring different kangaroo designs, first introduced in 1986 as the Australian Nugget.',
      },
      {
        name: 'Lunar Series',
        description:
          'Highly collectible coins celebrating the Chinese Lunar Calendar with intricate animal designs.',
      },
      {
        name: 'Australian Koala',
        description:
          "Annual silver coin series featuring Australia's beloved marsupial with changing designs each year.",
      },
    ],
  },
  {
    name: 'Valcambi',
    slug: 'valcambi',
    country: 'Switzerland',
    founded: '1961',
    purity: '99.99%',
    specialties: ['Combibars', 'Innovation', 'Swiss Quality'],
    notableProducts: ['Combibar Technology', 'Valcambi Gold Bars', 'Silver Bars', 'Platinum Bars'],
    description:
      'A premium Swiss refiner known for revolutionary products like the Combibar, a bar that can be broken into smaller units while maintaining individual assay certification. Valcambi combines Swiss precision with innovative design, making them a leader in flexible precious metals products.',
    gradient: 'from-amber-500/20 via-orange-500/20 to-amber-500/20',
    website: 'https://www.valcambi.com',
    fullDescription:
      "Valcambi SA is one of the world's leading refiners of precious metals, operating one of the most advanced refineries in the world. Located in Balerna, Switzerland, Valcambi is renowned for innovation and quality.",
    history:
      "Founded in 1961, Valcambi has grown to become one of Switzerland's premier precious metals refiners. The company revolutionized the industry with the introduction of the CombiBar in 2010.",
    securityFeatures: [
      'Assay certificates',
      'Serial number tracking',
      'CombiBar break-apart design with individual certifications',
      'Swiss quality hallmarks',
    ],
    popularSeries: [
      {
        name: 'CombiBar',
        description:
          'Revolutionary bar design that can be broken into smaller denominations without losing certification, offering maximum flexibility.',
      },
      {
        name: 'Suisse Gold Bars',
        description:
          'Classic Swiss gold bars ranging from 1 gram to 1 kilogram, known for exceptional quality.',
      },
    ],
  },
  {
    name: 'Credit Suisse',
    slug: 'credit-suisse',
    country: 'Switzerland',
    founded: '1856',
    purity: '99.99%',
    specialties: ['Banking Heritage', 'Classic Design', 'Global Recognition'],
    notableProducts: ['Credit Suisse Gold Bars', 'Credit Suisse Silver Bars', 'Platinum Bars'],
    description:
      "Backed by one of the world's most prestigious banks, Credit Suisse precious metals products represent Swiss quality and global trust. Their classic bar designs are among the most recognizable in the precious metals industry.",
    gradient: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
    website: 'https://www.credit-suisse.com',
    fullDescription:
      'Credit Suisse produces precious metals bars that are recognized and traded globally. With over 160 years of Swiss banking excellence, their precious metals division maintains the highest standards of quality and authenticity.',
    securityFeatures: [
      'Assay certification',
      'Serial numbers',
      'Credit Suisse hallmark',
      'Tamper-evident packaging',
    ],
  },
  {
    name: 'Johnson Matthey',
    slug: 'johnson-matthey',
    country: 'United Kingdom',
    founded: '1817',
    purity: '99.99%',
    specialties: ['Refining Heritage', 'Industrial Applications', 'Quality Standards'],
    notableProducts: ['JM Gold Bars', 'JM Silver Bars', 'Platinum Bars'],
    description:
      "With over 200 years of expertise in precious metals, Johnson Matthey is one of the world's most respected refiners. Their products are known for exceptional quality and are recognized globally in the precious metals market.",
    gradient: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
    website: 'https://www.matthey.com',
    fullDescription:
      'Johnson Matthey has been at the forefront of precious metals science and technology for over two centuries. While they discontinued retail bullion production, their legacy products remain highly sought after in the secondary market.',
    history:
      'Founded in 1817, Johnson Matthey became the official refiners to the Bank of England. Their expertise in precious metals science and refining set industry standards worldwide.',
  },
  {
    name: 'Heraeus',
    slug: 'heraeus',
    country: 'Germany',
    founded: '1851',
    purity: '99.99%',
    specialties: ['German Engineering', 'Industrial Precious Metals', 'Innovation'],
    notableProducts: ['Heraeus Gold Bars', 'Kinebars', 'Silver Bars'],
    description:
      'A German precious metals leader with over 170 years of expertise. Heraeus combines German engineering precision with innovative anti-counterfeiting technology, including their unique Kinebar design with holographic security features.',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
    website: 'https://www.heraeus.com',
    fullDescription:
      "Heraeus is a German technology group with a heritage spanning over 170 years. Their precious metals division is one of the world's largest producers of precious metals bars and is known for innovation in security features.",
    securityFeatures: [
      'Kinegram holographic technology',
      'Serial number verification system',
      'Assay certificates',
      'Advanced anti-counterfeiting measures',
    ],
  },
];

export const getMintBySlug = (slug: string): MintDetails | undefined => {
  return MINTS.find((mint) => mint.slug === slug);
};

export const getAllMintSlugs = (): string[] => {
  return MINTS.map((mint) => mint.slug);
};
