import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AiConfigPage() {
  const configs = await prisma.aiConfig.findMany()

  const grammarConfig = configs.find(c => c.type === 'grammar')
  const vocabConfig = configs.find(c => c.type === 'vocab-discovery')
  const quizConfig = configs.find(c => c.type === 'vocab-quiz')

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
      </div>
    </div>
  )
}
