import apiClient from '../api/apiClient'

/**
<<<<<<< HEAD
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
=======
 * Team Service - Manages team operations using project management endpoints
 */

/**
 * Get all teams
 * GET /project_management/teams/index
 */
export const getAllTeams = async (searchTerm = '') => {
    try {
        const response = await apiClient.get('/project_management/teams/index', {
            params: { search: searchTerm }
        })
        return response.data
    } catch (error) {
        console.error('Error fetching all teams:', error)
        throw error
    }
}

/**
 * Create a new team
 * POST /project_management/teams/store
 * Payload: { name, description }
 */
export const createTeam = async (teamData) => {
    try {
        const response = await apiClient.post('/project_management/teams/store', teamData)
        return response.data
    } catch (error) {
        console.error('Error creating team:', error)
        throw error
    }
}

/**
 * Update an existing team
 * PUT /project_management/teams/update/:id
 * Payload: { name, description }
 */
export const updateTeam = async (id, teamData) => {
    try {
        const response = await apiClient.put(`/project_management/teams/update/${id}`, teamData)
        return response.data
    } catch (error) {
        console.error(`Error updating team ${id}:`, error)
        throw error
    }
}

/**
 * Get team details by ID
 * GET /project_management/teams/show/:id
 */
export const getTeamById = async (id) => {
    try {
        const response = await apiClient.get(`/project_management/teams/show/${id}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching team ${id}:`, error)
        throw error
    }
}

/**
 * Delete a team
 * DELETE /project_management/teams/delete/:id
 */
export const deleteTeam = async (id) => {
    try {
        const response = await apiClient.delete(`/project_management/teams/delete/${id}`)
        return response.data
    } catch (error) {
        console.error(`Error deleting team ${id}:`, error)
        throw error
    }
}

/**
 * Get contracts assigned to a specific team
 * GET /project_management/teams/contracts/:id
 */
export const getTeamContracts = async (id, params = {}) => {
    try {
        const response = await apiClient.get(`/project_management/teams/contracts/${id}`, { params })
        return response.data
    } catch (error) {
        console.error(`Error fetching contracts for team ${id}:`, error)
        throw error
    }
}

/**
 * Get contract locations for a specific team
 * GET /project_management/teams/contracts/locations/:id
 */
export const getTeamContractLocations = async (id, params = {}) => {
    try {
        const response = await apiClient.get(`/project_management/teams/contracts/locations/${id}`, { params })
        return response.data
    } catch (error) {
        console.error(`Error fetching contract locations for team ${id}:`, error)
        throw error
    }
}

/**
 * Add teams to a contract
 * POST /project_teams/teams/add/:contractId
 * Payload: { team_ids: [1, 2] }
 */
export const addTeamsToContract = async (contractId, teamIds) => {
    try {
        const response = await apiClient.post(`/project_teams/teams/add/${contractId}`, { team_ids: teamIds })
        return response.data
    } catch (error) {
        console.error(`Error adding teams to contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Remove teams from a contract
 * POST /project_teams/teams/remove/:contractId
 * Payload: { team_ids: [1, 2] }
 */
export const removeTeamsFromContract = async (contractId, teamIds) => {
    try {
        const response = await apiClient.post(`/project_teams/teams/remove/${contractId}`, { team_ids: teamIds })
        return response.data
    } catch (error) {
        console.error(`Error removing teams from contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Get teams assigned to a specific contract
 * GET /project_teams/teams/:contractId
 */
export const getContractTeams = async (contractId) => {
    try {
        const response = await apiClient.get(`/project_teams/teams/${contractId}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching teams for contract ${contractId}:`, error)
        throw error
    }
}

export default {
    getAllTeams,
    createTeam,
    updateTeam,
    getTeamById,
    deleteTeam,
    getTeamContracts,
    getTeamContractLocations,
    addTeamsToContract,
    removeTeamsFromContract,
    getContractTeams
}
>>>>>>> ee4e8771a0db4bb6cd5b1cf0dd95d26c71fe19de
