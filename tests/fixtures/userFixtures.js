/**
 * User/Employee test fixtures
 */

export const mockEmployee = {
  id: 1,
  name: 'Ahmed Mohammed Al-Ghamdi',
  email: 'ahmed.ghamdi@rakez.com',
  type: 'sales',
  phone: '+966505551234',
  salary: 8000.0,
  hire_date: '2026-02-01',
  job_title: 'Senior Sales Executive',
  commission_eligibility: true,
  created_at: '2026-02-01T00:00:00.000000Z',
};

export const mockEmployeeList = [
  mockEmployee,
  {
    id: 2,
    name: 'Sara Al-Mansouri',
    email: 'sara.mansouri@rakez.com',
    type: 'marketing',
    phone: '+966505551235',
    salary: 7500.0,
    created_at: '2026-02-01T00:00:00.000000Z',
  },
];

export const mockCreateEmployeeRequest = {
  name: 'Ahmed Mohammed Al-Ghamdi',
  email: 'ahmed.ghamdi@rakez.com',
  password: 'SecurePass123!',
  password_confirmation: 'SecurePass123!',
  type: 'sales',
  phone: '+966505551234',
  salary: 8000.0,
  hire_date: '2026-02-01',
  job_title: 'Senior Sales Executive',
  commission_eligibility: true,
};

export const mockCreateEmployeeResponse = {
  success: true,
  message: 'Employee created successfully',
  data: mockEmployee,
};

export const mockUpdateEmployeeRequest = {
  name: 'Ahmed Mohammed Al-Ghamdi - Updated',
  phone: '+966509876543',
  salary: 9500.0,
  job_title: 'Lead Sales Executive',
};

export const mockRolesResponse = {
  success: true,
  data: [
    { id: 1, name: 'admin', label: 'Administrator' },
    { id: 2, name: 'sales', label: 'Sales' },
    { id: 3, name: 'hr', label: 'HR' },
    { id: 4, name: 'marketing', label: 'Marketing' },
  ],
};
