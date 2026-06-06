import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AiConfigPage() {
  const configs = await prisma.aiConfig.findMany()

  const grammarConfig = configs.find(c => c.type === 'grammar')
  const vocabConfig = configs.find(c => c.type === 'vocab-discovery')
  const quizConfig = configs.find(c => c.type === 'vocab-quiz')
  const writingConfig = configs.find(c => c.type === 'writing-practice')

  return (
    <div className="p-8 max-w-4xl font-sans">
      <h1 className="text-2xl font-extrabold text-[#303e51] mb-8">AI Configurations</h1>

      <div className="space-y-8">
        {/* Grammar Section */}
        <section>
          <h2 className="text-lg font-bold text-[#475569] mb-4">Grammar</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-72">
            <h3 className="font-bold text-[#303e51] text-[15px] mb-3">
              {grammarConfig ? grammarConfig.name : 'Add a New Config'}
            </h3>
            <Link 
              href={`/admin/ai/grammar`}
              className="block w-full text-center bg-[#1e293b] hover:bg-[#0f172a] text-white text-[13px] font-bold py-2 rounded-lg transition-colors"
            >
              {grammarConfig ? 'See Config' : 'Add new config'}
            </Link>
          </div>
        </section>

        {/* Vocabularies Section */}
        <section>
          <h2 className="text-lg font-bold text-[#475569] mb-4">Vocabularies</h2>
          <div className="flex gap-6 flex-wrap">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-72">
              <h3 className="font-bold text-[#303e51] text-[15px] mb-3">
                {vocabConfig ? vocabConfig.name : 'Discovery Config'}
              </h3>
              <Link 
                href={`/admin/ai/vocab-discovery`}
                className="block w-full text-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] text-[13px] font-bold py-2 rounded-lg transition-colors"
              >
                See Config
              </Link>
            </div>
            
            {/* New Quiz Configs */}
            {[
              { id: 'vocab-quiz-cloze', defaultName: 'Quiz - Cloze test' },
              { id: 'vocab-quiz-collocation', defaultName: 'Quiz - Collocation matching' },
              { id: 'vocab-quiz-morphology', defaultName: 'Quiz - Word mapping (Morphology)' },
              { id: 'vocab-quiz-pushed', defaultName: 'Quiz - Pushed Output' },
              { id: 'vocab-paraphrase', defaultName: 'Practice Paraphrase Config' }
            ].map(typeConfig => {
              const config = configs.find(c => c.type === typeConfig.id)
              return (
                <div key={typeConfig.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-72">
                  <h3 className="font-bold text-[#303e51] text-[15px] mb-3">
                    {config ? config.name : typeConfig.defaultName}
                  </h3>
                  <Link 
                    href={`/admin/ai/${typeConfig.id}`}
                    className="block w-full text-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] text-[13px] font-bold py-2 rounded-lg transition-colors"
                  >
                    See Config
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* Writing Section */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-[#475569] mb-4">Writing Practice</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                <span className="font-semibold text-[#334155]">
                  {writingConfig ? writingConfig.name : 'Writing Practice Config'}
                </span>
                <Link 
                  href={`/admin/ai/writing-practice`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Edit Config
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
