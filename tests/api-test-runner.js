/**
 * API Testing Script - اختبار شامل لجميع APIs
 * 
 * هذا الملف يختبر جميع الـ APIs في المشروع برمجيًا
 * ويُصدر تقريرًا مفصلًا بالنتائج
 */

import apiClient from '../src/api/apiClient.js'

// ألوان للطباعة في الكونسول
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
}

// إحصائيات الاختبار
const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    results: []
}

/**
 * وظيفة مساعدة لطباعة النتائج
 */
function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset)
}

/**
 * اختبار API endpoint واحد
 */
async function testEndpoint(config) {
    const { name, method, url, data, headers, expectedStatus, description, skip } = config

    stats.total++

    if (skip) {
        stats.skipped++
        log(`⊘ تم تخطي: ${name}`, 'yellow')
        stats.results.push({ name, status: 'SKIPPED', reason: 'Skipped by configuration' })
        return
    }

    log(`\n🧪 اختبار: ${name}`, 'cyan')
    if (description) {
        log(`   الوصف: ${description}`, 'blue')
    }
    log(`   ${method} ${url}`, 'blue')

    try {
        const config = {
            method: method.toLowerCase(),
            url,
            ...(data && { data }),
            ...(headers && { headers })
        }

        const response = await apiClient(config)

        const statusMatch = !expectedStatus || response.status === expectedStatus

        if (statusMatch) {
            stats.passed++
            log(`✓ نجح الاختبار - Status: ${response.status}`, 'green')
            stats.results.push({
                name,
                status: 'PASSED',
                responseStatus: response.status,
                dataReceived: !!response.data
            })
        } else {
            stats.failed++
            log(`✗ فشل الاختبار - Expected: ${expectedStatus}, Got: ${response.status}`, 'red')
            stats.results.push({
                name,
                status: 'FAILED',
                reason: `Status mismatch: expected ${expectedStatus}, got ${response.status}`,
                responseStatus: response.status
            })
        }

        // طباعة عينة من البيانات
        if (response.data) {
            const dataPreview = JSON.stringify(response.data).substring(0, 200)
            log(`   البيانات: ${dataPreview}...`, 'blue')
        }

    } catch (error) {
        stats.failed++
        const errorMsg = error.response ?
            `HTTP ${error.response.status}: ${error.response.statusText}` :
            error.message

        log(`✗ فشل الاختبار - ${errorMsg}`, 'red')
        stats.results.push({
            name,
            status: 'FAILED',
            error: errorMsg,
            responseStatus: error.response?.status,
            errorData: error.response?.data
        })
    }
}

/**
 * المجموعات الرئيسية للاختبار
 */

// === 1. HR Service APIs ===
async function testHRServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 اختبار HR Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    // Dashboard
    await testEndpoint({
        name: 'HR Dashboard Metrics',
        method: 'GET',
        url: '/hr/dashboard',
        expectedStatus: 200,
        description: 'جلب مقاييس لوحة التحكم للـ HR'
    })

    // Teams
    await testEndpoint({
        name: 'Get All Teams',
        method: 'GET',
        url: '/hr/teams',
        expectedStatus: 200,
        description: 'جلب جميع الفرق'
    })

    // Skip team creation test in automatic mode
    // await testEndpoint({
    //   name: 'Create Team',
    //   method: 'POST',
    //   url: '/hr/teams',
    //   data: { name: 'فريق اختبار API', description: 'فريق تجريبي' },
    //   expectedStatus: 201,
    //   description: 'إنشاء فريق جديد',
    //   skip: true // تخطي لتجنب إنشاء بيانات حقيقية
    // })

    // Employees
    await testEndpoint({
        name: 'Get All Employees (HR)',
        method: 'GET',
        url: '/hr/list_employees',
        expectedStatus: 200,
        description: 'جلب جميع الموظفين من خدمة HR'
    })

    await testEndpoint({
        name: 'Search Employees',
        method: 'GET',
        url: '/hr/list_employees?search=test',
        expectedStatus: 200,
        description: 'البحث عن موظفين'
    })

    // Performance Tracking
    await testEndpoint({
        name: 'Get Marketer Performance',
        method: 'GET',
        url: '/hr/marketers/performance',
        expectedStatus: 200,
        description: 'جلب أداء المسوقين'
    })

    await testEndpoint({
        name: 'Get Team Performance',
        method: 'GET',
        url: '/hr/teams/performance',
        expectedStatus: 200,
        description: 'جلب أداء الفرق'
    })
}

// === 2. Contract Service APIs ===
async function testContractServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 اختبار Contract Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    // User Contracts
    await testEndpoint({
        name: 'Get All Contracts (User)',
        method: 'GET',
        url: '/contracts/index',
        expectedStatus: 200,
        description: 'جلب جميع العقود للمستخدم'
    })

    // Admin Contracts
    await testEndpoint({
        name: 'Get All Contracts (Admin)',
        method: 'GET',
        url: '/admin/contracts/adminIndex',
        expectedStatus: 200,
        description: 'جلب جميع العقود للمسؤول'
    })

    // Second Party
    await testEndpoint({
        name: 'Get All Developers',
        method: 'GET',
        url: '/second-party-data/second-parties',
        expectedStatus: 200,
        description: 'جلب قائمة المطورين'
    })
}

// === 3. User Service APIs ===
async function testUserServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 اختبار User Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    await testEndpoint({
        name: 'Get All Employees (Admin)',
        method: 'GET',
        url: '/admin/employees/list_employees',
        expectedStatus: 200,
        description: 'جلب جميع الموظفين من لوحة الإدارة'
    })

    await testEndpoint({
        name: 'Search Employees (Admin)',
        method: 'GET',
        url: '/admin/employees/list_employees?search=admin',
        expectedStatus: 200,
        description: 'البحث عن موظفين من لوحة الإدارة'
    })
}

// === 4. Team Service APIs ===
async function testTeamServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 اختبار Team Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    await testEndpoint({
        name: 'Get All Teams (Team Service)',
        method: 'GET',
        url: '/teams/index',
        expectedStatus: 200,
        description: 'جلب جميع الفرق من خدمة الفرق'
    })

    await testEndpoint({
        name: 'Search Teams',
        method: 'GET',
        url: '/teams/index?search=team',
        expectedStatus: 200,
        description: 'البحث في الفرق'
    })

    await testEndpoint({
        name: 'Filter Teams',
        method: 'GET',
        url: '/teams/filter?search=test',
        expectedStatus: 200,
        description: 'تصفية الفرق'
    })
}

/**
 * اختبار APIs محددة بناءً على معرفات موجودة
 */
async function testAPIsWithExistingIds() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 اختبار APIs بمعرفات موجودة', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    // جلب بعض المعرفات من APIs السابقة
    try {
        // جلب موظف واحد لاختبار show employee
        const employeesResponse = await apiClient.get('/hr/list_employees')
        const employees = employeesResponse.data

        if (employees && employees.length > 0) {
            const firstEmployee = employees[0]

            await testEndpoint({
                name: 'Get Employee By ID',
                method: 'GET',
                url: `/hr/show_employee/${firstEmployee.id}`,
                expectedStatus: 200,
                description: `جلب معلومات الموظف (ID: ${firstEmployee.id})`
            })
        }

        // جلب عقد واحد لاختبار show contract
        const contractsResponse = await apiClient.get('/contracts/index')
        const contracts = contractsResponse.data

        if (contracts && contracts.length > 0) {
            const firstContract = contracts[0]

            await testEndpoint({
                name: 'Get Contract By ID',
                method: 'GET',
                url: `/contracts/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب تفاصيل العقد (ID: ${firstContract.id})`
            })

            await testEndpoint({
                name: 'Get Contract Units',
                method: 'GET',
                url: `/contracts/units/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب وحدات العقد (ID: ${firstContract.id})`
            })

            await testEndpoint({
                name: 'Get Second Party Data',
                method: 'GET',
                url: `/second-party-data/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب بيانات الطرف الثاني (Contract ID: ${firstContract.id})`
            })

            await testEndpoint({
                name: 'Get Photography Data',
                method: 'GET',
                url: `/photography-department/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب بيانات التصوير (Contract ID: ${firstContract.id})`
            })
        }

        // جلب فريق واحد لاختبار show team
        const teamsResponse = await apiClient.get('/hr/teams')
        const teams = teamsResponse.data

        if (teams && teams.length > 0) {
            const firstTeam = teams[0]

            await testEndpoint({
                name: 'Get Team By ID',
                method: 'GET',
                url: `/hr/teams/${firstTeam.id}`,
                expectedStatus: 200,
                description: `جلب معلومات الفريق (ID: ${firstTeam.id})`
            })
        }

    } catch (error) {
        log('⚠ تعذر جلب المعرفات الموجودة لبعض الاختبارات', 'yellow')
    }
}

/**
 * طباعة التقرير النهائي
 */
function printFinalReport() {
    log('\n\n╔═══════════════════════════════════════╗', 'cyan')
    log('║      📊 تقرير نتائج الاختبار          ║', 'cyan')
    log('╚═══════════════════════════════════════╝\n', 'cyan')

    log(`إجمالي الاختبارات: ${stats.total}`)
    log(`✓ نجح: ${stats.passed}`, 'green')
    log(`✗ فشل: ${stats.failed}`, 'red')
    log(`⊘ تم التخطي: ${stats.skipped}`, 'yellow')

    const successRate = stats.total > 0 ?
        ((stats.passed / (stats.total - stats.skipped)) * 100).toFixed(2) : 0

    log(`\nمعدل النجاح: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow')

    // طباعة الاختبارات الفاشلة
    if (stats.failed > 0) {
        log('\n\n═══ الاختبارات الفاشلة ═══', 'red')
        stats.results
            .filter(r => r.status === 'FAILED')
            .forEach(result => {
                log(`\n✗ ${result.name}`, 'red')
                if (result.error) {
                    log(`  الخطأ: ${result.error}`, 'red')
                }
                if (result.reason) {
                    log(`  السبب: ${result.reason}`, 'red')
                }
            })
    }
}

/**
 * حفظ التقرير في ملف
 */
async function saveReport() {
    const fs = await import('fs/promises')

    const reportContent = `# تقرير نتائج اختبار APIs
  
تاريخ الاختبار: ${new Date().toLocaleString('ar-SA')}

## الإحصائيات العامة

- **إجمالي الاختبارات:** ${stats.total}
- **نجح:** ${stats.passed} ✓
- **فشل:** ${stats.failed} ✗
- **تم التخطي:** ${stats.skipped} ⊘
- **معدل النجاح:** ${((stats.passed / (stats.total - stats.skipped)) * 100).toFixed(2)}%

## نتائج مفصلة

${stats.results.map((result, index) => {
        const emoji = result.status === 'PASSED' ? '✓' : result.status === 'FAILED' ? '✗' : '⊘'
        return `
### ${index + 1}. ${result.name} ${emoji}

- **الحالة:** ${result.status}
${result.responseStatus ? `- **رمز الاستجابة:** ${result.responseStatus}` : ''}
${result.error ? `- **الخطأ:** ${result.error}` : ''}
${result.reason ? `- **السبب:** ${result.reason}` : ''}
${result.dataReceived ? `- **البيانات:** تم استلام البيانات بنجاح` : ''}
`
    }).join('\n---\n')}

## الاختبارات الفاشلة

${stats.failed === 0 ? '✓ جميع الاختبارات نجحت!' : stats.results
            .filter(r => r.status === 'FAILED')
            .map(r => `- **${r.name}**: ${r.error || r.reason}`)
            .join('\n')}

---

*تم إنشاء هذا التقرير تلقائيًا*
`

    await fs.writeFile('api-test-results.md', reportContent, 'utf-8')
    log('\n📄 تم حفظ التقرير في: api-test-results.md', 'green')
}

/**
 * الوظيفة الرئيسية
 */
async function main() {
    log('╔═════════════════════════════════════════╗', 'cyan')
    log('║   🚀 بدء اختبار جميع APIs في المشروع   ║', 'cyan')
    log('╚═════════════════════════════════════════╝', 'cyan')

    try {
        // تشغيل جميع الاختبارات
        await testHRServiceAPIs()
        await testContractServiceAPIs()
        await testUserServiceAPIs()
        await testTeamServiceAPIs()
        await testAPIsWithExistingIds()

        // طباعة التقرير
        printFinalReport()

        // حفظ التقرير
        await saveReport()

    } catch (error) {
        log('\n✗ حدث خطأ أثناء تشغيل الاختبارات:', 'red')
        console.error(error)
    }
}

// تشغيل الاختبارات
main()
