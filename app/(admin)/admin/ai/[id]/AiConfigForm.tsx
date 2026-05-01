'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const PREDEFINED_MODELS = [
  'gemini/gemini-2.0-flash',
  'gemini/gemini-2.0-flash-lite',
  'gemini/gemini-2.5-flash',
  'gemini/gemini-2.5-flash-lite',
  'gemini/gemini-2.5-pro',
  'gemini/gemini-3-flash-preview',
  'gemini/gemini-3-pro-preview',
  'gemini/gemini-3.1-flash-lite-preview',
  'gemini/gemini-3.1-pro-preview',
]

interface AiConfigData {
  id: string
  type: string
  name: string
  baseUrl: string | null
  apiKey: string | null
  modelName: string | null
  globalPrompt: string | null
  updatedAt: Date | string | null
}

export default function AiConfigForm({ initialData, configId }: { initialData: AiConfigData | null, configId: string }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // Initialize state based on whether data exists
  const isCustomModelInitial = initialData?.modelName && !PREDEFINED_MODELS.includes(initialData.modelName)
  const defaultModelName = initialData?.modelName || PREDEFINED_MODELS[0]

  const [baseUrl, setBaseUrl] = useState(initialData?.baseUrl || '')
  const [apiKey, setApiKey] = useState(initialData?.apiKey || '')
  const [selectedModel, setSelectedModel] = useState(isCustomModelInitial ? 'Custom Model' : defaultModelName)
  const [customModel, setCustomModel] = useState(isCustomModelInitial ? initialData.modelName : '')
  const [prompt, setPrompt] = useState(initialData?.globalPrompt || '')

  // Re-sync form state when initialData changes (after save + router.refresh)
  useEffect(() => {
    setBaseUrl(initialData?.baseUrl || '')
    setApiKey(initialData?.apiKey || '')
    const isCustom = initialData?.modelName && !PREDEFINED_MODELS.includes(initialData.modelName)
    setSelectedModel(isCustom ? 'Custom Model' : (initialData?.modelName || PREDEFINED_MODELS[0]))
    setCustomModel(isCustom ? (initialData?.modelName || '') : '')
    setPrompt(initialData?.globalPrompt || '')
  }, [initialData])

  const defaultName = configId === 'grammar' ? 'Grammar Config' : 'Discovery Config'

  const handleSave = async () => {
    setIsSaving(true)
    const finalModel = selectedModel === 'Custom Model' ? customModel : selectedModel
    
    try {
      const res = await fetch(`/api/admin/ai/${configId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: configId === 'grammar' ? 'grammar' : 'vocab-discovery',
          name: initialData?.name || defaultName,
          baseUrl,
          apiKey,
          modelName: finalModel,
          globalPrompt: prompt
        })
      })

      if (!res.ok) throw new Error('Failed to save config')
      toast.success('Configuration saved successfully!')
      router.refresh()
    } catch (error) {
      toast.error('Error saving configuration')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    try {
      const finalModel = selectedModel === 'Custom Model' ? customModel : selectedModel
      const res = await fetch(`/api/admin/ai/${configId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl,
          apiKey,
          modelName: finalModel,
          globalPrompt: prompt
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Test failed')
      }
      
      toast.success('Connection successful!')
    } catch (error: any) {
      toast.error(`Connection failed: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-[#303e51]">
          {initialData?.name || defaultName}
        </h1>
        <div className="flex gap-3 items-end flex-col">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleTest} disabled={isTesting || isSaving}>
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isTesting} className="bg-[#1e293b] hover:bg-[#0f172a] text-white flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
              Save
            </Button>
          </div>
          {initialData?.updatedAt && (
            <p className="text-xs text-gray-400">
              Last saved: {new Date(initialData.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-sm font-bold text-[#475569] font-sans">Base URL</Label>
            <Input 
              id="baseUrl" 
              placeholder="Field text goes here" 
              value={baseUrl} 
              onChange={(e) => setBaseUrl(e.target.value)}
              className="font-sans text-sm h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-bold text-[#475569] font-sans">API Key</Label>
            <Input 
              id="apiKey" 
              type="password"
              placeholder="Field text goes here" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="font-sans text-sm h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-[#475569] font-sans">Model Selector</Label>
            <Select value={selectedModel} onValueChange={(val) => setSelectedModel(val || '')}>
              <SelectTrigger className="font-sans text-sm h-11 w-full bg-white">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_MODELS.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
                <SelectItem value="Custom Model">Custom Model</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedModel === 'Custom Model' && (
            <div className="space-y-2">
              <Label htmlFor="customModel" className="text-sm font-bold text-[#475569] font-sans">Custom Model Name</Label>
              <Input 
                id="customModel" 
                placeholder="Enter custom model name..." 
                value={customModel || ''} 
                onChange={(e) => setCustomModel(e.target.value)}
                className="font-sans text-sm h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-bold text-[#475569] font-sans">Prompt</Label>
            <Textarea 
              id="prompt" 
              placeholder="Enter the global prompt..." 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[400px] resize-y p-4 text-[14px] leading-relaxed text-[#334155] font-sans tracking-tight focus-visible:ring-[#303e51]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
