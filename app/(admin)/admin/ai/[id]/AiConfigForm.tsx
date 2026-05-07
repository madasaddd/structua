'use client'

import { useState, useEffect, useRef } from 'react'
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
  jsonFileUrl: string | null
  jsonFileName: string | null
  updatedAt: Date | string | null
}

export default function AiConfigForm({ initialData, configId }: { initialData: AiConfigData | null, configId: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Initialize state based on whether data exists
  const isCustomModelInitial = initialData?.modelName && !PREDEFINED_MODELS.includes(initialData.modelName)
  const defaultModelName = initialData?.modelName || PREDEFINED_MODELS[0]

  const [baseUrl, setBaseUrl] = useState(initialData?.baseUrl || '')
  const [apiKey, setApiKey] = useState(initialData?.apiKey || '')
  const [selectedModel, setSelectedModel] = useState(isCustomModelInitial ? 'Custom Model' : defaultModelName)
  const [customModel, setCustomModel] = useState(isCustomModelInitial ? initialData.modelName : '')
  const [prompt, setPrompt] = useState(initialData?.globalPrompt || '')
  const [jsonFileUrl, setJsonFileUrl] = useState(initialData?.jsonFileUrl || null)
  const [jsonFileName, setJsonFileName] = useState(initialData?.jsonFileName || null)

  // Re-sync form state when initialData changes (after save + router.refresh)
  useEffect(() => {
    setBaseUrl(initialData?.baseUrl || '')
    setApiKey(initialData?.apiKey || '')
    const isCustom = initialData?.modelName && !PREDEFINED_MODELS.includes(initialData.modelName)
    setSelectedModel(isCustom ? 'Custom Model' : (initialData?.modelName || PREDEFINED_MODELS[0]))
    setCustomModel(isCustom ? (initialData?.modelName || '') : '')
    setPrompt(initialData?.globalPrompt || '')
    setJsonFileUrl(initialData?.jsonFileUrl || null)
    setJsonFileName(initialData?.jsonFileName || null)
  }, [initialData])

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isEditing])

  const defaultName = configId === 'grammar' ? 'Grammar Config' : 'Discovery Config'

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      
      const data = await res.json()
      setJsonFileUrl(data.url)
      setJsonFileName(file.name)
      toast.success('File uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Error uploading file')
      console.error(error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteFile = () => {
    setJsonFileUrl(null)
    setJsonFileName(null)
  }

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
          globalPrompt: prompt,
          jsonFileUrl,
          jsonFileName
        })
      })

      if (!res.ok) throw new Error('Failed to save config')
      toast.success('Configuration saved successfully!')
      setIsEditing(false)
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

  const handleCancel = () => {
    if (confirm('Discard unsaved changes?')) {
      setIsEditing(false)
      // Reset state back to initialData
      setBaseUrl(initialData?.baseUrl || '')
      setApiKey(initialData?.apiKey || '')
      const isCustom = initialData?.modelName && !PREDEFINED_MODELS.includes(initialData.modelName)
      setSelectedModel(isCustom ? 'Custom Model' : (initialData?.modelName || PREDEFINED_MODELS[0]))
      setCustomModel(isCustom ? (initialData?.modelName || '') : '')
      setPrompt(initialData?.globalPrompt || '')
      setJsonFileUrl(initialData?.jsonFileUrl || null)
      setJsonFileName(initialData?.jsonFileName || null)
    }
  }

  // Icons
  const EditIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
  
  const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
  
  const EyeOffIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

  const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )

  const AttachmentIcon = () => (
    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  )

  return (
    <div className="p-8 max-w-4xl font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-[#303e51]">
          {initialData?.name || defaultName}
        </h1>
        <div className="flex gap-3 items-end flex-col">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="bg-white hover:bg-gray-50">
              <EditIcon /> Edit
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleCancel} disabled={isSaving || isTesting}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleTest} disabled={isTesting || isSaving}>
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isTesting} className="bg-[#1e293b] hover:bg-[#0f172a] text-white flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                {isSaving ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          )}
          {initialData?.updatedAt && !isEditing && (
            <p className="text-xs text-gray-400">
              Last saved: {new Date(initialData.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-[#F8FAFC]">
        <CardContent className="p-6 space-y-6">
          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-sm font-bold text-[#475569] font-sans">Base URL</Label>
            {isEditing ? (
              <Input 
                id="baseUrl" 
                placeholder="Enter Base URL" 
                value={baseUrl} 
                onChange={(e) => setBaseUrl(e.target.value)}
                className="font-sans text-sm h-11 bg-white"
              />
            ) : (
              <div className="font-sans text-sm h-11 bg-white border border-gray-200 rounded-md px-3 flex items-center text-gray-600">
                {baseUrl || <span className="text-gray-400 italic">Not set</span>}
              </div>
            )}
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-bold text-[#475569] font-sans">API Key</Label>
            {isEditing ? (
              <div className="relative">
                <Input 
                  id="apiKey" 
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter API Key" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-sans text-sm h-11 bg-white pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="font-sans text-[16px] h-11 bg-white border border-gray-200 rounded-md px-3 flex items-center text-gray-600 pr-10 truncate tracking-widest">
                  {showApiKey ? apiKey || <span className="text-gray-400 italic tracking-normal text-sm">Not set</span> : (apiKey ? '••••••••••••••••' : <span className="text-gray-400 italic tracking-normal text-sm">Not set</span>)}
                </div>
                {apiKey && (
                  <button 
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-[#475569] font-sans">Model Selector</Label>
            {isEditing ? (
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
            ) : (
              <div className="font-sans text-sm h-11 bg-white border border-gray-200 rounded-md px-3 flex items-center text-gray-600">
                {selectedModel === 'Custom Model' ? customModel : selectedModel || <span className="text-gray-400 italic">Not set</span>}
              </div>
            )}
          </div>

          {isEditing && selectedModel === 'Custom Model' && (
            <div className="space-y-2">
              <Label htmlFor="customModel" className="text-sm font-bold text-[#475569] font-sans">Custom Model Name</Label>
              <Input 
                id="customModel" 
                placeholder="Enter custom model name..." 
                value={customModel || ''} 
                onChange={(e) => setCustomModel(e.target.value)}
                className="font-sans text-sm h-11 bg-white"
              />
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-bold text-[#475569] font-sans">Prompt</Label>
            {isEditing ? (
              <Textarea 
                id="prompt" 
                placeholder="Enter the global prompt..." 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[300px] resize-y p-4 text-[14px] leading-relaxed text-[#334155] font-sans tracking-tight focus-visible:ring-[#303e51] bg-white"
              />
            ) : (
              <div className="min-h-[300px] bg-white border border-gray-200 rounded-md p-4 text-[14px] leading-relaxed text-[#334155] font-sans tracking-tight whitespace-pre-wrap">
                {prompt || <span className="text-gray-400 italic">No prompt provided</span>}
              </div>
            )}
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-[#475569] font-sans">JSON Input</Label>
            {jsonFileUrl && jsonFileName ? (
              <div className="flex items-center justify-between bg-[#EFF6FF] border border-[#BFDBFE] rounded-md p-3 text-sm">
                <div className="flex items-center text-[#1E3A8A]">
                  <AttachmentIcon />
                  <span className="font-medium truncate max-w-[300px]">{jsonFileName}</span>
                </div>
                
                {isEditing ? (
                  <button 
                    onClick={handleDeleteFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors focus:outline-none"
                    title="Delete file"
                  >
                    <TrashIcon />
                  </button>
                ) : (
                  <a 
                    href={jsonFileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#1E3A8A] hover:text-[#1E40AF] p-1 rounded-md hover:bg-blue-100 transition-colors focus:outline-none"
                    title="Download file"
                  >
                    <DownloadIcon />
                  </a>
                )}
              </div>
            ) : isEditing ? (
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                        <p className="text-sm text-gray-500 font-sans">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 font-sans"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500 font-sans">JSON files only</p>
                      </>
                    )}
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    accept=".json,application/json" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            ) : (
              <div className="font-sans text-sm h-11 bg-white border border-gray-200 rounded-md px-3 flex items-center text-gray-400 italic">
                No JSON file attached
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
