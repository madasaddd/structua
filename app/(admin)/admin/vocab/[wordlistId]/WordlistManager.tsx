'use client'

import { useState } from 'react'
import WordlistEditorClient from './WordlistEditorClient'
import DiscoveryEditorClient from './DiscoveryEditorClient'
import QuizEditorClient from './QuizEditorClient'

export default function WordlistManager({ wordlist }: { wordlist: any }) {
  const [activeTab, setActiveTab] = useState('vocab')

  if (activeTab === 'vocab') {
    return <WordlistEditorClient wordlist={wordlist} activeTab={activeTab} onTabChange={setActiveTab} />
  }

  if (activeTab === 'discovery') {
    return <DiscoveryEditorClient wordlist={wordlist} activeTab={activeTab} onTabChange={setActiveTab} />
  }

  if (activeTab === 'quiz') {
    return <QuizEditorClient wordlist={wordlist} activeTab={activeTab} onTabChange={setActiveTab} />
  }

  return null
}
