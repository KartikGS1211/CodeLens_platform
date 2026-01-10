import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle, Info, Code, FileCode } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const reviewData = [
  {
    type: 'suggestion',
    severity: 'info',
    title: 'Consider using async/await for better readability',
    description:
      'The promise chain in this function could be simplified using async/await syntax for improved code clarity.',
    file: 'src/services/api.ts',
    line: 45,
    code: `// Current
fetchData().then(data => {
  return processData(data);
}).then(result => {
  return saveResult(result);
});

// Suggested
async function handleData() {
  const data = await fetchData();
  const result = await processData(data);
  return await saveResult(result);
}`,
  },
  {
    type: 'issue',
    severity: 'high',
    title: 'Potential null pointer exception',
    description:
      'The user object might be null at this point. Add null checking before accessing properties.',
    file: 'src/components/Profile.tsx',
    line: 128,
    code: `// Current
const userName = user.name; // ❌ Unsafe

// Suggested
const userName = user?.name ?? 'Guest'; // ✅ Safe`,
  },
  {
    type: 'improvement',
    severity: 'medium',
    title: 'Extract magic numbers into constants',
    description:
      'Hard-coded values should be extracted into named constants for better maintainability.',
    file: 'src/utils/calculations.ts',
    line: 67,
    code: `// Current
const timeout = 5000; // What does 5000 mean?

// Suggested
const API_TIMEOUT_MS = 5000;
const timeout = API_TIMEOUT_MS;`,
  },
  {
    type: 'security',
    severity: 'high',
    title: 'Sanitize user input before rendering',
    description:
      'User-generated content should be sanitized to prevent XSS attacks.',
    file: 'src/components/Comment.tsx',
    line: 92,
    code: `// Current
<div dangerouslySetInnerHTML={{__html: userComment}} />

// Suggested
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userComment)
}} />`,
  },
];

export default function CodeReviewPage() {
  const [selectedTab, setSelectedTab] = useState('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'neon-teal';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'issue':
        return AlertCircle;
      case 'suggestion':
        return Info;
      case 'security':
        return AlertCircle;
      default:
        return CheckCircle;
    }
  };

  const filteredReviews =
    selectedTab === 'all'
      ? reviewData
      : reviewData.filter((r) => r.type === selectedTab);

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
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-neon-teal" />
              <h1 className="font-heading text-5xl font-bold text-white">
                AI Code Review
              </h1>
            </div>
            <p className="mt-4 font-paragraph text-lg text-foreground/70">
              Intelligent insights and suggestions powered by AI
            </p>
          </motion.div>

          {/* Summary Cards */}
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { label: 'Total Findings', value: reviewData.length, color: 'neon-teal' },
              {
                label: 'Critical Issues',
                value: reviewData.filter((r) => r.severity === 'high').length,
                color: 'destructive',
              },
              {
                label: 'Suggestions',
                value: reviewData.filter((r) => r.type === 'suggestion').length,
                color: 'secondary',
              },
              {
                label: 'Files Reviewed',
                value: new Set(reviewData.map((r) => r.file)).size,
                color: 'neon-teal',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                  <p className="font-paragraph text-sm text-foreground/60">
                    {stat.label}
                  </p>
                  <p className={`mt-4 font-heading text-4xl font-bold text-${stat.color}`}>
                    {stat.value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
              <TabsList className="mb-8 border border-white/10 bg-white/5 p-1">
                <TabsTrigger
                  value="all"
                  className="font-paragraph data-[state=active]:bg-neon-teal data-[state=active]:text-black"
                >
                  All ({reviewData.length})
                </TabsTrigger>
                <TabsTrigger
                  value="issue"
                  className="font-paragraph data-[state=active]:bg-neon-teal data-[state=active]:text-black"
                >
                  Issues ({reviewData.filter((r) => r.type === 'issue').length})
                </TabsTrigger>
                <TabsTrigger
                  value="suggestion"
                  className="font-paragraph data-[state=active]:bg-neon-teal data-[state=active]:text-black"
                >
                  Suggestions ({reviewData.filter((r) => r.type === 'suggestion').length})
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="font-paragraph data-[state=active]:bg-neon-teal data-[state=active]:text-black"
                >
                  Security ({reviewData.filter((r) => r.type === 'security').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-8">
                {filteredReviews.map((review, index) => {
                  const Icon = getSeverityIcon(review.type);
                  const severityColor = getSeverityColor(review.severity);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                        <div className="flex items-start gap-6">
                          <div className={`rounded-lg bg-${severityColor}/10 p-3`}>
                            <Icon className={`h-6 w-6 text-${severityColor}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-heading text-xl font-bold text-white">
                                  {review.title}
                                </h3>
                                <p className="mt-2 font-paragraph text-sm text-foreground/70">
                                  {review.description}
                                </p>
                              </div>
                              <span
                                className={`rounded px-3 py-1 font-paragraph text-xs font-medium bg-${severityColor}/10 text-${severityColor}`}
                              >
                                {review.severity}
                              </span>
                            </div>

                            <div className="mt-6 flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-foreground/50" />
                                <span className="font-paragraph text-xs text-foreground/60">
                                  {review.file}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-foreground/50" />
                                <span className="font-paragraph text-xs text-foreground/60">
                                  Line {review.line}
                                </span>
                              </div>
                            </div>

                            {/* Code Block */}
                            <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-deep-space-blue/50">
                              <div className="border-b border-white/10 bg-white/5 px-4 py-2">
                                <span className="font-paragraph text-xs text-foreground/60">
                                  Code Example
                                </span>
                              </div>
                              <pre className="overflow-x-auto p-6">
                                <code className="font-paragraph text-sm text-neon-teal">
                                  {review.code}
                                </code>
                              </pre>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex gap-3">
                              <button 
                                onClick={() => alert(`Fix applied for: ${review.title}`)}
                                className="rounded-lg bg-neon-teal px-4 py-2 font-paragraph text-sm font-medium text-black transition-all hover:bg-neon-teal/90 cursor-pointer"
                              >
                                Apply Fix
                              </button>
                              <button 
                                onClick={() => alert(`Ignored: ${review.title}`)}
                                className="rounded-lg border border-white/10 bg-transparent px-4 py-2 font-paragraph text-sm font-medium text-foreground/80 transition-all hover:bg-white/5 cursor-pointer"
                              >
                                Ignore
                              </button>
                              <button 
                                onClick={() => alert(`Learn more about: ${review.title}`)}
                                className="rounded-lg border border-white/10 bg-transparent px-4 py-2 font-paragraph text-sm font-medium text-foreground/80 transition-all hover:bg-white/5 cursor-pointer"
                              >
                                Learn More
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* AI Insights Panel */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-neon-teal/30 bg-gradient-to-br from-neon-teal/5 to-secondary/5 p-8 backdrop-blur-lg">
              <div className="flex items-start gap-6">
                <div className="rounded-lg bg-neon-teal/10 p-3">
                  <Sparkles className="h-6 w-6 text-neon-teal" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    AI-Powered Insights
                  </h3>
                  <p className="mt-3 font-paragraph text-sm text-foreground/70">
                    Your codebase shows strong adherence to best practices with a quality
                    score of 87%. The main areas for improvement are error handling
                    consistency and test coverage. Consider implementing a unified error
                    handling strategy across all API calls and increasing unit test coverage
                    in the authentication module.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Error Handling', 'Test Coverage', 'Code Duplication', 'Performance'].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-neon-teal/30 bg-neon-teal/10 px-4 py-1 font-paragraph text-xs text-neon-teal"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
