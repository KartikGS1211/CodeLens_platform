"use client";

import { X, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAnalyze: (url: string) => void;
}

export default function AnalyzeRepositoryModal({
  open,
  onClose,
  onAnalyze,
}: Props) {
  const [repoUrl, setRepoUrl] = useState("");

  const examples = ["https://github.com/facebook/react"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-cl-surface border border-cl-border rounded-card p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-cl-accent/10 border border-cl-accent/25">
                  <Github className="w-5 h-5 text-cl-accent" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-cl-text">
                    Analyze Repository
                  </h2>
                  <p className="text-xs text-cl-muted mt-0.5">
                    Enter a GitHub repository URL
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-cl-muted hover:text-cl-text transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input */}
            <div className="mb-6">
              <label className="text-xs text-cl-muted block mb-2 font-medium">
                Repository URL
              </label>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full bg-cl-bg border border-cl-border rounded-md px-3.5 py-2.5 text-sm text-cl-text placeholder-cl-muted/50 focus:outline-none focus:border-cl-accent focus:ring-1 focus:ring-cl-accent transition-all font-sans"
              />
            </div>

            {/* Examples */}
            <div className="mb-6">
              <p className="text-xs text-cl-muted mb-2 font-medium">Examples</p>
              <div className="space-y-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setRepoUrl(ex)}
                    className="w-full text-left text-xs text-cl-accent bg-cl-bg border border-cl-border rounded-md px-3 py-2.5 hover:bg-cl-accent/5 hover:border-cl-accent/30 transition-all font-mono"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* What we analyze */}
            <div className="bg-cl-bg border border-cl-border rounded-md p-4 mb-6">
              <p className="text-xs text-cl-accent font-semibold mb-2">
                What we analyze:
              </p>
              <ul className="text-xs text-cl-muted space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Code quality &amp; maintainability</li>
                <li>Architecture patterns</li>
                <li>Security &amp; performance indicators</li>
                <li>Developer skill profiling metrics</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs border border-cl-border text-cl-muted rounded-md hover:bg-cl-bg hover:text-cl-text transition-all font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() => onAnalyze(repoUrl)}
                disabled={!repoUrl}
                className="px-5 py-2 text-xs font-semibold bg-cl-accent hover:bg-cl-accent-hover text-white rounded-md disabled:opacity-40 transition-all"
              >
                Analyze Repo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
