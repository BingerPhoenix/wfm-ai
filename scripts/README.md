# WFM.ai Data Generation Scripts

This directory contains Python scripts for generating realistic synthetic contact center data for the WFM.ai prototype.

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. **Generate Data**:
   ```bash
   python scripts/generate_synthetic_data.py
   ```

3. **Data Files Created**:
   All files are saved to `public/data/`:
   - `historical_volume.json` - 12 months of hourly contact volumes
   - `deflection_history.json` - AI deflection improvements over time
   - `staffing_schedules.json` - Daily staffing with PTO/sick/training
   - `sla_performance.json` - Daily SLA performance tracking
   - `cost_data.json` - Cost analysis and industry benchmarks
   - `summary_stats.json` - Key metrics and insights

## 📊 Generated Data Features

### **Realistic Patterns**
- **Hourly**: Peak at 10-11am and 2-3pm, low evenings
- **Daily**: Higher Mon/Tue, lower weekends
- **Monthly**: January post-holiday spike, summer dips, November peaks
- **Seasonal**: Black Friday +40%, Christmas week -70%

### **Contact Center Metrics**
- **Base Volume**: 15,000 weekly contacts (782K annually)
- **Contact Mix**: 60% calls, 30% chats, 10% emails
- **AI Deflection**: Improves from 18% to 27% over year
- **Staffing**: 94 FTEs across 3 shifts with realistic PTO/sick patterns
- **SLA**: 82% average with range 65-95%

### **Anomalies Included**
- **March 15**: System outage (2x volume next day)
- **June 3-4**: Viral social media (3x volume)
- **September 1-7**: Product launch campaign (+40%)
- **October 10**: Bot failure (5% deflection)

### **Industry Benchmarks**
- Deflection by industry (Insurance 22%, Tech 42%)
- Regional cost differences (Toronto $54K, Philippines $18K)
- Handle time comparisons (Industry 5.5min, Our center 6.0min)

## 🛠️ Script Options

```bash
# Custom output directory
python scripts/generate_synthetic_data.py --output /path/to/custom/dir

# Different random seed for variation
python scripts/generate_synthetic_data.py --seed 123

# Help
python scripts/generate_synthetic_data.py --help
```

## 🎯 Integration with WFM.ai

The generated data files can be loaded directly into the WFM.ai application to replace the static mock data with realistic, time-series data that demonstrates:

- **Historical trends** and patterns
- **AI deflection impact** on staffing
- **Cost savings** calculations
- **Industry benchmarking**
- **Realistic anomalies** and edge cases

This provides a much more impressive and realistic demo experience for enterprise prospects.

## 📝 Data Schema

### Historical Volume
```json
{
  "date": "2024-01-01",
  "hour": 8,
  "calls": 45,
  "chats": 18,
  "emails": 12,
  "contactType": {
    "billing": 28,
    "technical": 22,
    "general": 18,
    "sales": 7
  }
}
```

### Deflection History
```json
{
  "month": "2024-01",
  "overallRate": 0.18,
  "byType": {
    "billing": 0.25,
    "technical": 0.12,
    "general": 0.20,
    "sales": 0.08
  },
  "botUpdates": null
}
```

See the generated files for complete schemas and example data.