"use client"

import { RegisterForm } from "@/components/auth/register-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <RegisterForm />
    </div>
  )
}