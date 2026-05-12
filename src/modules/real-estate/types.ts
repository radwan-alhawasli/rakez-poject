export type PropertyStatus = 'جاهز للسكن' | 'قيد الإنشاء' | 'فرصة استثمارية'

export type PropertyCategory = 'شقة' | 'فيلا' | 'بنتهاوس' | 'تاون هاوس'

export interface PropertyAgent {
  id: string
  name: string
  title: string
  phone: string
  avatar: string
}

export interface PropertyFeature {
  title: string
  value: string
}

export interface PropertyRecord {
  id: string
  title: string
  city: string
  district: string
  category: PropertyCategory
  status: PropertyStatus
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  roi: number
  handover: string
  cover: string
  summary: string
  features: PropertyFeature[]
  agent: PropertyAgent
}

export interface LeadFormValues {
  fullName: string
  phone: string
  city: string
  budget: string
  category: string
  notes: string
  consent: boolean
}
