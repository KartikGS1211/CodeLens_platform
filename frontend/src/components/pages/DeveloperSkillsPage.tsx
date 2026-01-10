import { motion } from 'framer-motion';
import { Award, TrendingUp, Target, Zap } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const skillsRadarData = [
  { skill: 'React', level: 92 },
  { skill: 'TypeScript', level: 88 },
  { skill: 'Node.js', level: 85 },
  { skill: 'Testing', level: 73 },
  { skill: 'DevOps', level: 68 },
  { skill: 'Security', level: 78 },
];

const languageData = [
  { language: 'TypeScript', lines: 45000 },
  { language: 'JavaScript', lines: 32000 },
  { language: 'CSS', lines: 18000 },
  { language: 'HTML', lines: 12000 },
  { language: 'Python', lines: 8000 },
];

const achievements = [
  {
    title: 'Code Quality Master',
    description: 'Maintained 85%+ code quality for 6 months',
    icon: Award,
    color: 'neon-teal',
    earned: true,
  },
  {
    title: 'Security Champion',
    description: 'Fixed 50+ security vulnerabilities',
    icon: Target,
    color: 'secondary',
    earned: true,
  },
  {
    title: 'Performance Optimizer',
    description: 'Improved app performance by 40%',
    icon: Zap,
    color: 'neon-teal',
    earned: true,
  },
  {
    title: 'Test Coverage Hero',
    description: 'Achieve 90% test coverage',
    icon: TrendingUp,
    color: 'foreground',
    earned: false,
  },
];

const skills = [
  { name: 'React & Component Design', level: 92, category: 'Frontend' },
  { name: 'TypeScript & Type Safety', level: 88, category: 'Language' },
  { name: 'API Design & Integration', level: 85, category: 'Backend' },
  { name: 'State Management', level: 82, category: 'Frontend' },
  { name: 'Testing & Quality Assurance', level: 73, category: 'Quality' },
  { name: 'CI/CD & DevOps', level: 68, category: 'DevOps' },
  { name: 'Security Best Practices', level: 78, category: 'Security' },
  { name: 'Performance Optimization', level: 80, category: 'Performance' },
];

export default function DeveloperSkillsPage() {
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
              Developer Skills Profile
            </h1>
            <p className="mt-4 font-paragraph text-lg text-foreground/70">
              AI-assessed proficiency levels based on your code contributions
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { label: 'Overall Score', value: '87/100', icon: Award },
              { label: 'Skills Tracked', value: '12', icon: Target },
              { label: 'Achievements', value: '3/4', icon: Zap },
              { label: 'Growth Rate', value: '+12%', icon: TrendingUp },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-paragraph text-sm text-foreground/60">
                          {stat.label}
                        </p>
                        <p className="mt-4 font-heading text-4xl font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div className="rounded-lg bg-neon-teal/10 p-3">
                        <Icon className="h-6 w-6 text-neon-teal" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Skills Radar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                <h3 className="mb-8 font-heading text-2xl font-bold text-white">
                  Skills Overview
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={skillsRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="skill"
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
                      name="Level"
                      dataKey="level"
                      stroke="#64FFDA"
                      fill="#64FFDA"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Language Proficiency */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                <h3 className="mb-8 font-heading text-2xl font-bold text-white">
                  Language Proficiency
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={languageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      type="number"
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontFamily: 'azeret-mono', fontSize: '12px' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="language"
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
                    <Bar dataKey="lines" fill="#BB86FC" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Detailed Skills List */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h3 className="mb-8 font-heading text-2xl font-bold text-white">
                Detailed Skills Assessment
              </h3>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-paragraph text-sm font-medium text-white">
                            {skill.name}
                          </h4>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-paragraph text-xs text-foreground/60">
                              {skill.category}
                            </span>
                            <span className="font-paragraph text-sm font-bold text-neon-teal">
                              {skill.level}%
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={skill.level}
                          className="mt-3 h-2 bg-white/10"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="mb-8 font-heading text-2xl font-bold text-white">
              Achievements
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card
                      className={`border-white/10 p-8 backdrop-blur-lg transition-all ${
                        achievement.earned
                          ? 'bg-white/5 hover:border-neon-teal/30'
                          : 'bg-white/[0.02] opacity-50'
                      }`}
                    >
                      <div
                        className={`mb-6 inline-flex rounded-lg p-3 ${
                          achievement.earned
                            ? `bg-${achievement.color}/10`
                            : 'bg-white/5'
                        }`}
                      >
                        <Icon
                          className={`h-8 w-8 ${
                            achievement.earned
                              ? `text-${achievement.color}`
                              : 'text-foreground/30'
                          }`}
                        />
                      </div>
                      <h4 className="font-heading text-lg font-bold text-white">
                        {achievement.title}
                      </h4>
                      <p className="mt-2 font-paragraph text-sm text-foreground/60">
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-neon-teal"></div>
                          <span className="font-paragraph text-xs text-neon-teal">
                            Earned
                          </span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Growth Recommendations */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-neon-teal/30 bg-gradient-to-br from-neon-teal/5 to-secondary/5 p-8 backdrop-blur-lg">
              <h3 className="mb-6 font-heading text-2xl font-bold text-white">
                Growth Recommendations
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Improve Test Coverage',
                    description:
                      'Focus on writing more unit tests to reach 90% coverage. Start with the authentication module.',
                  },
                  {
                    title: 'Enhance DevOps Skills',
                    description:
                      'Learn about container orchestration and CI/CD pipelines to improve deployment workflows.',
                  },
                  {
                    title: 'Security Hardening',
                    description:
                      'Study OWASP Top 10 and implement security best practices in API endpoints.',
                  },
                ].map((rec, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-white/10 bg-white/5 p-6"
                  >
                    <h4 className="font-paragraph text-sm font-medium text-white">
                      {rec.title}
                    </h4>
                    <p className="mt-2 font-paragraph text-sm text-foreground/70">
                      {rec.description}
                    </p>
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
