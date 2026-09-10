import { NewsProvider, NormalizedArticle } from './newsProvider.interface';

export class MockNewsProvider implements NewsProvider {
  name = 'mock';

  private mockDatabase: NormalizedArticle[] = [
    {
      externalId: 'mock_1',
      title: 'India Unveils State-of-the-Art AI Computing Infrastructure for Research',
      shortSummary: 'The Union Ministry of Electronics and IT announced the launch of a high-performance GPU cluster under the National AI Mission. The compute facility will provide open access to researchers, startups, and universities across India.',
      description: 'India expands national AI computing initiative with 10,000+ GPU supercomputer infrastructure.',
      content: 'India has officially deployed its state-of-the-art AI supercomputing stack under the IndiaAI Mission. The facility features over 10,000 high-performance accelerators, enabling domestic startups, academic institutions, and public research hubs to train large language models and foundation vision models locally.',
      sourceName: 'TechPulse India',
      sourceUrl: 'https://example.com/tech/india-ai-mission',
      articleUrl: 'https://example.com/tech/india-ai-mission',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      author: 'Aarav Sharma',
      publishedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      category: 'technology',
      tags: ['technology', 'ai', 'india', 'computing'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    },
    {
      externalId: 'mock_2',
      title: 'India vs Australia Test Series: Dynamic Century Powers India to Commanding Lead',
      shortSummary: 'A blistering century in the second innings has put India in total command on Day 3 of the deciding Test match. The middle order built a crucial 180-run partnership under pressure.',
      description: 'Cricket Test Match update: India establishes a 320-run lead against Australia.',
      content: 'In a thrilling day of Test match cricket, India built a formidable 320-run lead over Australia. The middle-order batter scored a masterful 124 off 160 balls, featuring 14 boundaries and two towering sixes to dismantle the opposition attack.',
      sourceName: 'CricPulse Express',
      sourceUrl: 'https://example.com/sports/ind-vs-aus-test-day3',
      articleUrl: 'https://example.com/sports/ind-vs-aus-test-day3',
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      author: 'Rohan Mehta',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      category: 'cricket',
      tags: ['cricket', 'sports', 'india', 'australia'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    },
    {
      externalId: 'mock_3',
      title: 'Global Markets Rally as Inflation Cools Down Below Target Thresholds',
      shortSummary: 'Stock markets across Asia and Europe gained over 1.5% following lower-than-expected inflation statistics. Technology and consumer energy stocks led the broad-based market rally today.',
      description: 'Global equity markets surge on positive economic data and cooling inflation figures.',
      content: 'Financial equity indices across Asia, Europe, and Wall Street futures registered significant gains today after key central bank data indicated inflation rates dropped to a 3-year low. Tech giants and renewable energy stocks recorded major inflows.',
      sourceName: 'Financial Chronicle',
      sourceUrl: 'https://example.com/business/global-markets-rally',
      articleUrl: 'https://example.com/business/global-markets-rally',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      author: 'Priya Iyer',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      category: 'business',
      tags: ['business', 'finance', 'markets', 'economy'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    },
    {
      externalId: 'mock_4',
      title: 'Generative AI Transformer Models Reach Breakthrough in Renewable Energy Grid Management',
      shortSummary: 'Researchers have published a milestone artificial intelligence architecture that optimizes smart electrical grid distribution in real-time, reducing transmission energy loss by up to 24%.',
      description: 'AI model optimizes clean energy distribution and grid efficiency.',
      content: 'A multi-institutional team of AI scientists and electrical engineers has unveiled a novel transformer architecture tailored for real-time power grid management. The model dynamically balances solar, wind, and battery reserves based on predictive micro-weather patterns.',
      sourceName: 'AI Science Daily',
      sourceUrl: 'https://example.com/ai/ai-grid-breakthrough',
      articleUrl: 'https://example.com/ai/ai-grid-breakthrough',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
      author: 'Dr. Vikram Patel',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      category: 'ai',
      tags: ['ai', 'technology', 'science', 'environment'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    },
    {
      externalId: 'mock_5',
      title: 'New Health Study Identifies Mediterranean Diet and 20-Minute Walks as Longevity Boosters',
      shortSummary: 'A 10-year comprehensive medical study tracking over 50,000 adults revealed that combining plant-rich diets with 20 minutes of daily physical activity reduces cardiovascular risks by 38%.',
      description: 'Medical research highlights key daily habits for heart health and active longevity.',
      content: 'Cardiovascular specialists and nutritionists have released findings from a decade-long health study emphasizing that moderate daily physical movement alongside nutrient-dense dietary choices significantly lowers arterial inflammation and improves cellular vitality.',
      sourceName: 'Health & Wellness Journal',
      sourceUrl: 'https://example.com/health/longevity-study-mediterranean',
      articleUrl: 'https://example.com/health/longevity-study-mediterranean',
      imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
      author: 'Dr. Ananya Roy',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      category: 'health',
      tags: ['health', 'lifestyle', 'wellness', 'science'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    },
    {
      externalId: 'mock_6',
      title: 'ISRO Prepares for Next-Generation Earth Observation Satellite Launch',
      shortSummary: 'The Indian Space Research Organisation has entered final integration testing for its upcoming hyperspectral imaging satellite designed to monitor agricultural yields and coastal ecosystems.',
      description: 'ISRO satellite mission set to deliver ultra-high resolution environmental mapping.',
      content: 'ISRO engineers at Sriharikota spaceport have successfully completed vibration and vacuum chamber testing for the EOS-08 hyperspectral satellite. The space asset will monitor ocean currents, forest canopy density, and crop health across the Indian subcontinent.',
      sourceName: 'Space & Defense Times',
      sourceUrl: 'https://example.com/science/isro-satellite-launch',
      articleUrl: 'https://example.com/science/isro-satellite-launch',
      imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80',
      author: 'Karan Joshi',
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      category: 'science',
      tags: ['science', 'india', 'space', 'technology'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    },
    {
      externalId: 'mock_7',
      title: 'National Education Policy Update: Coding and Practical AI Literacy Introduced in Schools',
      shortSummary: 'School curricula across secondary education institutions will integrate hands-on computational thinking, ethical AI guidelines, and project-based STEM modules starting this academic session.',
      description: 'Educational reforms bring practical technology skills to millions of school students.',
      content: 'The Ministry of Education has released updated curriculum frameworks introducing foundational algorithms, data privacy principles, and practical robotics workshops for classes 6 through 12 across central board schools.',
      sourceName: 'Education World India',
      sourceUrl: 'https://example.com/education/coding-ai-in-schools',
      articleUrl: 'https://example.com/education/coding-ai-in-schools',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      author: 'Suman Sen',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      category: 'education',
      tags: ['education', 'india', 'technology', 'ai'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    },
    {
      externalId: 'mock_8',
      title: 'Global Climate Summit Reaches Landmark Accord on Reforestation Funding',
      shortSummary: 'Delegates from 140 nations agreed on a multi-billion dollar conservation fund dedicated to preserving tropical rainforests and restoring degraded mangrove ecosystems worldwide.',
      description: 'International agreement secures major environmental funding for carbon sinks.',
      content: 'The UN Climate Summit concluded with a unanimous pledge to establish a global biodiversity fund. The capital will directly support indigenous community-led reforestation efforts in South America, Southeast Asia, and Africa.',
      sourceName: 'Planet Earth Digest',
      sourceUrl: 'https://example.com/environment/climate-summit-accord',
      articleUrl: 'https://example.com/environment/climate-summit-accord',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      author: 'Elena Rostova',
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
      category: 'environment',
      tags: ['environment', 'world', 'science'],
      language: 'en',
      country: 'in',
      provider: 'mock'
    }
  ];

  async fetchTopHeadlines(category: string = 'general'): Promise<NormalizedArticle[]> {
    if (category.toLowerCase() === 'general') {
      return this.mockDatabase;
    }
    return this.mockDatabase.filter(
      (a) => a.category.toLowerCase() === category.toLowerCase() || a.tags.includes(category.toLowerCase())
    );
  }

  async fetchNewsByCategory(category: string): Promise<NormalizedArticle[]> {
    return this.fetchTopHeadlines(category);
  }

  async searchNews(query: string): Promise<NormalizedArticle[]> {
    const q = query.toLowerCase();
    return this.mockDatabase.filter(
      (a) => a.title.toLowerCase().includes(q) || a.shortSummary.toLowerCase().includes(q)
    );
  }

  async fetchLatestNews(): Promise<NormalizedArticle[]> {
    return this.mockDatabase;
  }
}
