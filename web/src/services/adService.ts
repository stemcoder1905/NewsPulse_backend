export interface TargetedAd {
  id: string;
  category: string;
  headline: string;
  tagline: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  sponsorName: string;
  sponsorUrl: string;
  badgeColor: string;
}

export const TARGETED_ADS: Record<string, TargetedAd[]> = {
  cricket: [
    {
      id: 'ad_cricket_1',
      category: 'cricket',
      headline: 'Official Team India Match Jersey 2026',
      tagline: 'Wear Your Passion with Pride',
      description: 'Get 40% OFF on the official fan jersey with breathable Dri-FIT technology. Free shipping across India.',
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Shop Jersey Now',
      sponsorName: 'FanGear India',
      sponsorUrl: 'https://example.com/cricket-jersey',
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'ad_cricket_2',
      category: 'cricket',
      headline: 'Play Fantasy Cricket & Win ₹1 Crore Daily',
      tagline: 'India’s #1 Premier Fantasy League',
      description: 'Use your cricket knowledge to draft your dream XI and win real cash rewards every matchday!',
      imageUrl: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Join League with ₹500 Bonus',
      sponsorName: 'DreamPlay Arena',
      sponsorUrl: 'https://example.com/fantasy-cricket',
      badgeColor: 'bg-blue-500'
    }
  ],
  technology: [
    {
      id: 'ad_tech_1',
      category: 'technology',
      headline: 'ProBook Neural X15 - Built for Next-Gen AI',
      tagline: 'Snapdragon X Elite • 45 TOPS NPU • 24hr Battery',
      description: 'Supercharge your coding, deep learning, and creative workflow with on-device AI acceleration.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Pre-Order with $200 Discount',
      sponsorName: 'NovaTech Devices',
      sponsorUrl: 'https://example.com/probook-ai',
      badgeColor: 'bg-indigo-500'
    },
    {
      id: 'ad_tech_2',
      category: 'technology',
      headline: 'Deploy Full-Stack AI Apps in Seconds',
      tagline: 'CloudScale Global Serverless Platform',
      description: 'Get $200 free cloud credits. Instant Postgres, Redis caching, and edge functions ready for production.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Claim $200 Free Credits',
      sponsorName: 'CloudScale AI',
      sponsorUrl: 'https://example.com/cloudscale',
      badgeColor: 'bg-purple-500'
    }
  ],
  business: [
    {
      id: 'ad_biz_1',
      category: 'business',
      headline: 'Zero-Brokerage Equity Trading & Smart SIPs',
      tagline: 'Grow Your Wealth with AI Portfolio Insights',
      description: 'Join over 10 million investors building generational wealth with zero commission on mutual funds.',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Open Free Demat Account',
      sponsorName: 'WealthVest Capital',
      sponsorUrl: 'https://example.com/invest',
      badgeColor: 'bg-emerald-600'
    }
  ],
  education: [
    {
      id: 'ad_edu_1',
      category: 'education',
      headline: 'Accelerated Master’s in AI & Data Science',
      tagline: 'Top 50 Global University Online Degree',
      description: 'Gain hands-on expertise in Machine Learning, Neural Networks, and Big Data. 100% placement support.',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Download Curriculum & Apply',
      sponsorName: 'Global Tech Institute',
      sponsorUrl: 'https://example.com/masters-ai',
      badgeColor: 'bg-amber-500'
    }
  ],
  politics: [
    {
      id: 'ad_pol_1',
      category: 'politics',
      headline: 'The Global Geopolitics & Policy Quarterly',
      tagline: 'Unfiltered Strategic Insights from World Diplomats',
      description: 'Get unlimited digital access to in-depth investigative reports and international policy analyses.',
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Try 3 Months for ₹99',
      sponsorName: 'Global Affairs Review',
      sponsorUrl: 'https://example.com/geopolitics',
      badgeColor: 'bg-rose-500'
    }
  ],
  health: [
    {
      id: 'ad_health_1',
      category: 'health',
      headline: 'Complete Comprehensive Full Body Checkup',
      tagline: '85+ Critical Parameters at Your Doorstep',
      description: 'Certified phlebotomist home visit with 100% accurate NABL-accredited digital report within 12 hours.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Book Checkup @ 60% Off',
      sponsorName: 'MediCare Labs',
      sponsorUrl: 'https://example.com/health-checkup',
      badgeColor: 'bg-teal-500'
    }
  ],
  general: [
    {
      id: 'ad_gen_1',
      category: 'general',
      headline: 'NewsPulse Premium Subscription',
      tagline: 'Distraction-Free News with AI Summaries & Audio',
      description: 'Listen to articles on the go, bypass paywalls, and enjoy an ad-lite experience tailored to your day.',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=75',
      ctaText: 'Start 30-Day Free Trial',
      sponsorName: 'NewsPulse Plus',
      sponsorUrl: 'https://example.com/premium',
      badgeColor: 'bg-emerald-500'
    }
  ]
};

export function getTargetedAdForCategory(topCategory?: string): TargetedAd {
  if (topCategory) {
    const key = topCategory.toLowerCase();
    if (TARGETED_ADS[key] && TARGETED_ADS[key].length > 0) {
      const ads = TARGETED_ADS[key];
      return ads[Math.floor(Math.random() * ads.length)];
    }

    if (key.includes('tech') || key.includes('ai')) {
      return TARGETED_ADS.technology[0];
    }
    if (key.includes('sport') || key.includes('cricket')) {
      return TARGETED_ADS.cricket[0];
    }
    if (key.includes('biz') || key.includes('finance') || key.includes('market') || key.includes('india')) {
      return TARGETED_ADS.business[0];
    }
    if (key.includes('edu') || key.includes('school')) {
      return TARGETED_ADS.education[0];
    }
    if (key.includes('politic') || key.includes('world')) {
      return TARGETED_ADS.politics[0];
    }
    if (key.includes('health') || key.includes('science') || key.includes('environment')) {
      return TARGETED_ADS.health[0];
    }
  }

  return TARGETED_ADS.general[0];
}

