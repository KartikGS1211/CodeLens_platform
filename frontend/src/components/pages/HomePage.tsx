// HPI 1.5-V
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Code, 
  Terminal, 
  Cpu, 
  Shield, 
  Zap, 
  ChevronRight, 
  Database, 
  Lock, 
  Server,
  BookOpen
} from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Repositories } from '@/entities';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';

// --- Types ---
type StatItem = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
};

// --- Utility Components ---

const GlitchText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 translate-x-[2px] text-neon-teal opacity-70 mix-blend-screen animate-pulse">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 -translate-x-[2px] text-secondary opacity-70 mix-blend-screen animate-pulse delay-75">
        {text}
      </span>
    </div>
  );
};

const GridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
  </div>
);

const SectionDivider = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-0" />
);

// --- Main Component ---

export default function HomePage() {
  // --- 1. Data Fidelity Protocol: Canonical Data Sources ---
  const [repositories, setRepositories] = useState<Repositories[]>([]);
  const [loading, setLoading] = useState(true);

  // Preserve original data fetching logic
  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      const { items } = await BaseCrudService.getAll<Repositories>('repositories');
      setRepositories(items);
    } catch (error) {
      console.error('Error loading repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preserve original stats logic
  const stats: StatItem[] = [
    {
      label: 'Total Repositories',
      value: repositories.length,
      icon: GitBranch,
      color: 'neon-teal',
      trend: '+12% this week'
    },
    {
      label: 'Active Reviews',
      value: repositories.filter(r => r.status === 'active').length,
      icon: Activity,
      color: 'secondary',
      trend: 'Processing now'
    },
    {
      label: 'Issues Found',
      value: Math.floor(Math.random() * 50) + 10, // Preserved random logic
      icon: AlertCircle,
      color: 'destructive',
      trend: 'Requires attention'
    },
    {
      label: 'Code Quality',
      value: '87%',
      icon: TrendingUp,
      color: 'neon-teal',
      trend: 'Top 5% of teams'
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-neon-teal border-neon-teal/30 bg-neon-teal/10';
      case 'pending':
        return 'text-secondary border-secondary/30 bg-secondary/10';
      case 'archived':
        return 'text-foreground/40 border-white/10 bg-white/5';
      default:
        return 'text-foreground/60 border-white/10 bg-white/5';
    }
  };

  // --- Scroll & Motion Hooks ---
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-teal selection:text-black overflow-x-clip">
      {/* Global Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-neon-teal origin-left z-50 mix-blend-difference"
        style={{ scaleX }}
      />

      <Header />
      <Sidebar />

      <main className="ml-0 md:ml-64 relative">
        
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden pt-20">
          <GridBackground />
          
          {/* Animated Code Rain Background (Preserved & Enhanced) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute font-paragraph text-[10px] text-neon-teal writing-vertical-rl"
                initial={{ y: -100, x: Math.random() * 100 + '%' }}
                animate={{
                  y: '120vh',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'linear',
                }}
              >
                {['010101', 'SYSTEM_OK', 'ANALYZING', 'IMPORT_CORE', 'HEAP_ALLOC', 'STACK_TRACE'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </div>

          <div className="container relative z-10 px-6 max-w-[100rem]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Text Content */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-teal/30 bg-neon-teal/5 text-neon-teal font-paragraph text-xs mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-teal opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-teal"></span>
                    </span>
                    SYSTEM V.2.0 ONLINE
                  </div>
                  
                  <h1 className="font-heading text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-6">
                    UNLEASH YOUR <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-secondary">
                      CODE POTENTIAL
                    </span>
                  </h1>
                  
                  <p className="font-paragraph text-lg text-foreground/60 max-w-2xl leading-relaxed border-l-2 border-neon-teal/50 pl-6">
                    The next-generation AI code review and developer skill profiling platform. 
                    Transform raw commits into actionable intelligence. 
                  </p>
                </motion.div>

                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <button 
                    onClick={() => window.location.href = '/code-review'}
                    className="group relative px-8 py-4 bg-neon-teal text-black font-paragraph font-bold text-sm uppercase tracking-wider overflow-hidden cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Initialize Analysis <ChevronRight className="w-4 h-4" />
                    </span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = '/best-practices'}
                    className="group px-8 py-4 border border-white/20 bg-transparent text-white font-paragraph font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    View Documentation
                  </button>
                </motion.div>
              </div>

              {/* Hero Visual / 3D Abstract */}
              <div className="lg:col-span-5 relative h-[500px] w-full hidden lg:block">
                <motion.div
                  className="absolute inset-0 border border-white/10 bg-white/5 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="absolute top-0 left-0 p-4 border-b border-white/10 w-full flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="p-8 font-paragraph text-xs text-neon-teal/80 mt-8 space-y-2">
                    <p>{'>'} initializing_core_modules...</p>
                    <p>{'>'} loading_neural_networks...</p>
                    <p>{'>'} connecting_to_repo_db...</p>
                    <p className="text-white">{'>'} connection_established</p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="h-24 border border-dashed border-white/20 bg-white/5 p-4">
                        <Activity className="w-6 h-6 mb-2 text-secondary" />
                        <div className="h-1 w-full bg-white/10 rounded overflow-hidden">
                          <motion.div 
                            className="h-full bg-secondary"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                      </div>
                      <div className="h-24 border border-dashed border-white/20 bg-white/5 p-4">
                        <Database className="w-6 h-6 mb-2 text-neon-teal" />
                        <div className="text-2xl font-bold text-white">98.2%</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating Elements */}
                <motion.div 
                  className="absolute -right-10 -bottom-10 w-64 h-40 bg-black border border-neon-teal/30 p-6 shadow-[0_0_30px_rgba(100,255,218,0.1)]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-paragraph text-neon-teal">LIVE METRICS</span>
                    <div className="w-2 h-2 bg-neon-teal rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-neon-teal" />
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-secondary" />
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[90%] bg-white" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* --- STATS TICKER (Sticky) --- */}
        <section className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
          <div className="w-full overflow-hidden py-4">
            <div className="flex justify-around items-center min-w-max px-8 gap-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-4 group cursor-default">
                    <div className={`p-2 rounded bg-${stat.color}/10 border border-${stat.color}/20 group-hover:border-${stat.color} transition-colors`}>
                      <Icon className={`w-5 h-5 text-${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-xs font-paragraph text-foreground/50 uppercase tracking-wider">{stat.label}</div>
                      <div className="text-xl font-heading font-bold text-white flex items-baseline gap-2">
                        {stat.value}
                        {stat.trend && (
                          <span className="text-[10px] font-paragraph text-foreground/40 font-normal hidden lg:inline-block">
                            {stat.trend}
                          </span>
                        )}
                      </div>
                    </div>
                    {index !== stats.length - 1 && (
                      <div className="h-8 w-px bg-white/10 ml-8 hidden md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- REPOSITORIES SECTION (Data Driven) --- */}
        <section className="relative py-32 px-6 md:px-12">
          <div className="max-w-[100rem] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                  <GlitchText text="CONNECTED REPOSITORIES" />
                </h2>
                <p className="font-paragraph text-foreground/60 max-w-xl">
                  Real-time monitoring of your codebase. Select a repository to initiate deep-scan analysis or view architectural compliance reports.
                </p>
              </div>
              <button 
                onClick={() => alert('Repository connection feature coming soon!')}
                className="px-6 py-3 border border-neon-teal text-neon-teal font-paragraph text-xs hover:bg-neon-teal hover:text-black transition-all duration-300 cursor-pointer"
              >
                + ADD REPOSITORY
              </button>
            </div>

            {loading ? (
              <div className="h-96 w-full flex items-center justify-center border border-white/10 bg-white/5">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-neon-teal border-t-transparent rounded-full animate-spin" />
                  <p className="font-paragraph text-xs text-neon-teal animate-pulse">ESTABLISHING UPLINK...</p>
                </div>
              </div>
            ) : repositories.length === 0 ? (
              <div className="h-96 w-full flex flex-col items-center justify-center border border-dashed border-white/20 bg-white/5 rounded-lg">
                <Code className="w-16 h-16 text-foreground/20 mb-6" />
                <h3 className="font-heading text-xl text-white mb-2">No Signal Detected</h3>
                <p className="font-paragraph text-foreground/60 mb-6">Connect your first repository to begin analysis.</p>
                <button 
                  onClick={() => alert('Repository connection feature coming soon!')}
                  className="px-6 py-3 bg-white text-black font-paragraph text-xs font-bold hover:bg-neon-teal transition-colors cursor-pointer"
                >
                  CONNECT REPO
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {repositories.map((repo, i) => (
                  <motion.div
                    key={repo._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-neon-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <Card className="h-full border-white/10 bg-[#1a1a1a] hover:border-neon-teal/50 transition-all duration-300 p-0 overflow-hidden flex flex-col">
                      {/* Card Header */}
                      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-black border border-white/10 rounded">
                            <GitBranch className="w-5 h-5 text-neon-teal" />
                          </div>
                          <span className={`px-2 py-1 text-[10px] font-paragraph uppercase tracking-wider border rounded ${getStatusColor(repo.status)}`}>
                            {repo.status || 'UNKNOWN'}
                          </span>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-white group-hover:text-neon-teal transition-colors truncate">
                          {repo.repositoryName}
                        </h3>
                        <p className="font-paragraph text-xs text-foreground/50 mt-1 truncate">
                          {repo.owner || 'Unknown Owner'}
                        </p>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <p className="font-paragraph text-sm text-foreground/70 line-clamp-2 mb-6 min-h-[2.5em]">
                          {repo.description || 'No description provided for this repository module.'}
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs font-paragraph">
                            <span className="text-foreground/40">LAST SYNC</span>
                            <span className="text-white">
                              {repo.lastSyncDate ? new Date(repo.lastSyncDate).toLocaleDateString() : 'NEVER'}
                            </span>
                          </div>
                          
                          {/* Decorative Progress Bar */}
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-neon-teal to-secondary w-[0%] group-hover:w-[100%] transition-all duration-1000 ease-out" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Action */}
                      <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center group-hover:bg-neon-teal/5 transition-colors">
                        <span className="text-[10px] font-paragraph text-neon-teal opacity-0 group-hover:opacity-100 transition-opacity">
                          VIEW ANALYTICS
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-neon-teal transition-colors" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* --- FEATURE SHOWCASE (Parallax & Sticky) --- */}
        <section className="relative py-32 bg-black overflow-hidden">
          <div className="absolute inset-0 opacity-30">
             <Image 
               src="https://static.wixstatic.com/media/acb37d_7515f57f045d461fb4e7679761ec88f0~mv2.png?originWidth=1152&originHeight=768"
               alt="Abstract Grid Background"
               className="w-full h-full object-cover opacity-20"
             />
          </div>

          <div className="container max-w-[100rem] mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              
              {/* Sticky Content Side */}
              <div className="lg:sticky lg:top-32 h-fit">
                <h2 className="font-heading text-5xl md:text-6xl font-bold mb-8 leading-tight">
                  INTELLIGENT <br />
                  <span className="text-secondary">ARCHITECTURE</span>
                </h2>
                <p className="font-paragraph text-lg text-foreground/70 mb-12 max-w-md">
                  Our AI doesn't just read code; it understands intent. Visualize complexity, track technical debt, and enforce best practices across your entire organization.
                </p>
                
                <div className="space-y-8">
                  {[
                    { title: 'Pattern Recognition', desc: 'Identifies anti-patterns and suggests architectural improvements.', icon: Shield },
                    { title: 'Skill Profiling', desc: 'Maps developer strengths based on commit history and code complexity.', icon: Zap },
                    { title: 'Automated Compliance', desc: 'Ensures all code meets your defined security and style guidelines.', icon: Lock },
                  ].map((feature, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex gap-6 p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="p-3 bg-secondary/10 h-fit">
                        <feature.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-heading text-xl font-bold mb-2">{feature.title}</h4>
                        <p className="font-paragraph text-sm text-foreground/60">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Scrolling Visuals Side */}
              <div className="flex flex-col gap-12 pt-12 lg:pt-0">
                <motion.div 
                  className="relative aspect-square md:aspect-video bg-[#0a0a0a] border border-white/10 p-8 overflow-hidden group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute top-0 right-0 p-4 text-xs font-paragraph text-neon-teal">
                    MODULE: CODE_VISUALIZER
                  </div>
                  {/* Abstract Code Visualization UI */}
                  <div className="h-full w-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-teal/10 via-transparent to-transparent opacity-50" />
                    <div className="grid grid-cols-4 gap-4 w-full max-w-md">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-16 bg-white/5 border border-white/10 rounded-sm"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            borderColor: ['rgba(255,255,255,0.1)', 'rgba(100,255,218,0.5)', 'rgba(255,255,255,0.1)']
                          }}
                          transition={{ 
                            duration: 2, 
                            delay: i * 0.1, 
                            repeat: Infinity,
                            repeatDelay: 3 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="relative aspect-square md:aspect-video bg-[#0a0a0a] border border-white/10 p-8 overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute top-0 right-0 p-4 text-xs font-paragraph text-secondary">
                    MODULE: SKILL_RADAR
                  </div>
                  {/* Abstract Radar UI */}
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="relative w-64 h-64 border border-white/20 rounded-full flex items-center justify-center">
                      <div className="absolute w-48 h-48 border border-white/10 rounded-full" />
                      <div className="absolute w-32 h-32 border border-white/10 rounded-full" />
                      <motion.div 
                        className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-secondary/40 to-transparent origin-bottom-left"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ borderRadius: '0 100% 0 0' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* --- QUICK ACTIONS (Interactive Grid) --- */}
        <section className="py-32 px-6 border-t border-white/10 bg-[#0f0f0f]">
          <div className="max-w-[100rem] mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-heading text-4xl font-bold mb-4">COMMAND CENTER</h2>
              <p className="font-paragraph text-foreground/60">Execute immediate actions on your codebase</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Run Code Review', icon: CheckCircle, color: 'neon-teal', desc: 'Trigger AI analysis on latest commits', href: '/code-review' },
                { title: 'View Metrics', icon: Activity, color: 'secondary', desc: 'Deep dive into quality and performance', href: '/code-quality' },
                { title: 'Best Practices', icon: BookOpen, color: 'white', desc: 'Consult the architecture guidelines', href: '/best-practices' },
              ].map((action, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => window.location.href = action.href}
                >
                  <div className={`h-full p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-${action.color}/50 transition-all duration-300 relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                      <action.icon className={`w-32 h-32 text-${action.color}`} />
                    </div>
                    
                    <div className={`w-12 h-12 rounded-lg bg-${action.color}/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-6 h-6 text-${action.color}`} />
                    </div>
                    
                    <h3 className="font-heading text-2xl font-bold mb-4 group-hover:text-white transition-colors">{action.title}</h3>
                    <p className="font-paragraph text-sm text-foreground/60 mb-8">{action.desc}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-paragraph font-bold uppercase tracking-wider">
                      <span className={`text-${action.color}`}>Execute</span>
                      <ChevronRight className={`w-3 h-3 text-${action.color} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FOOTER (Simple, as per instructions to not create new nav) --- */}
        <footer className="py-12 px-6 border-t border-white/10 bg-black text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Terminal className="w-4 h-4" />
            <span className="font-paragraph text-xs">SYSTEM STATUS: OPERATIONAL</span>
          </div>
          <p className="font-paragraph text-xs text-foreground/30">
            © 2026 AI CODE REVIEWER. ALL RIGHTS RESERVED.
          </p>
        </footer>

      </main>
    </div>
  );
}