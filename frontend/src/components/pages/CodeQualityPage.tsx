import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/card';

const qualityTrendData = [
  { month: 'Jan', score: 72 },
  { month: 'Feb', score: 75 },
  { month: 'Mar', score: 78 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 85 },
  { month: 'Jun', score: 87 },
];

const complexityData = [
  { name: 'Auth', complexity: 45 },
  { name: 'API', complexity: 62 },
  { name: 'UI', complexity: 38 },
  { name: 'Utils', complexity: 28 },
  { name: 'Database', complexity: 55 },
];

const radarData = [
  { metric: 'Maintainability', score: 87 },
  { metric: 'Reliability', score: 92 },
  { metric: 'Security', score: 78 },
  { metric: 'Performance', score: 85 },
  { metric: 'Coverage', score: 73 },
  { metric: 'Documentation', score: 68 },
];

export default function CodeQualityPage() {
  const metrics = [
    {
      label: 'Overall Quality',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Code Coverage',
      value: '73%',
      change: '+2%',
      trend: 'up',
      icon: CheckCircle,
    },
    {
      label: 'Technical Debt',
      value: '12h',
      change: '-3h',
      trend: 'down',
      icon: AlertTriangle,
    },
    {
      label: 'Complexity Score',
      value: '45',
      change: '-8',
      trend: 'down',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />

      <main className="ml-0 px-8 py-16 md:ml-64">
        <div className="mx-auto max-w-[120rem]">
          {/* Page Header */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-5xl font-bold text-white">
              Code Quality Metrics
            </h1>
            <p className="mt-4 font-paragraph text-lg text-foreground/70">
              Track and analyze your codebase health over time
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-paragraph text-sm text-foreground/60">
                          {metric.label}
                        </p>
                        <p className="mt-4 font-heading text-4xl font-bold text-white">
                          {metric.value}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={`font-paragraph text-sm ${
                              metric.trend === 'up'
                                ? 'text-neon-teal'
                                : 'text-secondary'
                            }`}
                          >
                            {metric.change}
                          </span>
                          <span className="font-paragraph text-xs text-foreground/50">
                            vs last month
                          </span>
                        </div>
                      </div>
                      <Icon
                        className={`h-6 w-6 ${
                          metric.trend === 'up' ? 'text-neon-teal' : 'text-secondary'
                        }`}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Quality Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                <h3 className="mb-8 font-heading text-2xl font-bold text-white">
                  Quality Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="month"
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontFamily: 'azeret-mono', fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontFamily: 'azeret-mono', fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 39, 46, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontFamily: 'azeret-mono',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#64FFDA"
                      strokeWidth={3}
                      dot={{ fill: '#64FFDA', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Complexity Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                <h3 className="mb-8 font-heading text-2xl font-bold text-white">
                  Module Complexity
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complexityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontFamily: 'azeret-mono', fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontFamily: 'azeret-mono', fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 39, 46, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontFamily: 'azeret-mono',
                      }}
                    />
                    <Bar dataKey="complexity" fill="#BB86FC" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Radar Chart */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h3 className="mb-8 font-heading text-2xl font-bold text-white">
                Quality Dimensions
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontFamily: 'azeret-mono', fontSize: '12px' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontFamily: 'azeret-mono', fontSize: '12px' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#64FFDA"
                    fill="#64FFDA"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Issues List */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h3 className="mb-8 font-heading text-2xl font-bold text-white">
                Recent Issues
              </h3>
              <div className="space-y-4">
                {[
                  {
                    severity: 'high',
                    title: 'High cyclomatic complexity in auth module',
                    file: 'src/auth/validator.ts',
                    line: 145,
                  },
                  {
                    severity: 'medium',
                    title: 'Missing error handling in API calls',
                    file: 'src/api/client.ts',
                    line: 78,
                  },
                  {
                    severity: 'low',
                    title: 'Unused import statements',
                    file: 'src/utils/helpers.ts',
                    line: 12,
                  },
                  {
                    severity: 'medium',
                    title: 'Potential memory leak in event listeners',
                    file: 'src/components/Dashboard.tsx',
                    line: 234,
                  },
                ].map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-6 transition-all hover:border-neon-teal/30"
                  >
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        issue.severity === 'high'
                          ? 'bg-destructive'
                          : issue.severity === 'medium'
                          ? 'bg-secondary'
                          : 'bg-neon-teal'
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-paragraph text-sm font-medium text-white">
                        {issue.title}
                      </h4>
                      <p className="mt-2 font-paragraph text-xs text-foreground/60">
                        {issue.file}:{issue.line}
                      </p>
                    </div>
                    <span
                      className={`rounded px-3 py-1 font-paragraph text-xs font-medium ${
                        issue.severity === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : issue.severity === 'medium'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-neon-teal/10 text-neon-teal'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
