import { ref } from 'vue'

const STORAGE_KEY = 'rakez_notifications'

// Initial Mock Notifications matching screenshot
const INITIAL_NOTIFICATIONS = [
    {
        id: 1,
        title: 'تم إضافة مشروع جديد "أدوار للبيع في أصيل فلور - حي النرجس" وهو الآن في قسم المشاريع غير الجاهزة للمراجعة.',
        time: 'منذ 6 أيام بواسطة النظام',
        read: false,
        actionRequired: true
    },
    {
        id: 2,
        title: 'تم إضافة مشروع جديد "أدوار رحاب 1 - حي التعاون الرياض" وهو الآن في قسم المشاريع غير الجاهزة للمراجعة.',
        time: 'منذ 6 أيام بواسطة النظام',
        read: false,
        actionRequired: true
    },
    {
        id: 3,
        title: 'تم إضافة مشروع جديد "شقق نرفانا القصر - المدينة المنورة" وهو الآن في قسم المشاريع غير الجاهزة للمراجعة.',
        time: 'منذ 6 أيام بواسطة النظام',
        read: false,
        actionRequired: true
    },
    {
        id: 4,
        title: 'تم إضافة مشروع جديد "ss" وهو الآن في قسم المشاريع غير الجاهزة للمراجعة.',
        time: 'منذ 7 أيام بواسطة النظام',
        read: false,
        actionRequired: true
    }
]

const notifications = ref([])

const loadNotifications = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        notifications.value = JSON.parse(stored)
    } else {
        notifications.value = INITIAL_NOTIFICATIONS
        saveNotifications()
    }
}

const saveNotifications = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
}

const notificationService = {
    state: notifications,

    getAll() {
        if (notifications.value.length === 0) loadNotifications()
        return notifications
    },

    addNotification(text, type = 'info') {
        const newNotif = {
            id: Date.now(),
            title: text,
            time: 'الآن',
            read: false,
            actionRequired: type === 'action'
        }
        notifications.value.unshift(newNotif)
        saveNotifications()
    },

    markAsRead(id) {
        const n = notifications.value.find(x => x.id === id)
        if (n) {
            n.read = true
            n.actionRequired = false // Assume action taken or dismissed
            saveNotifications()
        }
    },

    markAllAsRead() {
        notifications.value.forEach(n => {
            n.read = true
            n.actionRequired = false
        })
        saveNotifications()
    },

    triggerProjectCompletion(projectName) {
        this.addNotification(
            `تم نقل مشروع "${projectName}" إلى المشاريع الجاهزة بعد اكتمال المتتبع.`,
            'success'
        )
    }
}

export default notificationService
