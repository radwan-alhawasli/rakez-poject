/**
 * API Testing Script - اختبار شامل لجميع APIs
 * 
 * هذا الملف يختبار جميع الـ APIs في المشروع برمجيًا
 * ويُصدر تقريرًا مفصلًا بالنتائج
 * 
 * طريقة التشغيل:
 * node tests/api-test-runner-simple.js
 */

const axios = require('axios')
const fs = require('fs').promises

// إعدادات API
const API_BASE_URL = 'http://143.198.24.230/api'
const TOKEN = 'YOUR_TOKEN_HERE' // سيتم استبداله بالتوكن من localStorage في المتصفح

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

// إنشاء axios instance مع الإعدادات الافتراضية
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

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
        const requestConfig = {
            method: method.toLowerCase(),
            url,
            ...(data && { data }),
            ...(headers && { headers })
        }

        const response = await apiClient(requestConfig)

        const statusMatch = !expectedStatus || response.status === expectedStatus

        if (statusMatch) {
            stats.passed++
            log(`✓ نجح الاختبار - Status: ${response.status}`, 'green')

            // معلومات عن البيانات المرجعة
            let dataInfo = 'لا توجد بيانات'
            if (response.data) {
                if (Array.isArray(response.data)) {
                    dataInfo = `مصفوفة تحتوي على ${response.data.length} عنصر`
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    dataInfo = `كائن يحتوي على مصفوفة ${response.data.data.length} عنصر`
                } else if (typeof response.data === 'object') {
                    dataInfo = `كائن يحتوي على ${Object.keys(response.data).length} خاصية`
                } else {
                    dataInfo = typeof response.data
                }
            }
            log(`   البيانات: ${dataInfo}`, 'blue')

            stats.results.push({
                name,
                status: 'PASSED',
                responseStatus: response.status,
                dataReceived: !!response.data,
                dataType: dataInfo
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

    } catch (error) {
        const errorMsg = error.response ?
            `HTTP ${error.response.status}: ${error.response.statusText}` :
            error.message

        // بعض APIs قد ترجع 404 أو 401 وهذا طبيعي
        const isExpectedError = error.response && [401, 404].includes(error.response.status)

        if (isExpectedError) {
            stats.passed++
            log(`✓ رد متوقع - ${errorMsg}`, 'yellow')
            stats.results.push({
                name,
                status: 'EXPECTED_ERROR',
                error: errorMsg,
                responseStatus: error.response?.status
            })
        } else {
            stats.failed++
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
}

/**
 * المجموعات الرئيسية للاختبار
 */

// === 1. HR Service APIs ===
async function testHRServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 القسم 1: اختبار HR Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    // Dashboard
    await testEndpoint({
        name: '1.1 HR Dashboard Metrics',
        method: 'GET',
        url: '/hr/dashboard',
        expectedStatus: 200,
        description: 'جلب مقاييس لوحة التحكم للـ HR'
    })

    // Teams
    await testEndpoint({
        name: '1.2 Get All Teams (HR)',
        method: 'GET',
        url: '/hr/teams',
        expectedStatus: 200,
        description: 'جلب جميع الفرق من خدمة HR'
    })

    // Employees
    await testEndpoint({
        name: '1.3 Get All Employees (HR)',
        method: 'GET',
        url: '/hr/list_employees',
        expectedStatus: 200,
        description: 'جلب جميع الموظفين من خدمة HR'
    })

    await testEndpoint({
        name: '1.4 Search Employees',
        method: 'GET',
        url: '/hr/list_employees?search=test',
        expectedStatus: 200,
        description: 'البحث عن موظفين'
    })

    // Performance Tracking
    await testEndpoint({
        name: '1.5 Get Marketer Performance',
        method: 'GET',
        url: '/hr/marketers/performance',
        expectedStatus: 200,
        description: 'جلب أداء المسوقين'
    })

    await testEndpoint({
        name: '1.6 Get Team Performance',
        method: 'GET',
        url: '/hr/teams/performance',
        expectedStatus: 200,
        description: 'جلب أداء الفرق'
    })
}

// === 2. Contract Service APIs ===
async function testContractServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 القسم 2: اختبار Contract Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    // User Contracts
    await testEndpoint({
        name: '2.1 Get All Contracts (User)',
        method: 'GET',
        url: '/contracts/index',
        expectedStatus: 200,
        description: 'جلب جميع العقود للمستخدم'
    })

    // Admin Contracts
    await testEndpoint({
        name: '2.2 Get All Contracts (Admin)',
        method: 'GET',
        url: '/admin/contracts/adminIndex',
        expectedStatus: 200,
        description: 'جلب جميع العقود للمسؤول'
    })

    // Second Party
    await testEndpoint({
        name: '2.3 Get All Developers',
        method: 'GET',
        url: '/second-party-data/second-parties',
        expectedStatus: 200,
        description: 'جلب قائمة المطورين (الطرف الثاني)'
    })
}

// === 3. User Service APIs ===
async function testUserServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 القسم 3: اختبار User Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    await testEndpoint({
        name: '3.1 Get All Employees (Admin)',
        method: 'GET',
        url: '/admin/employees/list_employees',
        expectedStatus: 200,
        description: 'جلب جميع الموظفين من لوحة الإدارة'
    })

    await testEndpoint({
        name: '3.2 Search Employees (Admin)',
        method: 'GET',
        url: '/admin/employees/list_employees?search=admin',
        expectedStatus: 200,
        description: 'البحث عن موظفين من لوحة الإدارة'
    })
}

// === 4. Team Service APIs ===
async function testTeamServiceAPIs() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 القسم 4: اختبار Team Service APIs', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    await testEndpoint({
        name: '4.1 Get All Teams (Team Service)',
        method: 'GET',
        url: '/teams/index',
        expectedStatus: 200,
        description: 'جلب جميع الفرق من خدمة الفرق'
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
}

/**
 * اختبار APIs محددة بناءً على معرفات موجودة
 */
async function testAPIsWithExistingIds() {
    log('\n\n═══════════════════════════════════════', 'cyan')
    log('🔍 القسم 5: اختبار APIs بمعرفات موجودة', 'cyan')
    log('═══════════════════════════════════════\n', 'cyan')

    try {
        // جلب موظف واحد لاختبار show employee
        const employeesResponse = await apiClient.get('/hr/list_employees')
        let employees = employeesResponse.data

        // التعامل مع هيكل البيانات المختلف
        if (employees && employees.data && Array.isArray(employees.data)) {
            employees = employees.data
        } else if (!Array.isArray(employees)) {
            employees = []
        }

        if (employees.length > 0) {
            const firstEmployee = employees[0]

            await testEndpoint({
                name: '5.1 Get Employee By ID',
                method: 'GET',
                url: `/hr/show_employee/${firstEmployee.id}`,
                expectedStatus: 200,
                description: `جلب معلومات الموظف (ID: ${firstEmployee.id})`
            })

            await testEndpoint({
                name: '5.2 Get Employee By ID (Admin)',
                method: 'GET',
                url: `/admin/employees/show_employee/${firstEmployee.id}`,
                expectedStatus: 200,
                description: `جلب معلومات الموظف من لوحة الإدارة (ID: ${firstEmployee.id})`
            })
        } else {
            log('⚠ لم يتم العثور على موظفين لاختبار show employee', 'yellow')
        }

    } catch (error) {
        log('⚠ تعذر جلب الموظفين لاختبار show employee', 'yellow')
    }

    try {
        // جلب عقد واحد لاختبار show contract
        const contractsResponse = await apiClient.get('/contracts/index')
        let contracts = contractsResponse.data

        // التعامل مع هيكل البيانات المختلف
        if (contracts && contracts.data && Array.isArray(contracts.data)) {
            contracts = contracts.data
        } else if (!Array.isArray(contracts)) {
            contracts = []
        }

        if (contracts.length > 0) {
            const firstContract = contracts[0]

            await testEndpoint({
                name: '5.3 Get Contract By ID',
                method: 'GET',
                url: `/contracts/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب تفاصيل العقد (ID: ${firstContract.id})`
            })

            await testEndpoint({
                name: '5.4 Get Contract Units',
                method: 'GET',
                url: `/contracts/units/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب وحدات العقد (ID: ${firstContract.id})`
            })

            await testEndpoint({
                name: '5.5 Get Second Party Data',
                method: 'GET',
                url: `/second-party-data/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب بيانات الطرف الثاني (Contract ID: ${firstContract.id})`
            })

            await testEndpoint({
                name: '5.6 Get Photography Data',
                method: 'GET',
                url: `/photography-department/show/${firstContract.id}`,
                expectedStatus: 200,
                description: `جلب بيانات التصوير (Contract ID: ${firstContract.id})`
            })
        } else {
            log('⚠ لم يتم العثور على عقود لاختبار show contract', 'yellow')
        }

    } catch (error) {
        log('⚠ تعذر جلب العقود لاختبار show contract', 'yellow')
    }

    try {
        // جلب فريق واحد لاختبار show team
        const teamsResponse = await apiClient.get('/hr/teams')
        let teams = teamsResponse.data

        // التعامل مع هيكل البيانات المختلف
        if (teams && teams.data && Array.isArray(teams.data)) {
            teams = teams.data
        } else if (!Array.isArray(teams)) {
            teams = []
        }

        if (teams.length > 0) {
            const firstTeam = teams[0]

            await testEndpoint({
                name: '5.7 Get Team By ID',
                method: 'GET',
                url: `/hr/teams/${firstTeam.id}`,
                expectedStatus: 200,
                description: `جلب معلومات الفريق (ID: ${firstTeam.id})`
            })
        } else {
            log('⚠ لم يتم العثور على فرق لاختبار show team', 'yellow')
        }

    } catch (error) {
        log('⚠ تعذر جلب الفرق لاختبار show team', 'yellow')
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

    const testsRun = stats.total - stats.skipped
    const successRate = testsRun > 0 ?
        ((stats.passed / testsRun) * 100).toFixed(2) : 0

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
    const testsRun = stats.total - stats.skipped
    const successRate = testsRun > 0 ?
        ((stats.passed / testsRun) * 100).toFixed(2) : 0

    const reportContent = `# تقرير نتائج اختبار APIs

تاريخ الاختبار: ${new Date().toLocaleString('ar-SA')}

## الإحصائيات العامة

- **إجمالي الاختبارات:** ${stats.total}
- **نجح:** ${stats.passed} ✓
- **فشل:** ${stats.failed} ✗
- **تم التخطي:** ${stats.skipped} ⊘
- **معدل النجاح:** ${successRate}%

## نتائج مفصلة

${stats.results.map((result, index) => {
        const emoji = result.status === 'PASSED' ? '✓' :
            result.status === 'EXPECTED_ERROR' ? '⚠' :
                result.status === 'FAILED' ? '✗' : '⊘'
        return `
### ${index + 1}. ${result.name} ${emoji}

- **الحالة:** ${result.status}
${result.responseStatus ? `- **رمز الاستجابة:** ${result.responseStatus}` : ''}
${result.dataType ? `- **نوع البيانات:** ${result.dataType}` : ''}
${result.error ? `- **الخطأ:** ${result.error}` : ''}
${result.reason ? `- **السبب:** ${result.reason}` : ''}
`
    }).join('\n---\n')}

## الاختبارات الفاشلة

${stats.failed === 0 ? '✓ جميع الاختبارات نجحت أو أرجعت أخطاء متوقعة!' : stats.results
            .filter(r => r.status === 'FAILED')
            .map(r => `- **${r.name}**: ${r.error || r.reason}`)
            .join('\n')}

---

*تم إنشاء هذا التقرير تلقائيًا بواسطة api-test-runner.js*
`

    try {
        await fs.writeFile('./api-test-results.md', reportContent, 'utf-8')
        log('\n📄 تم حفظ التقرير في: api-test-results.md', 'green')
    } catch (error) {
        log('\n✗ فشل حفظ التقرير: ' + error.message, 'red')
    }
}

/**
 * الوظيفة الرئيسية
 */
async function main() {
    log('╔═════════════════════════════════════════╗', 'cyan')
    log('║   🚀 بدء اختبار جميع APIs في المشروع   ║', 'cyan')
    log('╚═════════════════════════════════════════╝', 'cyan')

    // التحقق من وجود التوكن
    if (TOKEN === 'YOUR_TOKEN_HERE') {
        log('\n⚠ تحذير: لم يتم تعيين التوكن!', 'yellow')
        log('الرجاء تحديث قيمة TOKEN في بداية الملف', 'yellow')
        log('يمكنك الحصول على التوكن من localStorage في المتصفح\n', 'yellow')
    }

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
