import apiClient from '../api/apiClient'

/**
 * Team Service - Manages team search and filtering operations
 */

/**
 * Search teams by name or other criteria
 * @param {string} searchTerm - Search query string
 */
export const searchTeams = async (searchTerm = '') => {
    try {
        const response = await apiClient.get('/teams/index', {
            params: { search: searchTerm }
        })
        return response.data
    } catch (error) {
        console.error('Error searching teams:', error)
        throw error
    }
}

/**
 * Filter teams by search term
 * @param {string} searchTerm - Filter query string
 */
export const filterTeams = async (searchTerm = '') => {
    try {
        const response = await apiClient.get('/teams/filter', {
            params: { search: searchTerm }
        })
        return response.data
    } catch (error) {
        console.error('Error filtering teams:', error)
        throw error
    }
}

/**
 * Get all teams (without filter)
 */
export const getAllTeams = async () => {
    try {
        const response = await apiClient.get('/teams/index')
        return response.data
    } catch (error) {
        console.error('Error fetching all teams:', error)
        throw error
    }
}

export default {
    searchTeams,
    filterTeams,
    getAllTeams
}
