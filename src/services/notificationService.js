import { ref } from 'vue'
import apiClient from '../api/apiClient'
import authService from './authService'
import { createPusher } from '../plugins/pusher'
import logger from '../utils/logger'

const notifications = ref([])
const unreadCount = ref(0)
let pusher = null
let channels = []

const notificationService = {
    state: notifications,
    unreadCount,

    getAll() {
        return this.state
    },

    /**
     * Initialize notifications and WebSocket listeners
     */
    async init() {
        if (!authService.isAuthenticated()) return

        const user = authService.getCurrentUser()
        const token = authService.getToken()
        
        // 1. Fetch existing notifications
        await this.fetchAll()

        // 2. Setup Pusher
        if (!pusher) {
            pusher = createPusher(token)
            
            // Subscribe to Public
            const publicChannel = pusher.subscribe('public-notifications')
            publicChannel.bind('public.notification', (data) => {
                this.addReceivedNotification(data, 'public')
            })
            channels.push(publicChannel)

            // Subscribe to User Private
            if (user && user.id) {
                const userChannel = pusher.subscribe(`private-user-notifications.${user.id}`)
                userChannel.bind('user.notification', (data) => {
                    this.addReceivedNotification(data, 'private')
                })
                channels.push(userChannel)
            }

            // Subscribe to Admin Private
            if (user && user.type === 1) {
                const adminChannel = pusher.subscribe('private-admin-notifications')
                adminChannel.bind('admin.notification', (data) => {
                    this.addReceivedNotification(data, 'admin')
                })
                channels.push(adminChannel)
            }
        }
    },

    /**
     * Fetch all notifications from API
     */
    async fetchAll() {
        try {
            const user = authService.getCurrentUser()
            const isAdmin = user && user.type === 1

            const requests = [
                apiClient.get('/user/notifications/private'),
                apiClient.get('/user/notifications/public')
            ]

            if (isAdmin) {
                requests.push(apiClient.get('/admin/notifications'))
            }

            const results = await Promise.all(requests)
            
            const privateNotifs = results[0].data.notifications || results[0].data || []
            const publicNotifs = results[1].data.notifications || results[1].data || []
            const adminNotifs = isAdmin ? (results[2].data.notifications || results[2].data || []) : []

            const all = [
                ...privateNotifs,
                ...publicNotifs,
                ...adminNotifs
            ].map(n => ({
                id: n.id,
                title: n.message || n.title,
                time: n.created_at,
                read: !!n.read_at,
                type: n.type || 'info',
                actionRequired: !n.read_at
            }))

            // Sort by date newest first
            notifications.value = all.sort((a, b) => new Date(b.time) - new Date(a.time))
            this.updateUnreadCount()
        } catch (error) {
            logger.error('Error fetching notifications:', error)
        }
    },

    /**
     * Send public notification (Admin only)
     */
    async sendPublicNotification(message) {
        try {
            const response = await apiClient.post('/admin/notifications/send-public', { message })
            return response.data
        } catch (error) {
            logger.error('Error sending public notification:', error)
            throw error
        }
    },

    /**
     * Send notification to specific user (Admin only)
     */
    async sendUserNotification(userId, message) {
        try {
            const response = await apiClient.post('/admin/notifications/send-to-user', { user_id: userId, message })
            return response.data
        } catch (error) {
            logger.error(`Error sending notification to user ${userId}:`, error)
            throw error
        }
    },

    /**
     * Get notifications for a specific user (Admin only)
     */
    async getUserNotifications(userId) {
        try {
            const response = await apiClient.get(`/admin/notifications/user/${userId}`)
            return response.data
        } catch (error) {
            logger.error(`Error fetching notifications for user ${userId}:`, error)
            throw error
        }
    },

    /**
     * Get all public notifications (Admin only)
     */
    async getAdminPublicNotifications() {
        try {
            const response = await apiClient.get('/admin/notifications/public')
            return response.data
        } catch (error) {
            logger.error('Error fetching admin public notifications:', error)
            throw error
        }
    },

    /**
     * Handle incoming WebSocket notification
     */
    addReceivedNotification(data, source) {
        const newNotif = {
            id: data.id || Date.now(),
            title: data.message,
            time: new Date().toISOString(),
            read: false,
            type: source === 'admin' ? 'warning' : 'info',
            actionRequired: true
        }
        notifications.value.unshift(newNotif)
        this.updateUnreadCount()
        
        // Optional: Trigger a browser notification or toast here
        logger.debug(`New ${source} notification received:`, data.message)
    },

    async markAsRead(id) {
        try {
            await apiClient.patch(`/user/notifications/${id}/read`)
            const n = notifications.value.find(x => x.id === id)
            if (n) {
                n.read = true
                n.actionRequired = false
                this.updateUnreadCount()
            }
        } catch (error) {
            logger.error('Error marking as read:', error)
        }
    },

    async markAllAsRead() {
        try {
            await apiClient.patch('/user/notifications/mark-all-read')
            notifications.value.forEach(n => {
                n.read = true
                n.actionRequired = false
            })
            this.updateUnreadCount()
        } catch (error) {
            logger.error('Error marking all as read:', error)
        }
    },

    updateUnreadCount() {
        unreadCount.value = notifications.value.filter(n => !n.read).length
    },

    disconnect() {
        if (pusher) {
            channels.forEach(c => c.unbind_all())
            pusher.disconnect()
            pusher = null
            channels = []
        }
    }
}

export default notificationService
