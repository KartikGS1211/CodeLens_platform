import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { ArchitectureBestPractices } from '@/entities';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image } from '@/components/ui/image';

export default function BestPracticesPage() {
  const [practices, setPractices] = useState<ArchitectureBestPractices[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    try {
      const { items } = await BaseCrudService.getAll<ArchitectureBestPractices>(
        'architecturebestpractices'
      );
      setPractices(items);
    } catch (error) {
      console.error('Error loading practices:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(practices.map((p) => p.category).filter(Boolean))];

  const filteredPractices =
    selectedCategory === 'all'
      ? practices
      : practices.filter((p) => p.category === selectedCategory);

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Architecture: 'neon-teal',
      Security: 'destructive',
      Performance: 'secondary',
      Testing: 'neon-teal',
      'Code Quality': 'secondary',
    };
    return colors[category || ''] || 'neon-teal';
  };

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
              <BookOpen className="h-8 w-8 text-neon-teal" />
              <h1 className="font-heading text-5xl font-bold text-white">
                Architecture & Best Practices
              </h1>
            </div>
            <p className="mt-4 font-paragraph text-lg text-foreground/70">
              Comprehensive guidelines and patterns for building robust applications
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { label: 'Total Guidelines', value: practices.length },
              { label: 'Categories', value: categories.length - 1 },
              { label: 'With Diagrams', value: practices.filter((p) => p.diagram).length },
              { label: 'Compliance Rules', value: practices.filter((p) => p.complianceGuidelines).length },
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
                  <p className="mt-4 font-heading text-4xl font-bold text-white">
                    {stat.value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setSelectedCategory}
            >
              <TabsList className="mb-8 flex flex-wrap border border-white/10 bg-white/5 p-1">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="font-paragraph capitalize data-[state=active]:bg-neon-teal data-[state=active]:text-black"
                  >
                    {category === 'all' ? 'All' : category} (
                    {category === 'all'
                      ? practices.length
                      : practices.filter((p) => p.category === category).length}
                    )
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory}>
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-teal border-t-transparent"></div>
                  </div>
                ) : filteredPractices.length === 0 ? (
                  <Card className="border-white/10 bg-white/5 p-16 text-center backdrop-blur-lg">
                    <BookOpen className="mx-auto h-16 w-16 text-foreground/20" />
                    <p className="mt-4 font-paragraph text-foreground/60">
                      No best practices found
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {filteredPractices.map((practice, index) => (
                      <motion.div
                        key={practice._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg transition-all hover:border-neon-teal/30">
                          <div className="flex items-start gap-6">
                            <div
                              className={`rounded-lg bg-${getCategoryColor(
                                practice.category
                              )}/10 p-3`}
                            >
                              <FileText
                                className={`h-6 w-6 text-${getCategoryColor(
                                  practice.category
                                )}`}
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-heading text-2xl font-bold text-white">
                                    {practice.title}
                                  </h3>
                                  {practice.category && (
                                    <span
                                      className={`mt-2 inline-block rounded-full border border-${getCategoryColor(
                                        practice.category
                                      )}/30 bg-${getCategoryColor(
                                        practice.category
                                      )}/10 px-3 py-1 font-paragraph text-xs text-${getCategoryColor(
                                        practice.category
                                      )}`}
                                    >
                                      {practice.category}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {practice.description && (
                                <div className="mt-6">
                                  <h4 className="font-paragraph text-sm font-medium text-foreground/80">
                                    Description
                                  </h4>
                                  <p className="mt-2 font-paragraph text-sm text-foreground/70">
                                    {practice.description}
                                  </p>
                                </div>
                              )}

                              {practice.examples && (
                                <div className="mt-6">
                                  <h4 className="font-paragraph text-sm font-medium text-foreground/80">
                                    Examples
                                  </h4>
                                  <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-deep-space-blue/50">
                                    <pre className="overflow-x-auto p-6">
                                      <code className="font-paragraph text-sm text-neon-teal">
                                        {practice.examples}
                                      </code>
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {practice.complianceGuidelines && (
                                <div className="mt-6">
                                  <h4 className="flex items-center gap-2 font-paragraph text-sm font-medium text-foreground/80">
                                    <CheckCircle className="h-4 w-4 text-neon-teal" />
                                    Compliance Guidelines
                                  </h4>
                                  <p className="mt-2 font-paragraph text-sm text-foreground/70">
                                    {practice.complianceGuidelines}
                                  </p>
                                </div>
                              )}

                              {practice.diagram && (
                                <div className="mt-6">
                                  <h4 className="flex items-center gap-2 font-paragraph text-sm font-medium text-foreground/80">
                                    <ImageIcon className="h-4 w-4 text-secondary" />
                                    Architecture Diagram
                                  </h4>
                                  <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-deep-space-blue/50">
                                    <Image
                                      src={practice.diagram}
                                      alt={practice.title || 'Architecture diagram'}
                                      className="h-auto w-full"
                                      width={800}
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="mt-6 flex gap-3">
                                <button 
                                  onClick={() => alert(`Learn more about: ${practice.title}`)}
                                  className="flex items-center gap-2 rounded-lg bg-neon-teal px-4 py-2 font-paragraph text-sm font-medium text-black transition-all hover:bg-neon-teal/90 cursor-pointer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Learn More
                                </button>
                                <button 
                                  onClick={() => alert(`Applied to project: ${practice.title}`)}
                                  className="rounded-lg border border-white/10 bg-transparent px-4 py-2 font-paragraph text-sm font-medium text-foreground/80 transition-all hover:bg-white/5 cursor-pointer"
                                >
                                  Apply to Project
                                </button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Quick Reference */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="mb-8 font-heading text-2xl font-bold text-white">
              Quick Reference
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: 'SOLID Principles',
                  description: 'Five design principles for maintainable software',
                  items: [
                    'Single Responsibility',
                    'Open/Closed',
                    'Liskov Substitution',
                    'Interface Segregation',
                    'Dependency Inversion',
                  ],
                },
                {
                  title: 'Design Patterns',
                  description: 'Common solutions to recurring problems',
                  items: [
                    'Singleton',
                    'Factory',
                    'Observer',
                    'Strategy',
                    'Decorator',
                  ],
                },
                {
                  title: 'Code Smells',
                  description: 'Warning signs in your codebase',
                  items: [
                    'Duplicated Code',
                    'Long Methods',
                    'Large Classes',
                    'Too Many Parameters',
                    'Feature Envy',
                  ],
                },
              ].map((ref, index) => (
                <motion.div
                  key={ref.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                    <h4 className="font-heading text-xl font-bold text-white">
                      {ref.title}
                    </h4>
                    <p className="mt-2 font-paragraph text-sm text-foreground/60">
                      {ref.description}
                    </p>
                    <ul className="mt-6 space-y-2">
                      {ref.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 font-paragraph text-sm text-foreground/70"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-neon-teal"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
