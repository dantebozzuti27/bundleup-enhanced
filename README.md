# BundleUp - Intent-to-Solution Engine

AI-powered problem-solving platform that transforms complex purchasing goals into optimized, compatible solutions.

## 🎯 What Makes This Different?

**Traditional Search**: "home theater receiver" → 10,000 links
**ChatGPT**: "home theater receiver" → Information and advice
**Amazon**: "home theater receiver" → Products to buy

**BundleUp**: "build a home theater" → **Complete, optimized, compatible solution ready to purchase**

## 🏗️ Architecture

```
User Goal → AI Intent Parser → Roadmap Generator → Product Search → 
Spec Normalization → Compatibility Check → Multi-Objective Optimization → 
Ranked Solutions
```

### Core Components

1. **Intent Parser** - Decomposes goals into structured requirements
2. **Roadmap Generator** - Creates ordered solution blueprints
3. **Catalog Adapter** - Searches products with spec extraction
4. **Spec Normalizer** - Standardizes product specifications
5. **Compatibility Checker** - Validates product combinations
6. **Optimization Engine** - Multi-objective ranking (price, quality, compatibility)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- Anthropic API key (Claude)
- Serper API key (Google Shopping)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/bundleup-enhanced.git
cd bundleup-enhanced

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Set up database
npm run setup-db

# Run development server
npm run dev
```

Visit http://localhost:3000/solution-engine to see the full workflow.

### Environment Variables

```env
# Supabase (free tier at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude API (from console.anthropic.com)
ANTHROPIC_API_KEY=your_anthropic_key

# Serper API (from serper.dev)
SERPER_API_KEY=your_serper_key
```

## 📊 Database Schema

Run the migration to set up all tables:

```bash
psql -h your-supabase-host -U postgres -d postgres -f supabase/schema.sql
```

Tables created:
- `users` & `user_preferences` - User profiles
- `product_categories` - Product taxonomy
- `compatibility_rules` - Compatibility graph
- `project_templates` - Solution templates
- `heuristics` - Knowledge base
- `product_cache` - Cached product data
- `user_roadmaps` - Generated roadmaps
- `solution_alternatives` - Optimized bundles
- `conversion_events` - Telemetry

## 🎮 Usage

### Simple API Usage

```javascript
// 1. Parse user intent
const intent = await fetch('/api/parse-intent', {
  method: 'POST',
  body: JSON.stringify({ userIntent: 'build a home theater' })
});

// 2. Generate roadmap
const roadmap = await fetch('/api/generate-roadmap', {
  method: 'POST',
  body: JSON.stringify({ parsedIntent: intent.parsedIntent })
});

// 3. Get optimized solutions
const solutions = await fetch('/api/search-and-optimize', {
  method: 'POST',
  body: JSON.stringify({ roadmap: roadmap.roadmap })
});
```

### Full UI Demo

Visit `/solution-engine` for a complete demonstration of the Intent-to-Solution workflow.

## 🎯 Use Cases

### Home Theater Systems
- Validates HDMI compatibility
- Checks speaker impedance matching
- Ensures receiver can power speakers
- Finds complete systems that work together

### Gaming PCs
- Validates GPU/CPU compatibility
- Checks power supply requirements
- Ensures monitor refresh rate support
- Optimizes for different budgets

### DIY Projects
- Generates material checklists
- Finds bulk purchasing opportunities
- Optimizes delivery from single retailers
- Ensures tool compatibility

## 📈 Performance

| Metric | Time | Cost |
|--------|------|------|
| Intent parsing | 8-10s | $0.05 |
| Roadmap generation | 2s | $0.01 |
| Product search | 3-5s | $0.02 |
| Compatibility check | 1s | $0.00 |
| Optimization | 2s | $0.00 |
| **Total** | **15-20s** | **$0.08** |

## 💰 Monetization

### Revenue Streams
- Affiliate commissions (4% average)
- Premium features ($9.99/month)
- White-label licensing
- B2B API access

### Break-Even
- Cost per user: $0.08
- Revenue per purchase: $20 (4% of $500)
- **Break-even: 1 purchase per 250 searches**

## 🔧 Development

### Project Structure

```
bundleup-enhanced/
├── app/
│   ├── api/
│   │   ├── parse-intent/
│   │   ├── generate-roadmap/
│   │   └── search-and-optimize/
│   ├── solution-engine/
│   └── page.js
├── lib/
│   ├── intent-parser.js
│   ├── roadmap-generator.js
│   ├── catalog-adapter.js
│   ├── spec-normalizer.js
│   ├── compatibility-checker.js
│   └── optimization-engine.js
├── supabase/
│   └── schema.sql
└── INTEGRATION_GUIDE.md
```

### Adding New Product Categories

1. Add category to `product_categories` table
2. Define required specs (HDMI version, impedance, etc.)
3. Add compatibility rules
4. Create project template
5. Test with sample intent

### Testing

```bash
# Test intent parsing
curl -X POST http://localhost:3000/api/parse-intent \
  -H "Content-Type: application/json" \
  -d '{"userIntent":"build a gaming PC for 4K"}'

# Run full workflow test
npm run test:workflow
```

## 📚 Documentation

- [Integration Guide](./INTEGRATION_GUIDE.md) - Complete implementation guide
- [API Reference](./docs/API.md) - Endpoint documentation
- [Architecture Deep Dive](./docs/ARCHITECTURE.md) - System design

## 🎓 Key Innovations

1. **Intent Decomposition**: LLM-powered understanding of complex goals
2. **Spec Normalization**: Standardizes product data across retailers
3. **Compatibility Graph**: Knowledge base of product relationships
4. **Multi-Objective Optimization**: Pareto-optimal solutions
5. **Explainable Results**: Clear tradeoffs and recommendations

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Setup
1. Add all API keys to Vercel project settings
2. Connect Supabase database
3. Deploy schema to Supabase
4. Test production endpoints

## 📊 Analytics & Monitoring

Track key metrics:
- Intent → Solution conversion rate
- Average solution quality score
- User preference patterns
- Compatibility issue frequency
- Bundle optimization improvements

## 🛣️ Roadmap

### Phase 1: MVP ✅
- Core architecture
- Home theater category
- Basic UI

### Phase 2: Expansion (Q1 2025)
- 5 additional categories
- User accounts
- Saved projects
- Price tracking

### Phase 3: Intelligence (Q2 2025)
- ML-powered recommendations
- Automatic heuristic learning
- Personalized optimization
- Community reviews

### Phase 4: Scale (Q3 2025)
- API for third parties
- White-label solution
- Enterprise features
- Global expansion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Anthropic Claude for AI capabilities
- Serper.dev for product search
- Supabase for database infrastructure
- Next.js team for framework

## 💬 Support

- GitHub Issues: Report bugs or request features
- Discord: Join our community
- Email: support@bundleup.com

---

Built with ❤️ to solve complex purchasing decisions

**"The first AI-powered search engine that solves problems, not just finds links"**
