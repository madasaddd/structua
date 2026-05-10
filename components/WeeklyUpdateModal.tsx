'use client'

import { useState, isValidElement } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WeeklyUpdateModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
}

export function WeeklyUpdateModal({ children, open, onOpenChange, triggerClassName }: WeeklyUpdateModalProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)

  // Use either controlled or uncontrolled state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    setInternalOpen(newOpen);
    if (!newOpen) {
      // Reset state after a short delay so the closing animation doesn't snap
      setTimeout(() => setIsSuccess(false), 300);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const url = form.action;
    const formData = new FormData(form);
    
    try {
      // Use no-cors to prevent CORS issues with Google Forms
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger className={triggerClassName}>
          {children}
        </DialogTrigger>
      )}
      
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        <div className="p-8 flex flex-col items-center text-center">
          
          {!isSuccess ? (
            // Form State
            <>
              {/* Mailbox / Bell Illustration */}
              <div className="mb-6 relative w-16 h-16">
                <Image
                  src="/icons/mailbox.png"
                  alt="Subscription Icon"
                  fill
                  className="object-contain"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                You&apos;re almost in!
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-500 mb-6 max-w-[280px]">
                Enter your email below to receive our weekly summary of new features every Saturday.
              </p>

              <form 
                action="https://docs.google.com/forms/d/e/1FAIpQLSc-Rwp_Ze37YHatFe6z8U66h08kK1IKBY7WqltK3_xzqX9cxg/formResponse" 
                method="POST" 
                onSubmit={handleSubmit}
                className="w-full space-y-4"
              >
                <div className="w-full">
                  <Input 
                    type="email" 
                    name="entry.428993257" 
                    required
                    placeholder="asad@company.com" 
                    className="h-12 rounded-xl text-base px-4 border-gray-200 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 w-full pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOpenChange(false)}
                    className="flex-1 h-12 rounded-xl text-[15px] font-semibold border-gray-200 text-slate-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 rounded-xl text-[15px] font-semibold bg-[#111827] text-white hover:bg-slate-800 shadow-md"
                  >
                    Get Update
                  </Button>
                </div>
              </form>
            </>
          ) : (
            // Success State
            <div className="py-4 flex flex-col items-center animate-in zoom-in-95 duration-300">
              {/* Green Checkmark Circle */}
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                You&apos;re on the list.
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-500 mb-8 max-w-[280px]">
                Thank you for subscribing. You&apos;ll receive your first weekly update this coming Saturday.
              </p>

              <Button 
                onClick={() => handleOpenChange(false)}
                className="w-full h-12 rounded-xl text-[15px] font-semibold bg-[#111827] text-white hover:bg-slate-800 shadow-md"
              >
                Got it
              </Button>
            </div>
          )}

        </div>

      </DialogContent>
    </Dialog>
  )
}
