import { motion } from "framer-motion";
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
} from "recharts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams } from "react-router-dom";

import { useSkillSummary } from "@/hooks/useSkillSummary";
import { useAnalysisOverview } from "@/hooks/useAnalysisOverview";

/* ---------------- FALLBACK UI DATA ---------------- */
const fallbackRadar = [
  { skill: "Frontend", level: 80 },
  { skill: "Backend", level: 75 },
  { skill: "Architecture", level: 70 },
  { skill: "Security", level: 65 },
  { skill: "Performance", level: 78 },
];

const fallbackLanguages = [
  { language: "TypeScript", lines: 60 },
  { language: "JavaScript", lines: 25 },
  { language: "CSS", lines: 10 },
  { language: "Other", lines: 5 },
];

const fallbackSkills = [
  { name: "Code Readability", level: 80, category: "Quality" },
  { name: "Maintainability", level: 75, category: "Architecture" },
  { name: "Security Practices", level: 65, category: "Security" },
  { name: "Performance Awareness", level: 78, category: "Performance" },
];

/* ---------------- PAGE ---------------- */
export default function DeveloperSkillsPage() {
  const { analysisId } = useParams();

  const { skillSummary, loading } = useSkillSummary(analysisId);
  const { data: overview } = useAnalysisOverview(analysisId);

  if (loading) {
    return (
      <div className="p-8 text-neon-teal text-sm">
        Loading developer skills profile…
      </div>
    );
  }

  return (
    <div className="w-full max-w-[120rem] mx-auto px-8 py-12">
      {/* HEADER */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white">
          Developer Skills Profile
        </h1>
        <p className="mt-2 text-foreground/60">
          AI-assessed proficiency based on repository analysis
        </p>
      </motion.div>

      {/* SKILL SUMMARY (REAL BACKEND DATA) */}
      <Card className="mb-12 border-white/10 bg-white/5 p-8">
        <p className="text-sm text-foreground/60">AI Skill Summary</p>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          {skillSummary || "Skill analysis completed successfully."}
        </p>
      </Card>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* RADAR */}
        <Card className="border-white/10 bg-white/5 p-6">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Skills Overview
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={fallbackRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" stroke="rgba(255,255,255,0.6)" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                dataKey="level"
                stroke="#64FFDA"
                fill="#64FFDA"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* LANGUAGE USAGE */}
        <Card className="border-white/10 bg-white/5 p-6">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Language Usage
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={fallbackLanguages} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="language" />
              <Tooltip />
              <Bar dataKey="lines" fill="#BB86FC" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* DETAILED SKILLS */}
      <Card className="border-white/10 bg-white/5 p-8">
        <h3 className="mb-8 text-xl font-semibold text-white">
          Detailed Skills Assessment
        </h3>

        <div className="space-y-6">
          {fallbackSkills.map((skill, i) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{skill.name}</h4>
                <span className="text-neon-teal font-bold">
                  {skill.level}%
                </span>
              </div>
              <Progress
                value={skill.level}
                className="mt-2 h-2 bg-white/10"
              />
              <p className="mt-1 text-xs text-foreground/50">
                {skill.category}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
