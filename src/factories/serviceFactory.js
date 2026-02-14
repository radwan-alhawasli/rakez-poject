/**
 * Service Factory
 * Creates and manages service instances with dependency injection
 */

import contractService from '../services/contractService'
import userService from '../services/userService'
import salesService from '../services/salesService'
import marketingService from '../services/marketingService'
import hrService from '../services/hrService'
import authService from '../services/authService'
import notificationService from '../services/notificationService'
import teamService from '../services/teamService'
import aiService from '../services/aiService'
import pdfService from '../services/pdfService'
import creditService from '../services/creditService'
import accountingService from '../services/accountingService'
import editorService from '../services/editorService'
import commissionService from '../services/commissionService'
import exclusiveProjectService from '../services/exclusiveProjectService'
import boardsDepartmentService from '../services/boardsDepartmentService'
import photographyDepartmentService from '../services/photographyDepartmentService'

/**
 * Service registry
 */
const services = {
    contract: contractService,
    user: userService,
    sales: salesService,
    marketing: marketingService,
    hr: hrService,
    auth: authService,
    notification: notificationService,
    team: teamService,
    ai: aiService,
    pdf: pdfService,
    credit: creditService,
    accounting: accountingService,
    editor: editorService,
    commission: commissionService,
    exclusiveProject: exclusiveProjectService,
    boardsDepartment: boardsDepartmentService,
    photographyDepartment: photographyDepartmentService
}

/**
 * Service Factory
 */
class ServiceFactory {
    /**
     * Get service instance
     * @param {string} serviceName - Service name
     * @returns {Object} Service instance
     */
    get(serviceName) {
        const service = services[serviceName]
        if (!service) {
            throw new Error(`Service '${serviceName}' not found`)
        }
        return service
    }

    /**
     * Register service
     * @param {string} name - Service name
     * @param {Object} service - Service instance
     */
    register(name, service) {
        services[name] = service
    }

    /**
     * Check if service exists
     * @param {string} serviceName - Service name
     * @returns {boolean} True if service exists
     */
    has(serviceName) {
        return !!services[serviceName]
    }

    /**
     * Get all registered services
     * @returns {Object} All services
     */
    getAll() {
        return { ...services }
    }
}

// Export singleton instance
export default new ServiceFactory()
