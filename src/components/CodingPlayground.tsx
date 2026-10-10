import { useState, useCallback } from "react"
import { useApp } from "@/hooks/useApp"
import { useChallenges } from "@/hooks/queries"
import { ErrorState, Spinner } from "@/components/ui"
import type { PlaygroundChallenge } from "@/api"
import { Play, CheckCircle2, XCircle, RotateCcw, ChevronDown } from "lucide-react"

function Workspace({ challenges }: { challenges: PlaygroundChallenge[] }) {
  const { navigate } = useApp()
  const [selectedChallenge, setSelectedChallenge] = useState<PlaygroundChallenge>(challenges[0])
  const [html, setHtml] = useState(selectedChallenge.starterHtml)
  const [css, setCss] = useState(selectedChallenge.starterCss)
  const [js, setJs] = useState(selectedChallenge.starterJs)
  const [results, setResults] = useState<{ name: string; passed: boolean }[] | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  const [previewDoc, setPreviewDoc] = useState(`<!DOCTYPE html><html><head><style>${selectedChallenge.starterCss}</style></head><body>${selectedChallenge.starterHtml}<script>${selectedChallenge.starterJs}<\/script></body></html>`)

  const runCode = useCallback(() => {
    setPreviewDoc(`<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`)

    // Run tests against the code
    const testResults = selectedChallenge.tests.map(test => {
      const allCode = `${html} ${css} ${js}`
      const passed = allCode.includes(test.check)
      return { name: test.name, passed }
    })
    setResults(testResults)
  }, [html, css, js, selectedChallenge])

  const resetCode = () => {
    setHtml(selectedChallenge.starterHtml)
    setCss(selectedChallenge.starterCss)
    setJs(selectedChallenge.starterJs)
    setResults(null)
  }

  const selectChallenge = (c: PlaygroundChallenge) => {
    setSelectedChallenge(c)
    setHtml(c.starterHtml)
    setCss(c.starterCss)
    setJs(c.starterJs)
    setResults(null)
  }

  const allPassed = results?.every(r => r.passed)

  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coding Playground</h1>
            <p className="text-gray-500 text-sm mt-1">Practice HTML, CSS, and JavaScript in a live sandbox</p>
          </div>
          <button onClick={() => navigate("student-dashboard")} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Back to Dashboard
          </button>
        </div>

        {/* Challenge selector */}
        <div className="mb-4 flex flex-wrap gap-2">
          {challenges.map(c => (
            <button
              key={c.id}
              onClick={() => selectChallenge(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedChallenge.id === c.id
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-purple-200"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        {/* Challenge description */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <p className="text-sm text-gray-700">{selectedChallenge.description}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Editors */}
          <div className="space-y-3">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
                <span className="text-xs font-medium text-orange-400">HTML</span>
                <ChevronDown size={12} className="text-gray-500" />
              </div>
              <textarea
                value={html}
                onChange={e => setHtml(e.target.value)}
                className="w-full h-28 bg-transparent text-green-300 font-mono text-xs p-3 resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
                <span className="text-xs font-medium text-blue-400">CSS</span>
                <ChevronDown size={12} className="text-gray-500" />
              </div>
              <textarea
                value={css}
                onChange={e => setCss(e.target.value)}
                className="w-full h-32 bg-transparent text-green-300 font-mono text-xs p-3 resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
                <span className="text-xs font-medium text-yellow-400">JavaScript</span>
                <ChevronDown size={12} className="text-gray-500" />
              </div>
              <textarea
                value={js}
                onChange={e => setJs(e.target.value)}
                className="w-full h-32 bg-transparent text-green-300 font-mono text-xs p-3 resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={runCode}
                className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <Play size={14} /> Run Code
              </button>
              <button
                onClick={resetCode}
                className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {showPreview ? "Hide" : "Show"} Preview
              </button>
            </div>
          </div>

          {/* Preview + Results */}
          <div className="space-y-4">
            {showPreview && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <span className="text-xs font-medium text-gray-500">Live Preview</span>
                </div>
                <iframe
                  srcDoc={previewDoc}
                  title="Code preview"
                  className="w-full h-64 border-0 bg-white"
                  sandbox="allow-scripts"
                />
              </div>
            )}

            {/* Test results */}
            {results && (
              <div className={`rounded-xl border p-4 ${allPassed ? "bg-green-50 border-green-100" : "bg-white border-gray-100"}`}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {allPassed ? "All Tests Passed!" : "Test Results"}
                </h3>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {r.passed
                        ? <CheckCircle2 size={16} className="text-green-500" />
                        : <XCircle size={16} className="text-red-400" />}
                      <span className={r.passed ? "text-green-700" : "text-gray-600"}>{r.name}</span>
                    </div>
                  ))}
                </div>
                {allPassed && (
                  <p className="mt-3 text-xs text-green-600 font-medium">
                    Challenge complete! Select another challenge to continue practicing.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


export default function CodingPlayground() {
  const { data, isLoading, isError, error, refetch } = useChallenges()
  if (isLoading) return <main className="pt-24 min-h-screen bg-[#F8F7FF]"><Spinner label="Loading challenges" /></main>
  if (isError || !data?.length) return <main className="pt-24 min-h-screen bg-[#F8F7FF]"><ErrorState message={error?.message ?? "No challenges available yet."} onRetry={() => refetch()} /></main>
  return <Workspace challenges={data} />
}
