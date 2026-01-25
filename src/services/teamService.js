import apiClient from '../api/apiClient'

/**
 * Team Management Service
 * Handles CRUD operations for teams
 */
const teamService = {
    /**
     * Get all teams with optional search
     * GET /project_management/teams/index
     * @param {string} search - Optional search query
     */
    async getTeams(search = '') {
        try {
            const params = search ? { search } : {}
            const response = await apiClient.get('/project_management/teams/index', { params })
            const res = response.data

            // Handle different response formats
            let teams = []
            if (Array.isArray(res)) {
                teams = res
            } else if (res && res.data && Array.isArray(res.data)) {
                teams = res.data
            } else {
                teams = res.data || []
            }

            return Array.isArray(teams) ? teams : []
        } catch (error) {
            console.error('Error fetching teams:', error)
            throw error
        }
    },

    /**
     * Get team by ID
     * GET /project_management/teams/show/:id
     */
    async getTeamById(id) {
        try {
            const response = await apiClient.get(`/project_management/teams/show/${id}`)
            return response.data.data || response.data
        } catch (error) {
            console.error('Error fetching team:', error)
            throw error
        }
    },

    /**
     * Create a new team
     * POST /project_management/teams/store
     * @param {Object} teamData - { name, description }
     */
    async createTeam(teamData) {
        try {
            const response = await apiClient.post('/project_management/teams/store', teamData)
            return response.data
        } catch (error) {
            console.error('Error creating team:', error)
            throw error
        }
    },

    /**
     * Update team
     * POST/PUT /project_management/teams/update/:id
     */
    async updateTeam(id, teamData) {
        try {
            const response = await apiClient.post(`/project_management/teams/update/${id}`, teamData)
            return response.data
        } catch (error) {
            console.error('Error updating team:', error)
            throw error
        }
    },

    /**
     * Delete team
     * DELETE /project_management/teams/delete/:id
     */
    async deleteTeam(id) {
        try {
            const response = await apiClient.delete(`/project_management/teams/delete/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting team:', error)
            throw error
        }
    }
}

export default teamService
