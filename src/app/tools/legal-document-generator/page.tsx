'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Download, Copy, AlertTriangle } from 'lucide-react'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  fields: DocumentField[]
  template: string
}

interface DocumentField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date'
  required: boolean
  options?: string[]
  placeholder?: string
}

interface GeneratedDocument {
  content: string
  variables: Record<string, string>
  warnings: string[]
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Confidentiality agreement between parties',
    fields: [
      { name: 'party1', label: 'First Party Name', type: 'text', required: true, placeholder: 'Company A' },
      { name: 'party2', label: 'Second Party Name', type: 'text', required: true, placeholder: 'Company B' },
      { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
      { name: 'term', label: 'Term (years)', type: 'text', required: true, placeholder: '2' },
      { name: 'confidentialInfo', label: 'Confidential Information Description', type: 'textarea', required: true, placeholder: 'Technical specifications, business plans...' },
      { name: 'jurisdiction', label: 'Governing Law Jurisdiction', type: 'select', required: true, options: ['California', 'New York', 'Texas', 'Florida', 'Other'] }
    ],
    template: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on {{effectiveDate}} ("Effective Date") by and between:

{{party1}}, with a principal place of business at [Address] ("Disclosing Party"), and {{party2}}, with a principal place of business at [Address] ("Receiving Party").

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" shall mean any and all technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information disclosed to the Receiving Party by the Disclosing Party, whether orally, in writing, or otherwise.

Specifically, the following information is considered confidential: {{confidentialInfo}}

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall:
a) Hold the Confidential Information in strict confidence;
b) Not disclose the Confidential Information to any third parties;
c) Use the Confidential Information solely for the purpose of evaluating the potential business relationship;
d) Take reasonable precautions to protect the Confidential Information.

3. TERM
This Agreement shall commence on the Effective Date and continue for a period of {{term}} years.

4. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of {{jurisdiction}}.

5. RETURN OF INFORMATION
Upon written request of the Disclosing Party, the Receiving Party shall promptly return all documents and materials containing Confidential Information.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

_________________________
{{party1}}

_________________________
{{party2}}`
  },
  {
    id: 'employment-contract',
    name: 'Employment Contract',
    description: 'Standard employment agreement between employer and employee',
    fields: [
      { name: 'employer', label: 'Employer Name', type: 'text', required: true, placeholder: 'Company Name' },
      { name: 'employee', label: 'Employee Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'position', label: 'Position Title', type: 'text', required: true, placeholder: 'Software Developer' },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'salary', label: 'Annual Salary', type: 'text', required: true, placeholder: '$75,000' },
      { name: 'workHours', label: 'Work Hours per Week', type: 'text', required: true, placeholder: '40' },
      { name: 'benefits', label: 'Benefits Description', type: 'textarea', required: false, placeholder: 'Health insurance, 401(k), paid time off...' },
      { name: 'terminationNotice', label: 'Termination Notice Period', type: 'select', required: true, options: ['2 weeks', '30 days', '60 days', '90 days'] }
    ],
    template: `EMPLOYMENT CONTRACT

This Employment Contract ("Contract") is entered into on [Current Date] by and between:

{{employer}} ("Employer") and {{employee}} ("Employee").

1. POSITION AND DUTIES
The Employer agrees to employ the Employee in the position of {{position}}. The Employee shall perform such duties as are customarily associated with this position and as may be assigned by the Employer.

2. COMPENSATION
The Employee shall receive an annual salary of {{salary}}, payable in accordance with the Employer's standard payroll practices.

3. WORK SCHEDULE
The Employee shall work {{workHours}} hours per week, Monday through Friday, during normal business hours.

4. BENEFITS
The Employee shall be eligible for the following benefits:
{{benefits || 'Standard company benefits including health insurance and retirement plan'}}

5. TERM OF EMPLOYMENT
This employment shall commence on {{startDate}} and shall continue until terminated by either party in accordance with the terms of this Contract.

6. TERMINATION
Either party may terminate this employment relationship by providing {{terminationNotice}} written notice to the other party.

7. CONFIDENTIALITY
The Employee agrees to maintain the confidentiality of all proprietary information and trade secrets of the Employer.

8. ENTIRE AGREEMENT
This Contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.

IN WITNESS WHEREOF, the parties have executed this Contract as of the date first written above.

_________________________
{{employer}}

_________________________
{{employee}}`
  },
  {
    id: 'lease-agreement',
    name: 'Residential Lease Agreement',
    description: 'Standard rental agreement for residential property',
    fields: [
      { name: 'landlord', label: 'Landlord Name', type: 'text', required: true, placeholder: 'Property Owner' },
      { name: 'tenant', label: 'Tenant Name', type: 'text', required: true, placeholder: 'John Doe' },
      { name: 'propertyAddress', label: 'Property Address', type: 'text', required: true, placeholder: '123 Main St, City, State' },
      { name: 'leaseTerm', label: 'Lease Term (months)', type: 'text', required: true, placeholder: '12' },
      { name: 'monthlyRent', label: 'Monthly Rent', type: 'text', required: true, placeholder: '$1,200' },
      { name: 'securityDeposit', label: 'Security Deposit', type: 'text', required: true, placeholder: '$1,200' },
      { name: 'startDate', label: 'Lease Start Date', type: 'date', required: true },
      { name: 'utilities', label: 'Utilities Responsibility', type: 'select', required: true, options: ['Tenant pays all', 'Landlord pays all', 'Split as specified'] }
    ],
    template: `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Lease") is made and entered into on [Current Date] by and between:

{{landlord}} ("Landlord") and {{tenant}} ("Tenant").

1. PROPERTY
The Landlord agrees to rent to the Tenant the residential property located at:
{{propertyAddress}} ("Property").

2. TERM
The term of this Lease shall be {{leaseTerm}} months, commencing on {{startDate}} and ending on [End Date].

3. RENT
The Tenant shall pay monthly rent of {{monthlyRent}}, due on the first day of each month.

4. SECURITY DEPOSIT
The Tenant shall pay a security deposit of {{securityDeposit}} prior to taking possession of the Property.

5. UTILITIES
{{utilities === 'Tenant pays all' ? 'The Tenant shall be responsible for all utilities including electricity, gas, water, sewer, trash, and internet.' : utilities === 'Landlord pays all' ? 'The Landlord shall be responsible for all utilities including electricity, gas, water, sewer, trash, and internet.' : 'Utilities shall be split as follows: [Specify utility responsibilities]'}}

6. USE OF PROPERTY
The Property shall be used solely as a private residential dwelling. No business activities shall be conducted on the premises.

7. MAINTENANCE AND REPAIRS
The Tenant shall maintain the Property in good condition and promptly report any needed repairs to the Landlord.

8. DEFAULT
If the Tenant fails to pay rent when due or violates any term of this Lease, the Landlord may terminate this agreement.

9. SECURITY DEPOSIT RETURN
The security deposit shall be returned within 30 days after the end of the lease term, less any deductions for damages beyond normal wear and tear.

IN WITNESS WHEREOF, the parties have executed this Lease as of the date first written above.

_________________________
{{landlord}}

_________________________
{{tenant}}`
  }
]

export default function LegalDocumentGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null)

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const generateDocument = () => {
    if (!selectedTemplate) return

    const template = documentTemplates.find(t => t.id === selectedTemplate)
    if (!template) return

    // Validate required fields
    const missingFields = template.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label)

    const warnings: string[] = []
    if (missingFields.length > 0) {
      warnings.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Generate document content
    let content = template.template
    const variables: Record<string, string> = {}

    template.fields.forEach(field => {
      const value = formData[field.name] || `[${field.label}]`
      variables[field.name] = value
      content = content.replace(new RegExp(`{{${field.name}}}`, 'g'), value)
    })

    setGeneratedDocument({
      content,
      variables,
      warnings
    })
  }

  const copyToClipboard = () => {
    if (generatedDocument) {
      navigator.clipboard.writeText(generatedDocument.content)
    }
  }

  const downloadDocument = () => {
    if (generatedDocument && selectedTemplate) {
      const template = documentTemplates.find(t => t.id === selectedTemplate)
      const filename = `${template?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
      
      const blob = new Blob([generatedDocument.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getSelectedTemplate = () => {
    return documentTemplates.find(t => t.id === selectedTemplate)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Legal Document Generator</h1>
        <p className="text-muted-foreground">
          Generate professional legal documents with customizable templates
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Setup
            </CardTitle>
            <CardDescription>
              Select a template and fill in the required information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Document Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{getSelectedTemplate()?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {getSelectedTemplate()?.description}
                  </p>
                </div>

                {getSelectedTemplate()?.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'select' ? (
                      <Select
                        value={formData[field.name] || ''}
                        onValueChange={(value) => handleFieldChange(field.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type === 'date' ? 'date' : 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}

                <Button onClick={generateDocument} className="w-full">
                  Generate Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {generatedDocument && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Document
              </CardTitle>
              <CardDescription>
                Your legal document is ready for review and download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadDocument} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {generatedDocument.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Warnings</span>
                    </div>
                    {generatedDocument.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-yellow-700">
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}

                <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedDocument.content}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Alert className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Legal Disclaimer</AlertTitle>
        <AlertDescription>
          This document generator provides templates for informational purposes only. These are not legal documents and should not be considered legal advice. 
          Always consult with a qualified attorney before using any legal document. The templates may need to be modified to comply with local laws and regulations.
        </AlertDescription>
      </Alert>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {documentTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Fields: {template.fields.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Required: {template.fields.filter(f => f.required).length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}