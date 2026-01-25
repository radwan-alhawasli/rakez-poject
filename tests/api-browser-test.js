/**
 * API Browser Testing Script - اختبار APIs مباشرة في المتصفح
 * 
 * طريقة الاستخدام:
 * 1. افتح المشروع في المتصفح
 * 2. افتح Developer Console (F12)
 * 3. انسخ هذا الملف بالكامل والصقه في Console
 * 4. سيبدأ الاختبار تلقائيًا وسيطبع النتائج
 * 
 * أو يمكنك استيراده كـ:
 * <script src="/tests/api-browser-test.js"></script>
 */

(async function runAPITests() {
    'use strict'

    // ================== الإعدادات ==================
    const API_BASE_URL = 'http://143.198.24.230/api'
    const TOKEN = localStorage.getItem('token') || sessionStorage.getItem('token') || ''

    // ألوان للطباعة في الكونسول
    const colors = {
        title: 'background: #4CAF50; color: white; padding: 5px 10px; font-weight: bold;',
        success: 'color: #4CAF50; font-weight: bold;',
        error: 'color: #f44336; font-weight: bold;',
        warning: 'color: #FF9800; font-weight: bold;',
        info: 'color: #2196F3;',
        section: 'background: #2196F3; color: white; padding: 5px 10px; font-size: 14px;'
    }

    // إحصائيات الاختبار
    const stats = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        results: []
    }

    // ================== وظائف مساعدة ==================

    /**
     * إنشاء axios-like client باستخدام fetch
     */
    async function apiRequest(method, url, data = null, headers = {}) {
        const options = {
            method: method.toUpperCase(),
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...headers
            }
        }

        if (data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
            options.body = JSON.stringify(data)
        }

        const response = await fetch(API_BASE_URL + url, options)

        const responseData = response.headers.get('content-type')?.includes('application/json')
            ? await response.json()
            : await response.text()

        return {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
            ok: response.ok
        }
    }

    /**
     * اختبار endpoint واحد
     */
    async function testEndpoint(config) {
        const { name, method, url, data, expectedStatus, description, skip } = config

        stats.total++

        if (skip) {
            stats.skipped++
            console.log(`%c⊘ ${name}`, colors.warning)
            stats.results.push({ name, status: 'SKIPPED' })
            return
        }

        console.log(`%c🧪 ${name}`, colors.info)
        if (description) {
            console.log(`   ${description}`)
        }
        console.log(`   ${method} ${url}`)

        try {
            const response = await apiRequest(method, url, data)

            const statusMatch = !expectedStatus || response.status === expectedStatus

            if (statusMatch && response.ok) {
                stats.passed++
                console.log(`%c✓ نجح - Status: ${response.status}`, colors.success)

                // معلومات عن البيانات
                let dataInfo = 'لا توجد بيانات'
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        dataInfo = `مصفوفة [${response.data.length}]`
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        dataInfo = `كائن مع مصفوفة [${response.data.data.length}]`
                    } else if (typeof response.data === 'object') {
                        dataInfo = `كائن {${Object.keys(response.data).length}}`
                    }
                }
                console.log(`   البيانات: ${dataInfo}`)

                stats.results.push({
                    name,
                    status: 'PASSED',
                    responseStatus: response.status,
                    data: response.data
                })
            } else {
                stats.failed++
                console.log(`%c✗ فشل - Status: ${response.status}`, colors.error)
                stats.results.push({
                    name,
                    status: 'FAILED',
                    responseStatus: response.status,
                    error: response.statusText
                })
            }

        } catch (error) {
            stats.failed++
            console.log(`%c✗ خطأ: ${error.message}`, colors.error)
            stats.results.push({
                name,
                status: 'FAILED',
                error: error.message
            })
        }
    }

    // ================== سيناريوهات الاختبار ==================

    console.clear()
    console.log('%c🚀 بدء اختبار جميع APIs', colors.title)
    console.log(`Token: ${TOKEN ? '✓ موجود' : '✗ غير موجود'}`)
    console.log('\n')

    // === القسم 1: HR Service APIs ===
    console.log('%c📋 القسم 1: HR Service APIs', colors.section)

    await testEndpoint({
        name: '1.1 HR Dashboard',
        method: 'GET',
        url: '/hr/dashboard',
        expectedStatus: 200,
        description: 'جلب مقاييس لوحة التحكم'
    })

    await testEndpoint({
        name: '1.2 HR Teams',
        method: 'GET',
        url: '/hr/teams',
        expectedStatus: 200,
        description: 'جلب جميع الفرق'
    })

    await testEndpoint({
        name: '1.3 HR Employees',
        method: 'GET',
        url: '/hr/list_employees',
        expectedStatus: 200,
        description: 'جلب جميع الموظفين'
    })

    await testEndpoint({
        name: '1.4 Search Employees',
        method: 'GET',
        url: '/hr/list_employees?search=test',
        expectedStatus: 200,
        description: 'البحث في الموظفين'
    })

    await testEndpoint({
        name: '1.5 Marketer Performance',
        method: 'GET',
        url: '/hr/marketers/performance',
        expectedStatus: 200,
        description: 'أداء المسوقين'
    })

    await testEndpoint({
        name: '1.6 Team Performance',
        method: 'GET',
        url: '/hr/teams/performance',
        expectedStatus: 200,
        description: 'أداء الفرق'
    })

    // === القسم 2: Contract Service APIs ===
    console.log('\n%c💼 القسم 2: Contract Service APIs', colors.section)

    await testEndpoint({
        name: '2.1 User Contracts',
        method: 'GET',
        url: '/contracts/index',
        expectedStatus: 200,
        description: 'جلب عقود المستخدم'
    })

    await testEndpoint({
        name: '2.2 Admin Contracts',
        method: 'GET',
        url: '/admin/contracts/adminIndex',
        expectedStatus: 200,
        description: 'جلب جميع العقود (Admin)'
    })

    await testEndpoint({
        name: '2.3 Developers List',
        method: 'GET',
        url: '/second-party-data/second-parties',
        expectedStatus: 200,
        description: 'قائمة المطورين'
    })

    // === القسم 3: User Service APIs ===
    console.log('\n%c👥 القسم 3: User Service APIs', colors.section)

    await testEndpoint({
        name: '3.1 Admin Employees',
        method: 'GET',
        url: '/admin/employees/list_employees',
        expectedStatus: 200,
        description: 'موظفو الإدارة'
    })

    await testEndpoint({
        name: '3.2 Search Admin Employees',
        method: 'GET',
        url: '/admin/employees/list_employees?search=admin',
        expectedStatus: 200,
        description: 'البحث في موظفي الإدارة'
    })

    // === القسم 4: Team Service APIs ===
    console.log('\n%c🎯 القسم 4: Team Service APIs', colors.section)

    await testEndpoint({
        name: '4.1 All Teams',
        method: 'GET',
        url: '/teams/index',
        expectedStatus: 200,
        description: 'جميع الفرق'
    })

    await testEndpoint({
        name: '4.2 Search Teams',
        method: 'GET',
        url: '/teams/index?search=team',
        expectedStatus: 200,
        description: 'البحث في الفرق'
    })

    await testEndpoint({
        name: '4.3 Filter Teams',
        method: 'GET',
        url: '/teams/filter?search=test',
        expectedStatus: 200,
        description: 'تصفية الفرق'
    })

    // === القسم 5: اختبارات بمعرفات موجودة ===
    console.log('\n%c🔍 القسم 5: اختبارات متقدمة بمعرفات موجودة', colors.section)

    // جلب موظف للاختبار
    try {
        const employeesResp = await apiRequest('GET', '/hr/list_employees')
        let employees = employeesResp.data

        if (employees?.data && Array.isArray(employees.data)) {
            employees = employees.data
        } else if (!Array.isArray(employees)) {
            employees = []
        }

        if (employees.length > 0) {
            const emp = employees[0]

            await testEndpoint({
                name: `5.1 Get Employee #${emp.id}`,
                method: 'GET',
                url: `/hr/show_employee/${emp.id}`,
                expectedStatus: 200,
                description: 'تفاصيل موظف محدد'
            })
        }
    } catch (e) {
        console.log('%c⚠ تعذر اختبار show employee', colors.warning)
    }

    // جلب عقد للاختبار
    try {
        const contractsResp = await apiRequest('GET', '/contracts/index')
        let contracts = contractsResp.data

        if (contracts?.data && Array.isArray(contracts.data)) {
            contracts = contracts.data
        } else if (!Array.isArray(contracts)) {
            contracts = []
        }

        if (contracts.length > 0) {
            const contract = contracts[0]

            await testEndpoint({
                name: `5.2 Get Contract #${contract.id}`,
                method: 'GET',
                url: `/contracts/show/${contract.id}`,
                expectedStatus: 200,
                description: 'تفاصيل عقد محدد'
            })

            await testEndpoint({
                name: `5.3 Contract Units #${contract.id}`,
                method: 'GET',
                url: `/contracts/units/show/${contract.id}`,
                expectedStatus: 200,
                description: 'وحدات العقد'
            })

            await testEndpoint({
                name: `5.4 Second Party #${contract.id}`,
                method: 'GET',
                url: `/second-party-data/show/${contract.id}`,
                expectedStatus: 200,
                description: 'بيانات الطرف الثاني'
            })

            await testEndpoint({
                name: `5.5 Photography #${contract.id}`,
                method: 'GET',
                url: `/photography-department/show/${contract.id}`,
                expectedStatus: 200,
                description: 'بيانات التصوير'
            })
        }
    } catch (e) {
        console.log('%c⚠ تعذر اختبار APIs العقود', colors.warning)
    }

    // جلب فريق للاختبار
    try {
        const teamsResp = await apiRequest('GET', '/hr/teams')
        let teams = teamsResp.data

        if (teams?.data && Array.isArray(teams.data)) {
            teams = teams.data
        } else if (!Array.isArray(teams)) {
            teams = []
        }

        if (teams.length > 0) {
            const team = teams[0]

            await testEndpoint({
                name: `5.6 Get Team #${team.id}`,
                method: 'GET',
                url: `/hr/teams/${team.id}`,
                expectedStatus: 200,
                description: 'تفاصيل فريق محدد'
            })
        }
    } catch (e) {
        console.log('%c⚠ تعذر اختبار show team', colors.warning)
    }

    // ================== التقرير النهائي ==================

    console.log('\n\n')
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.section)
    console.log('%c📊 تقرير نتائج الاختبار', colors.title)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.section)

    const testsRun = stats.total - stats.skipped
    const successRate = testsRun > 0 ? ((stats.passed / testsRun) * 100).toFixed(2) : 0

    console.log(`\nإجمالي الاختبارات: ${stats.total}`)
    console.log(`%c✓ نجح: ${stats.passed}`, colors.success)
    console.log(`%c✗ فشل: ${stats.failed}`, colors.error)
    console.log(`%c⊘ تم التخطي: ${stats.skipped}`, colors.warning)
    console.log(`\n%cمعدل النجاح: ${successRate}%`,
        successRate >= 80 ? colors.success : colors.warning)

    // الاختبارات الفاشلة
    if (stats.failed > 0) {
        console.log('\n%c━━━ الاختبارات الفاشلة ━━━', colors.error)
        stats.results
            .filter(r => r.status === 'FAILED')
            .forEach(result => {
                console.log(`%c✗ ${result.name}`, colors.error)
                if (result.error) {
                    console.log(`  ${result.error}`)
                }
            })
    }

    // حفظ النتائج في window للوصول إليها لاحقًا
    window.apiTestResults = {
        stats,
        timestamp: new Date().toISOString(),
        token: TOKEN ? 'موجود' : 'غير موجود',
        successRate: `${successRate}%`
    }

    console.log('\n%cℹ️ النتائج محفوظة في: window.apiTestResults', colors.info)
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n', colors.section)

    return window.apiTestResults
})()
