"use client"

import { X, Github } from "lucide-react"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"


interface Props {
  open: boolean
  onClose: () => void
  onAnalyze: (url: string) => void
}


export default function AnalyzeRepositoryModal({
  open,
  onClose,
  onAnalyze,
}: Props) {
  const [repoUrl, setRepoUrl] = useState("")

  const examples = [
    "https://github.com/facebook/react",
    
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-xl bg-[#0b1020] border border-white/10 rounded-xl p-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-teal/20 border border-neon-teal">
                  <Github className="w-5 h-5 text-neon-teal" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-white">
                    Analyze Repository
                  </h2>
                  <p className="text-xs text-foreground/60">
                    Enter a GitHub repository URL
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-white/40 hover:text-white"
              >
                <X />
              </button>
            </div>

            {/* Input */}
            <div className="mb-6">
              <label className="text-xs text-foreground/60 block mb-2">
                Repository URL
              </label>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-teal"
              />
            </div>

            {/* Examples */}
            <div className="mb-6">
              <p className="text-xs text-foreground/60 mb-2">Examples</p>
              <div className="space-y-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setRepoUrl(ex)}
                    className="w-full text-left text-xs text-neon-teal bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:bg-neon-teal/10"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* What we analyze */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <p className="text-xs text-neon-teal mb-2">
                What we analyze:
              </p>
              <ul className="text-xs text-foreground/70 space-y-1 list-disc pl-4">
                <li>Code quality & maintainability</li>
                <li>Architecture patterns</li>
                <li>Security & performance</li>
                <li>Developer skill profiling</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs border border-white/20 text-white/60 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => onAnalyze(repoUrl)}
                disabled={!repoUrl}
                className="px-6 py-2 text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded disabled:opacity-40"
              >
                Analyze Repository
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
