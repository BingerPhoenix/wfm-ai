#!/usr/bin/env python3
"""
WFM.ai Synthetic Contact Center Data Generator

Generates 12 months of realistic contact center data including:
- Hourly contact volumes with realistic patterns
- AI deflection improvements over time
- Staffing schedules with PTO/sick time
- SLA performance tracking
- Cost analysis data
- Industry benchmarks

Author: Shubbankar Singh
Date: December 2024
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
import random
from typing import Dict, List, Tuple, Any
import argparse

# Set random seed for reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

class WFMDataGenerator:
    """Generates realistic contact center data with industry patterns."""

    def __init__(self):
        """Initialize the data generator with base parameters."""
        self.start_date = datetime(2024, 1, 1)
        self.end_date = datetime(2024, 12, 31)
        self.base_weekly_volume = 15000
        self.total_ftes = 94

        # Contact type distributions
        self.contact_types = {
            'billing': 0.35,
            'technical': 0.30,
            'general': 0.25,
            'sales': 0.10
        }

        # Shift distributions
        self.shifts = {
            'morning': {'start': 8, 'end': 12, 'agents': 26},
            'midday': {'start': 12, 'end': 17, 'agents': 42},
            'evening': {'start': 17, 'end': 21, 'agents': 26}
        }

        # Operating hours (8am to 9pm = 13 hours)
        self.operating_hours = list(range(8, 21))

        # Output directory
        self.output_dir = Path("public/data")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_all_data(self):
        """Generate all data files for the WFM.ai prototype."""
        print("🚀 Starting WFM.ai synthetic data generation...")

        # Generate core datasets
        volume_data = self.generate_volume_data()
        deflection_data = self.generate_deflection_history()
        staffing_data = self.generate_staffing_schedules()
        sla_data = self.generate_sla_performance(volume_data, staffing_data, deflection_data)
        cost_data = self.generate_cost_data()

        # Generate summary statistics
        summary_stats = self.generate_summary_stats(volume_data, deflection_data, sla_data)

        # Save all data files
        self.save_data_files({
            'historical_volume.json': volume_data,
            'deflection_history.json': deflection_data,
            'staffing_schedules.json': staffing_data,
            'sla_performance.json': sla_data,
            'cost_data.json': cost_data,
            'summary_stats.json': summary_stats
        })

        print("✅ Data generation complete! Files saved to public/data/")
        return True

    def generate_volume_data(self) -> List[Dict]:
        """Generate hourly contact volumes with realistic patterns."""
        print("📊 Generating contact volume data...")

        volume_data = []

        for date in pd.date_range(self.start_date, self.end_date):
            daily_multiplier = self._get_daily_multiplier(date)

            for hour in self.operating_hours:
                hourly_multiplier = self._get_hourly_multiplier(hour)

                # Calculate base hourly volume
                base_hourly = (self.base_weekly_volume / 7 / len(self.operating_hours))
                volume = base_hourly * daily_multiplier * hourly_multiplier

                # Add realistic noise (±15%)
                noise_factor = np.random.normal(1.0, 0.15)
                volume = max(int(volume * noise_factor), 1)

                # Apply anomalies
                volume = self._apply_anomalies(date, hour, volume)

                # Split by contact type
                contacts = self._split_by_contact_type(volume, date)
                type_contacts = self._distribute_contact_types(contacts, date)

                volume_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'hour': hour,
                    'calls': contacts['calls'],
                    'chats': contacts['chats'],
                    'emails': contacts['emails'],
                    'contactType': type_contacts
                })

        print(f"   Generated {len(volume_data)} hourly records")
        return volume_data

    def _get_daily_multiplier(self, date: datetime) -> float:
        """Calculate daily volume multiplier based on day of week and month."""
        # Day of week patterns (0=Monday)
        dow_multipliers = [1.2, 1.2, 1.0, 1.0, 0.9, 0.4, 0.4]  # Mon-Sun
        dow_mult = dow_multipliers[date.weekday()]

        # Monthly patterns
        month = date.month
        monthly_multipliers = {
            1: 1.15,  # January high (post-holiday)
            2: 0.9,   # February dip
            3: 1.0,   # March normal
            4: 1.0,   # April steady
            5: 1.0,   # May steady
            6: 1.0,   # June steady
            7: 0.85,  # July summer dip
            8: 0.85,  # August summer dip
            9: 1.1,   # September back-to-school spike
            10: 1.05, # October build
            11: 1.3,  # November peak
            12: 1.1   # December mixed
        }
        month_mult = monthly_multipliers[month]

        # Black Friday week boost (last week of November)
        if month == 11 and date.day >= 22 and date.day <= 29:
            month_mult *= 1.4

        # Christmas week reduction
        if month == 12 and date.day >= 23 and date.day <= 26:
            month_mult *= 0.3

        return dow_mult * month_mult

    def _get_hourly_multiplier(self, hour: int) -> float:
        """Get hourly volume multiplier with peak at 10-11am and 2-3pm."""
        # Define hourly patterns
        hourly_patterns = {
            8: 0.6,   # 8am - low start
            9: 0.8,   # 9am - building
            10: 1.3,  # 10am - morning peak
            11: 1.2,  # 11am - peak continues
            12: 1.0,  # 12pm - lunch normal
            13: 0.9,  # 1pm - lunch dip
            14: 1.3,  # 2pm - afternoon peak
            15: 1.2,  # 3pm - peak continues
            16: 1.0,  # 4pm - normal
            17: 0.8,  # 5pm - wind down
            18: 0.7,  # 6pm - evening low
            19: 0.6,  # 7pm - low
            20: 0.5   # 8pm - very low
        }
        return hourly_patterns.get(hour, 1.0)

    def _apply_anomalies(self, date: datetime, hour: int, volume: int) -> int:
        """Apply realistic anomalies to make data interesting."""
        # Major system outage - March 15, 2x volume on March 16
        if date.month == 3 and date.day == 16:
            return int(volume * 2.0)

        # Viral social media moment - June 3-4, 3x volume
        if date.month == 6 and (date.day == 3 or date.day == 4):
            return int(volume * 3.0)

        # Product launch campaign - September 1-7, +40% volume
        if date.month == 9 and 1 <= date.day <= 7:
            return int(volume * 1.4)

        # Bot failure - October 10, normal volume (deflection will be low)
        # No volume change here, handled in deflection data

        return volume

    def _split_by_contact_type(self, total_volume: int, date: datetime) -> Dict[str, int]:
        """Split volume into calls, chats, emails."""
        # Base distribution: 60% calls, 30% chats, 10% emails
        # Chats increasing over time, emails steady
        progress = (date - self.start_date).days / 365

        calls_pct = 0.60 - (progress * 0.05)  # Slightly decreasing
        chats_pct = 0.30 + (progress * 0.05)  # Slightly increasing
        emails_pct = 0.10  # Steady

        calls = int(total_volume * calls_pct)
        chats = int(total_volume * chats_pct)
        emails = total_volume - calls - chats  # Remainder

        return {'calls': calls, 'chats': chats, 'emails': emails}

    def _distribute_contact_types(self, contacts: Dict[str, int], date: datetime) -> Dict[str, int]:
        """Distribute contacts across billing/technical/general/sales."""
        total = contacts['calls'] + contacts['chats'] + contacts['emails']

        # Seasonal adjustments
        month = date.month

        # Base distributions
        billing_pct = 0.35
        technical_pct = 0.30
        general_pct = 0.25
        sales_pct = 0.10

        # Seasonal adjustments
        if month == 1:  # January - high billing (post-holiday)
            billing_pct += 0.05
            general_pct -= 0.05
        elif month in [7, 8]:  # Summer - lower general inquiries
            general_pct -= 0.03
            technical_pct += 0.03
        elif month in [11, 12]:  # Q4 - higher sales
            sales_pct += 0.05
            general_pct -= 0.05

        # End-of-month billing spike
        if date.day >= 25:
            billing_pct += 0.08
            general_pct -= 0.08

        return {
            'billing': int(total * billing_pct),
            'technical': int(total * technical_pct),
            'general': int(total * general_pct),
            'sales': int(total * sales_pct)
        }

    def generate_deflection_history(self) -> List[Dict]:
        """Generate AI deflection rate improvements over time."""
        print("🤖 Generating AI deflection history...")

        deflection_data = []

        # Track monthly deflection rates
        for month in range(1, 13):
            date_str = f"2024-{month:02d}"

            # Overall deflection improvement: 18% -> 27% over year
            progress = (month - 1) / 11  # 0 to 1 over the year
            base_rate = 0.18 + (0.09 * progress)

            # Add some realistic month-to-month variation
            monthly_variation = np.random.normal(0, 0.01)
            overall_rate = max(0.15, min(0.30, base_rate + monthly_variation))

            # By contact type deflection at year end:
            # billing 38%, technical 18%, general 48%, sales 12%
            type_progress = progress
            by_type = {
                'billing': min(0.38, 0.25 + (0.13 * type_progress)),
                'technical': min(0.18, 0.12 + (0.06 * type_progress)),
                'general': min(0.48, 0.20 + (0.28 * type_progress)),
                'sales': min(0.12, 0.08 + (0.04 * type_progress))
            }

            # Bot updates/launches
            bot_updates = None
            if month == 3:
                bot_updates = "Billing Bot v2 launched - improved invoice queries"
            elif month == 8:
                bot_updates = "FAQ expansion - 200+ new self-service topics"
            elif month == 10:
                # Bot failure day (October 10th)
                overall_rate *= 0.3  # Dramatic drop for this month's average
                bot_updates = "System incident on Oct 10 - bot performance restored"

            deflection_data.append({
                'month': date_str,
                'overallRate': round(overall_rate, 3),
                'byType': {k: round(v, 3) for k, v in by_type.items()},
                'botUpdates': bot_updates
            })

        print(f"   Generated 12 months of deflection history")
        return deflection_data

    def generate_staffing_schedules(self) -> List[Dict]:
        """Generate realistic staffing schedules with PTO, sick time, training."""
        print("👥 Generating staffing schedules...")

        staffing_data = []

        for date in pd.date_range(self.start_date, self.end_date):
            for shift_name, shift_info in self.shifts.items():
                scheduled = shift_info['agents']

                # Calculate absences
                pto_count = self._calculate_pto(date, scheduled)
                sick_count = self._calculate_sick_leave(date, scheduled)
                training_count = self._calculate_training(date, shift_name)

                actual = scheduled - pto_count - sick_count - training_count

                staffing_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'shift': shift_name,
                    'scheduled': scheduled,
                    'actual': max(actual, 0),  # Can't go negative
                    'ptoCount': pto_count,
                    'sickCount': sick_count,
                    'trainingCount': training_count
                })

        print(f"   Generated {len(staffing_data)} staffing records")
        return staffing_data

    def _calculate_pto(self, date: datetime, scheduled: int) -> int:
        """Calculate PTO based on seasonal patterns."""
        month = date.month

        # Higher PTO in summer and December holidays
        if month in [7, 8]:  # Summer vacation
            pto_rate = 0.08
        elif month == 12 and date.day >= 20:  # Christmas holidays
            pto_rate = 0.15
        elif month == 12:  # Rest of December
            pto_rate = 0.05
        else:
            pto_rate = 0.03

        # Weekend reduced PTO
        if date.weekday() >= 5:
            pto_rate *= 0.5

        return np.random.binomial(scheduled, pto_rate)

    def _calculate_sick_leave(self, date: datetime, scheduled: int) -> int:
        """Calculate sick leave (random 3-5% daily)."""
        sick_rate = np.random.uniform(0.03, 0.05)

        # Higher in winter months (flu season)
        if date.month in [12, 1, 2, 3]:
            sick_rate *= 1.3

        return np.random.binomial(scheduled, sick_rate)

    def _calculate_training(self, date: datetime, shift_name: str) -> int:
        """Calculate training time (Tuesday/Thursday afternoons)."""
        # Training mostly on Tuesday/Thursday midday shift
        if date.weekday() in [1, 3] and shift_name == 'midday':
            return np.random.randint(2, 6)  # 2-5 people in training
        return 0

    def generate_sla_performance(self, volume_data: List[Dict],
                               staffing_data: List[Dict],
                               deflection_data: List[Dict]) -> List[Dict]:
        """Generate daily SLA performance based on staffing and volume."""
        print("📈 Generating SLA performance data...")

        sla_data = []

        # Group staffing by date
        daily_staffing = {}
        for record in staffing_data:
            date = record['date']
            if date not in daily_staffing:
                daily_staffing[date] = {}
            daily_staffing[date][record['shift']] = record

        # Group volume by date
        daily_volumes = {}
        for record in volume_data:
            date = record['date']
            if date not in daily_volumes:
                daily_volumes[date] = 0
            daily_volumes[date] += record['calls'] + record['chats'] + record['emails']

        # Get monthly deflection rates
        deflection_by_month = {d['month']: d['overallRate'] for d in deflection_data}

        for date_str in sorted(daily_volumes.keys()):
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            month_key = date_obj.strftime('%Y-%m')

            daily_volume = daily_volumes[date_str]
            deflection_rate = deflection_by_month.get(month_key, 0.20)

            # Calculate total daily staffing
            total_scheduled = sum(daily_staffing[date_str][shift]['scheduled']
                                for shift in self.shifts.keys())
            total_actual = sum(daily_staffing[date_str][shift]['actual']
                             for shift in self.shifts.keys())

            # Calculate staffing ratio
            staffing_ratio = total_actual / total_scheduled if total_scheduled > 0 else 1.0

            # Calculate SLA based on multiple factors
            base_sla = 0.82  # Average performance

            # Staffing impact
            sla_adjustment = (staffing_ratio - 1.0) * 0.3

            # Volume impact (high volume hurts SLA)
            volume_factor = min(daily_volume / 1000, 3.0)  # Cap at 3x normal
            sla_adjustment -= (volume_factor - 1.0) * 0.1

            # Deflection helps SLA
            deflection_boost = (deflection_rate - 0.20) * 0.5
            sla_adjustment += deflection_boost

            # Add some randomness
            random_factor = np.random.normal(0, 0.05)

            actual_sla = base_sla + sla_adjustment + random_factor
            actual_sla = max(0.65, min(0.95, actual_sla))  # Clamp to realistic range

            # Calculate related metrics
            avg_wait_time = max(5, int(45 * (1 - actual_sla)))  # Inverse relationship
            abandonment_rate = max(0.01, (1 - actual_sla) * 0.2)

            # Special anomalies
            if date_str == '2024-03-15':  # System outage day
                actual_sla = 0.45
                avg_wait_time = 180
                abandonment_rate = 0.25
            elif date_str == '2024-10-10':  # Bot failure day
                actual_sla = 0.60
                avg_wait_time = 90
                abandonment_rate = 0.15

            sla_data.append({
                'date': date_str,
                'target': 0.80,
                'actual': round(actual_sla, 3),
                'avgWaitTime': avg_wait_time,
                'abandonment': round(abandonment_rate, 3)
            })

        print(f"   Generated {len(sla_data)} daily SLA records")
        return sla_data

    def generate_cost_data(self) -> Dict[str, Any]:
        """Generate cost analysis and benchmark data."""
        print("💰 Generating cost and benchmark data...")

        return {
            'agentCosts': {
                'average': 52000,
                'range': {'min': 45000, 'max': 65000},
                'byTenure': [
                    {'years': '0-1', 'avgSalary': 45000, 'count': 28},
                    {'years': '1-3', 'avgSalary': 50000, 'count': 35},
                    {'years': '3-5', 'avgSalary': 56000, 'count': 20},
                    {'years': '5+', 'avgSalary': 62000, 'count': 11}
                ],
                'benefits': 0.32,  # 32% benefits load
                'overtimeRate': 1.5
            },
            'aiCosts': {
                'perContact': 0.12,
                'monthlyTrend': [
                    {'month': '2024-01', 'perContact': 0.15, 'totalCost': 4050},
                    {'month': '2024-03', 'perContact': 0.13, 'totalCost': 4225},  # Bot v2
                    {'month': '2024-06', 'perContact': 0.12, 'totalCost': 4680},
                    {'month': '2024-08', 'perContact': 0.10, 'totalCost': 5120},  # FAQ expansion
                    {'month': '2024-12', 'perContact': 0.08, 'totalCost': 6240}
                ],
                'infrastructure': 2500,  # Monthly infrastructure cost
                'trainingCostPerAgent': 2500
            },
            'benchmarks': {
                'byIndustry': {
                    'insurance': {'deflectionRate': 0.22, 'avgSLA': 0.78, 'agentCost': 54000},
                    'telecom': {'deflectionRate': 0.28, 'avgSLA': 0.82, 'agentCost': 48000},
                    'retail': {'deflectionRate': 0.35, 'avgSLA': 0.85, 'agentCost': 46000},
                    'tech': {'deflectionRate': 0.42, 'avgSLA': 0.88, 'agentCost': 65000}
                },
                'byRegion': {
                    'toronto': {'agentCost': 54000, 'benefits': 0.35},
                    'usAverage': {'agentCost': 48000, 'benefits': 0.30},
                    'philippines': {'agentCost': 18000, 'benefits': 0.15}
                },
                'handleTime': {
                    'industry': 5.5,  # minutes
                    'ourCenter': 6.0,
                    'target': 5.0
                }
            },
            'projections': {
                'deflectionGrowth': 0.02,  # 2% monthly improvement potential
                'costPerAgent': 68500,  # Fully loaded cost (salary + benefits)
                'potentialSavings': {
                    '30%': {'agentReduction': 8, 'annualSavings': 548000},
                    '35%': {'agentReduction': 12, 'annualSavings': 822000},
                    '40%': {'agentReduction': 16, 'annualSavings': 1096000}
                }
            }
        }

    def generate_summary_stats(self, volume_data: List[Dict],
                             deflection_data: List[Dict],
                             sla_data: List[Dict]) -> Dict[str, Any]:
        """Generate summary statistics for the year."""
        print("📋 Generating summary statistics...")

        # Calculate totals
        total_contacts = sum(r['calls'] + r['chats'] + r['emails'] for r in volume_data)

        # Find peak and lowest days
        daily_totals = {}
        for record in volume_data:
            date = record['date']
            if date not in daily_totals:
                daily_totals[date] = 0
            daily_totals[date] += record['calls'] + record['chats'] + record['emails']

        peak_day = max(daily_totals.items(), key=lambda x: x[1])
        lowest_day = min(daily_totals.items(), key=lambda x: x[1])

        # Calculate deflection improvement
        start_deflection = deflection_data[0]['overallRate']
        end_deflection = deflection_data[-1]['overallRate']
        deflection_improvement = (end_deflection - start_deflection) / start_deflection

        # SLA statistics
        avg_sla = np.mean([r['actual'] for r in sla_data])
        sla_variance = np.std([r['actual'] for r in sla_data])

        return {
            'totalContacts': total_contacts,
            'avgWeeklyVolume': int(total_contacts / 52),
            'peakDay': {
                'date': peak_day[0],
                'volume': peak_day[1]
            },
            'lowestDay': {
                'date': lowest_day[0],
                'volume': lowest_day[1]
            },
            'deflectionImprovement': f"+{deflection_improvement:.1%}",
            'avgSLA': round(avg_sla, 3),
            'slaVariance': round(sla_variance, 3),
            'contactMix': {
                'calls': '58%',
                'chats': '32%',
                'emails': '10%'
            },
            'keyMetrics': {
                'totalFTEs': 94,
                'avgHandleTime': 6.0,
                'annualAgentCost': 4916000,  # 94 FTEs * $52,270 avg
                'deflectionSavings': 892000  # Estimated annual savings from AI
            },
            'dataQuality': {
                'recordCount': len(volume_data),
                'dateRange': f"{self.start_date.strftime('%Y-%m-%d')} to {self.end_date.strftime('%Y-%m-%d')}",
                'anomaliesIncluded': ['2024-03-15 outage', '2024-06-03 viral incident',
                                    '2024-09-01 campaign', '2024-10-10 bot failure']
            }
        }

    def save_data_files(self, data_dict: Dict[str, Any]):
        """Save all generated data to JSON files."""
        print("💾 Saving data files...")

        for filename, data in data_dict.items():
            filepath = self.output_dir / filename
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            print(f"   ✅ {filename}")


def main():
    """Main function to generate all synthetic data."""
    parser = argparse.ArgumentParser(description='Generate synthetic WFM contact center data')
    parser.add_argument('--output', '-o', default='public/data',
                       help='Output directory for JSON files')
    parser.add_argument('--seed', '-s', type=int, default=42,
                       help='Random seed for reproducibility')

    args = parser.parse_args()

    # Set random seed
    np.random.seed(args.seed)
    random.seed(args.seed)

    # Initialize generator
    generator = WFMDataGenerator()
    if args.output != 'public/data':
        generator.output_dir = Path(args.output)
        generator.output_dir.mkdir(parents=True, exist_ok=True)

    # Generate all data
    success = generator.generate_all_data()

    if success:
        print("\n🎉 Successfully generated all WFM.ai synthetic data!")
        print(f"📁 Files saved to: {generator.output_dir}")
        print("\n📊 Generated datasets:")
        print("   • historical_volume.json - 12 months of hourly contact volumes")
        print("   • deflection_history.json - AI deflection improvements over time")
        print("   • staffing_schedules.json - Daily staffing with PTO/sick/training")
        print("   • sla_performance.json - Daily SLA performance tracking")
        print("   • cost_data.json - Cost analysis and industry benchmarks")
        print("   • summary_stats.json - Key metrics and insights")
        print("\n🚀 Ready to power your WFM.ai prototype with realistic data!")
    else:
        print("❌ Data generation failed!")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())