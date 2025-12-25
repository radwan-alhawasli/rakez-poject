export const ROLE_MAP = {
    'marketing': 0,
    'admin': 1,
    'project_acquisition': 2,
    'project_management': 3,
    'editor': 4,
    'sales': 5,
    'accounting': 6,
    'credit': 7
}

export const ROLES = {
    0: { label: 'التسويق / Marketing', key: 'marketing', class: 'role-marketing' },
    1: { label: 'الإدارة / Admin', key: 'admin', class: 'role-admin' },
    2: { label: 'العقود / Acquisition', key: 'project_acquisition', class: 'role-acquisition' },
    3: { label: 'إدارة المشاريع / PM', key: 'project_management', class: 'role-pm' },
    4: { label: 'المونتاج / Editor', key: 'editor', class: 'role-editor' },
    5: { label: 'المبيعات / Sales', key: 'sales', class: 'role-sales' },
    6: { label: 'المحاسبة / Accounting', key: 'accounting', class: 'role-accounting' },
    7: { label: 'الائتمان / Credit', key: 'credit', class: 'role-credit' }
}

export const getRoleLabel = (type) => {
    const normalizedType = (typeof type === 'string' && ROLE_MAP[type] !== undefined)
        ? ROLE_MAP[type]
        : type
    return ROLES[normalizedType]?.label ?? (type || 'غير محدد')
}

export const getRoleClass = (type) => {
    const normalizedType = (typeof type === 'string' && ROLE_MAP[type] !== undefined)
        ? ROLE_MAP[type]
        : type
    return ROLES[normalizedType]?.class ?? 'role-default'
}
