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
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

/* ---------------- PAGE ---------------- */
export default function DeveloperSkillsPage() {
  const { analysisId } = useParams();
  const { data, loading } = useDeveloperProfile(analysisId);

  const achievements = data?.achievements || [];
  const growth = data?.growthRecommendations || [];

  if (loading || !data) {
    return (
      <div className="p-8 text-neon-teal text-sm">
        Loading developer skills profile…
      </div>
    );
  }

  /* ---------------- RADAR ---------------- */
  const radarData = Object.entries(data?.stackSkills || {}).map(
    ([key, value]) => ({
      skill: key.toUpperCase(),
      level: Number(value) || 0,
    })
  );

  /* ---------------- LANGUAGE ---------------- */
  const languageData =
    data?.languageUsage?.length
      ? data.languageUsage
      : data?.languages?.map((lang: string, i: number) => ({
          language: lang,
          lines: (data.languages.length - i) * 8000,
        })) || [];

  /* ---------------- DETAILED SKILLS ---------------- */
  const detailedSkills = [
    { name: "React & Component Design", level: data?.stackSkills?.react ?? 0, category: "Frontend" },
    { name: "TypeScript & Type Safety", level: data?.stackSkills?.typescript ?? 0, category: "Language" },
    { name: "API Design & Integration", level: data?.stackSkills?.node ?? 0, category: "Backend" },
    { name: "Testing & Quality Assurance", level: data?.stackSkills?.testing ?? 0, category: "Quality" },
    { name: "CI/CD & DevOps", level: data?.stackSkills?.devops ?? 0, category: "DevOps" },
    { name: "Security Best Practices", level: data?.stackSkills?.security ?? 0, category: "Security" },
  ];

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

      {/* SUMMARY */}
      <Card className="mb-12 border-white/10 bg-white/5 p-8">
        <p className="text-sm text-foreground/60">AI Skill Summary</p>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          {data.skillSummary}
        </p>
        <p className="mt-4 text-neon-teal font-semibold">
          Verdict: {data.overallVerdict}
        </p>
      </Card>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Overall Score" value={`${data?.developerProfile?.overallScore}/100`} />
        <StatCard title="Skills Tracked" value={data?.developerProfile?.skillsTracked} />
        <StatCard title="Achievements" value={achievements.length} />
        <StatCard title="Growth Rate" value={`+${data?.developerProfile?.growthRate}%`} />
      </div>

      {/* ================= ROW 1 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

        {/* RADAR */}
        <Card className="border-white/10 bg-white/5 p-6">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Skills Overview
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <RadarChart outerRadius={120} data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" stroke="rgba(255,255,255,0.6)" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                dataKey="level"
                stroke="#64FFDA"
                fill="#64FFDA"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* LANGUAGE */}
        <Card className="border-white/10 bg-white/5 p-5">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Language Proficiency
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={languageData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" tick={{ fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="language" tick={{ fill: "#aaa" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
              />
              <Bar dataKey="lines" fill="#BB86FC" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>

      {/* DETAILED SKILLS */}
      <Card className="border-white/10 bg-white/5 p-8 mb-16">
        <h3 className="mb-8 text-xl font-semibold text-white">
          Detailed Skills Assessment
        </h3>

        <div className="space-y-6">
          {detailedSkills.map((skill, i) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{skill.name}</h4>
                <span className="text-neon-teal font-bold">{skill.level}%</span>
              </div>

              <Progress value={skill.level} className="mt-2 h-2 bg-white/10" />
              <p className="mt-1 text-xs text-foreground/50">{skill.category}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <Card className="mb-16 border-white/10 bg-white/5 p-8">
          <h3 className="mb-8 text-xl font-semibold text-white">Achievements</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {achievements.map((a: any, i: number) => (
              <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="h-10 w-10 mb-4 flex items-center justify-center rounded-lg bg-neon-teal/10 text-neon-teal">
                  🏆
                </div>
                <h4 className="text-white font-semibold">{a.title}</h4>
                <p className="mt-2 text-sm text-foreground/60">{a.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* GROWTH RECOMMENDATIONS */}
      {growth.length > 0 && (
        <Card className="border border-neon-teal/30 bg-white/5 p-8">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Growth Recommendations
          </h3>

          <div className="space-y-4">
            {growth.map((g: any, i: number) => (
              <div key={i} className="p-5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white font-medium">{g.title}</p>
                <p className="mt-1 text-sm text-foreground/60">{g.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <p className="text-sm text-foreground/60">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </Card>
  );
}
