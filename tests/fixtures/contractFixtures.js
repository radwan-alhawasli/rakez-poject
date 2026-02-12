/**
 * Contract test fixtures
 */

export const mockContract = {
  id: 1,
  project_name: 'Riyadh Luxury Towers',
  developer_name: 'Al-Majed Development Co.',
  developer_number: '+966112345678',
  city: 'Riyadh',
  district: 'Al-Malqa',
  notes: 'Premium residential project in northern Riyadh',
  status: 'pending',
  created_at: '2026-01-15T10:00:00.000000Z'
}

export const mockContractList = [
  mockContract,
  {
    id: 2,
    project_name: 'Jeddah Waterfront',
    developer_name: 'Coastal Developers',
    city: 'Jeddah',
    status: 'approved',
    created_at: '2026-01-20T10:00:00.000000Z'
  }
]

export const mockCreateContractRequest = {
  project_name: 'Riyadh Luxury Towers',
  developer_name: 'Al-Majed Development Co.',
  developer_number: '+966112345678',
  city: 'Riyadh',
  district: 'Al-Malqa',
  notes: 'Premium residential project in northern Riyadh'
}

export const mockCreateContractResponse = {
  success: true,
  message: 'Contract created successfully',
  data: mockContract
}

export const mockUnit = {
  id: 1,
  contract_id: 1,
  unit_type: 'apartment',
  unit_number: '101',
  price: 500000,
  area: 120,
  description: '2-bedroom apartment'
}

export const mockSecondPartyData = {
  id: 1,
  contract_id: 1,
  real_estate_papers_url: 'https://storage.rakez.com/papers.pdf',
  plans_equipment_docs_url: 'https://storage.rakez.com/plans.pdf',
  project_logo_url: 'https://storage.rakez.com/logo.png'
}
