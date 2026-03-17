<template>
  <div class="chat-app">
    <!-- Conversations sidebar -->
    <aside class="chat-sidebar" :class="{ 'show-mobile': !activeConversation }">
      <div class="sidebar-top">
        <h2 class="sidebar-title">المحادثات</h2>
      </div>

      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="بحث في المحادثات..." />
      </div>

      <div class="conversations-list custom-scrollbar">
        <div v-if="isLoadingConversations" class="loading-center"><div class="spinner"></div></div>
        <div v-else-if="filteredConversations.length === 0" class="empty-hint">لا توجد محادثات</div>
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ active: activeConversation?.id === conv.id }"
          @click="openConversation(conv)"
        >
          <div class="avatar" :style="{ background: avatarColor(conv.other_user?.name) }">
            {{ avatarLetter(conv.other_user?.name) }}
          </div>
          <div class="conv-info">
            <div class="conv-row">
              <span class="conv-name">{{ conv.other_user?.name || 'مستخدم' }}</span>
              <span class="conv-time">{{ relativeTime(conv.last_message_at) }}</span>
            </div>
            <div class="conv-row">
              <span class="conv-preview">{{ conv._lastPreview || '' }}</span>
              <span v-if="conv.unread_count > 0" class="unread-badge">{{ conv.unread_count }}</span>
            </div>
          </div>
        </div>
      </div>

    </aside>

    <!-- Messages panel -->
    <section class="chat-main" :class="{ 'show-mobile': !!activeConversation }">
      <template v-if="activeConversation">
        <!-- Header -->
        <div class="chat-header">
          <button class="btn-back-mobile" @click="activeConversation = null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="avatar sm" :style="{ background: avatarColor(activeConversation.other_user?.name) }">
            {{ avatarLetter(activeConversation.other_user?.name) }}
          </div>
          <div class="header-info">
            <span class="header-name">{{ activeConversation.other_user?.name || 'مستخدم' }}</span>
            <span class="header-status">{{ activeConversation.other_user?.email || '' }}</span>
          </div>
        </div>

        <!-- Messages -->
        <div class="messages-area custom-scrollbar" ref="messagesArea" @scroll="onMessagesScroll">
          <div v-if="isLoadingMessages && messages.length === 0" class="loading-center"><div class="spinner"></div></div>
          <div v-if="hasMoreMessages && messages.length > 0" class="load-more-row">
            <button class="btn-load-more" @click="loadMoreMessages" :disabled="isLoadingMessages">تحميل المزيد</button>
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row"
            :class="{ mine: msg.sender_id === currentUserId, theirs: msg.sender_id !== currentUserId }"
            @contextmenu.prevent="onMessageContext($event, msg)"
          >
            <div class="bubble">
              <p class="bubble-text">{{ msg.message }}</p>
              <div class="bubble-meta">
                <span class="bubble-time">{{ formatMsgTime(msg.created_at) }}</span>
                <svg v-if="msg.sender_id === currentUserId" class="read-icon" :class="{ read: msg.is_read }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Context menu -->
        <Teleport to="body">
          <div v-if="contextMenu.visible" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @click="contextMenu.visible = false">
            <button class="ctx-item danger" @click="deleteMsg(contextMenu.msg)" v-if="contextMenu.msg?.sender_id === currentUserId">حذف الرسالة</button>
            <button class="ctx-item" @click="copyMsg(contextMenu.msg)">نسخ</button>
          </div>
        </Teleport>

        <!-- Composer -->
        <div class="composer">
          <div class="emoji-wrapper">
            <button class="btn-emoji" @click="showEmoji = !showEmoji">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </button>
            <div v-if="showEmoji" class="emoji-picker">
              <span v-for="e in emojiList" :key="e" class="emoji-item" @click="insertEmoji(e)">{{ e }}</span>
            </div>
          </div>
          <input
            ref="composerInput"
            v-model="newMessage"
            type="text"
            class="composer-input"
            placeholder="اكتب رسالة..."
            maxlength="5000"
            @keydown.enter.exact="sendMessage"
          />
          <button class="btn-send" @click="sendMessage" :disabled="!newMessage.trim() || isSending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </template>

      <div v-else class="no-chat-selected">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:64px;height:64px;opacity:.25"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p>اختر محادثة للبدء</p>
      </div>
    </section>

    <!-- New Chat Modal -->
    <div v-if="showNewChatModal" class="modal-overlay" @click.self="showNewChatModal = false">
      <div class="modal-box animate-scale-in">
        <div class="modal-header-bar">
          <h3>محادثة جديدة</h3>
          <button class="modal-close" @click="showNewChatModal = false">&times;</button>
        </div>
        <div class="modal-body-area">
          <input v-model="userSearchQuery" type="text" class="form-input" placeholder="بحث عن موظف..." @input="searchUsers" />
          <div class="user-list custom-scrollbar">
            <div v-if="isSearchingUsers" class="loading-center"><div class="spinner sm"></div></div>
            <div v-for="u in searchedUsers" :key="u.id" class="user-row" @click="startConversation(u.id)">
              <div class="avatar sm" :style="{ background: avatarColor(u.name) }">{{ avatarLetter(u.name) }}</div>
              <div class="user-meta">
                <span class="user-name">{{ u.name }}</span>
                <span class="user-email">{{ u.email || '' }}</span>
              </div>
            </div>
            <div v-if="!isSearchingUsers && searchedUsers.length === 0 && userSearchQuery.length > 0" class="empty-hint">لا توجد نتائج</div>
          </div>
        </div>
      </div>
    </div>

    <!-- WhatsApp-style FAB - bottom left, hides when inside a conversation -->
    <button v-if="!activeConversation" class="fab-new-chat" @click="showNewChatModal = true" title="محادثة جديدة">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    </button>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import chatService from '@/services/chatService'
import userService from '@/services/userService'
import authService from '@/services/authService'
import { createPusher } from '@/plugins/pusher'

export default {
  name: 'ChatView',
  setup() {
    const conversations = ref([])
    const activeConversation = ref(null)
    const messages = ref([])
    const newMessage = ref('')
    const searchQuery = ref('')
    const isLoadingConversations = ref(false)
    const isLoadingMessages = ref(false)
    const isSending = ref(false)
    const showNewChatModal = ref(false)
    const userSearchQuery = ref('')
    const searchedUsers = ref([])
    const isSearchingUsers = ref(false)
    const showEmoji = ref(false)
    const messagesArea = ref(null)
    const composerInput = ref(null)
    const currentPage = ref(1)
    const hasMoreMessages = ref(false)
    const contextMenu = ref({ visible: false, x: 0, y: 0, msg: null })

    let pusher = null
    let subscribedChannels = []
    let searchDebounce = null

    const currentUser = authService.getCurrentUser()
    const currentUserId = currentUser?.id ?? Number(localStorage.getItem('userId') || 0)

    const emojiList = [
      '\u{1F600}','\u{1F602}','\u{1F60D}','\u{1F60A}','\u{1F609}','\u{1F614}','\u{1F622}','\u{1F621}',
      '\u{1F44D}','\u{1F44E}','\u{1F44B}','\u{1F64F}','\u{2764}','\u{1F525}','\u{1F389}','\u{1F4AA}',
      '\u{2705}','\u{274C}','\u{1F4AC}','\u{1F4E9}','\u{1F4C8}','\u{1F3E0}','\u{2B50}','\u{1F31F}'
    ]

    const filteredConversations = computed(() => {
      if (!searchQuery.value.trim()) return conversations.value
      const q = searchQuery.value.toLowerCase()
      return conversations.value.filter(c => (c.other_user?.name || '').toLowerCase().includes(q))
    })

    const avatarLetter = (name) => (name || 'U').charAt(0).toUpperCase()
    const avatarColor = (name) => {
      const colors = ['#B1A28F','#6B8F71','#8B6F5E','#5B7B9A','#9B7B6B','#7B6B8F','#6B8B9B','#8F7B5B']
      let hash = 0
      for (const ch of (name || 'U')) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
      return colors[Math.abs(hash) % colors.length]
    }

    const relativeTime = (dt) => {
      if (!dt) return ''
      const diff = Date.now() - new Date(dt).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'الآن'
      if (mins < 60) return `${mins} د`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs} س`
      const days = Math.floor(hrs / 24)
      if (days < 7) return `${days} ي`
      return new Date(dt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
    }

    const formatMsgTime = (dt) => {
      if (!dt) return ''
      return new Date(dt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }

    const loadConversations = async () => {
      isLoadingConversations.value = true
      try {
        const data = await chatService.getConversations()
        conversations.value = Array.isArray(data) ? data : []
      } catch { /* silent */ } finally {
        isLoadingConversations.value = false
      }
    }

    const openConversation = async (conv) => {
      activeConversation.value = conv
      messages.value = []
      currentPage.value = 1
      hasMoreMessages.value = false
      isLoadingMessages.value = true
      try {
        await chatService.markAsRead(conv.id)
        conv.unread_count = 0
        const res = await chatService.getMessages(conv.id, 1, 50)
        messages.value = (res.messages || []).reverse()
        hasMoreMessages.value = res.meta?.has_more_pages || false
        currentPage.value = 1
        await nextTick()
        scrollToBottom()
      } catch { /* silent */ } finally {
        isLoadingMessages.value = false
      }
      subscribeToConversation(conv.id)
    }

    const loadMoreMessages = async () => {
      if (!activeConversation.value || isLoadingMessages.value) return
      isLoadingMessages.value = true
      try {
        const nextPage = currentPage.value + 1
        const res = await chatService.getMessages(activeConversation.value.id, nextPage, 50)
        const older = (res.messages || []).reverse()
        messages.value = [...older, ...messages.value]
        hasMoreMessages.value = res.meta?.has_more_pages || false
        currentPage.value = nextPage
      } catch { /* silent */ } finally {
        isLoadingMessages.value = false
      }
    }

    const sendMessage = async () => {
      const text = newMessage.value.trim()
      if (!text || !activeConversation.value || isSending.value) return
      isSending.value = true
      const optimistic = {
        id: Date.now(),
        conversation_id: activeConversation.value.id,
        sender_id: currentUserId,
        message: text,
        is_read: false,
        created_at: new Date().toISOString(),
        _optimistic: true
      }
      messages.value.push(optimistic)
      newMessage.value = ''
      showEmoji.value = false
      await nextTick()
      scrollToBottom()
      try {
        const saved = await chatService.sendMessage(activeConversation.value.id, text)
        const idx = messages.value.findIndex(m => m.id === optimistic.id)
        if (idx !== -1) messages.value.splice(idx, 1, saved)
        updateConvPreview(activeConversation.value.id, text)
      } catch {
        const idx = messages.value.findIndex(m => m.id === optimistic.id)
        if (idx !== -1) messages.value.splice(idx, 1)
      } finally {
        isSending.value = false
      }
    }

    const updateConvPreview = (convId, text) => {
      const c = conversations.value.find(x => x.id === convId)
      if (c) {
        c._lastPreview = text.length > 40 ? text.slice(0, 40) + '...' : text
        c.last_message_at = new Date().toISOString()
      }
    }

    const deleteMsg = async (msg) => {
      if (!msg) return
      try {
        await chatService.deleteMessage(msg.id)
        messages.value = messages.value.filter(m => m.id !== msg.id)
      } catch { /* silent */ }
      contextMenu.value.visible = false
    }

    const copyMsg = (msg) => {
      if (msg?.message) navigator.clipboard?.writeText(msg.message)
      contextMenu.value.visible = false
    }

    const onMessageContext = (e, msg) => {
      contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, msg }
    }

    const hideContextMenu = () => { contextMenu.value.visible = false }

    const insertEmoji = (e) => {
      newMessage.value += e
      composerInput.value?.focus()
    }

    const scrollToBottom = () => {
      if (messagesArea.value) messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }

    const onMessagesScroll = () => { /* future: auto-load more on scroll top */ }

    const searchUsers = () => {
      clearTimeout(searchDebounce)
      const q = userSearchQuery.value.trim()
      if (!q) { searchedUsers.value = []; return }
      searchDebounce = setTimeout(async () => {
        isSearchingUsers.value = true
        try {
          const res = await userService.getEmployees({ search: q, per_page: 20 })
          searchedUsers.value = (res.items || []).filter(u => u.id !== currentUserId)
        } catch { searchedUsers.value = [] } finally { isSearchingUsers.value = false }
      }, 300)
    }

    const startConversation = async (userId) => {
      showNewChatModal.value = false
      userSearchQuery.value = ''
      searchedUsers.value = []
      try {
        const conv = await chatService.getOrCreateConversation(userId)
        if (conv) {
          const existing = conversations.value.find(c => c.id === conv.id)
          if (!existing) conversations.value.unshift(conv)
          openConversation(conv)
        }
      } catch { /* silent */ }
    }

    const subscribeToConversation = (convId) => {
      if (!pusher) return
      const channelName = `private-conversation.${convId}`
      const already = subscribedChannels.find(c => c.name === channelName)
      if (already) return
      try {
        const ch = pusher.subscribe(channelName)
        ch.bind('message.sent', (data) => {
          if (activeConversation.value?.id === convId && data.sender_id !== currentUserId) {
            const exists = messages.value.find(m => m.id === data.id)
            if (!exists) {
              messages.value.push(data)
              nextTick(() => scrollToBottom())
              chatService.markAsRead(convId).catch(() => {})
            }
          }
          updateConvPreview(convId, data.message || '')
          const c = conversations.value.find(x => x.id === convId)
          if (c && data.sender_id !== currentUserId && activeConversation.value?.id !== convId) {
            c.unread_count = (c.unread_count || 0) + 1
          }
        })
        subscribedChannels.push(ch)
      } catch { /* Pusher not configured */ }
    }

    const initPusher = () => {
      const token = authService.getToken()
      if (!token) return
      pusher = createPusher(token)
      if (!pusher) return
      conversations.value.forEach(c => subscribeToConversation(c.id))
    }

    onMounted(async () => {
      await loadConversations()
      initPusher()
      document.addEventListener('click', hideContextMenu)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', hideContextMenu)
      subscribedChannels.forEach(ch => { try { ch.unbind_all(); ch.unsubscribe() } catch { /* */ } })
      if (pusher) { try { pusher.disconnect() } catch { /* */ } }
    })

    return {
      conversations, activeConversation, messages, newMessage, searchQuery,
      isLoadingConversations, isLoadingMessages, isSending,
      showNewChatModal, userSearchQuery, searchedUsers, isSearchingUsers,
      showEmoji, emojiList, messagesArea, composerInput,
      hasMoreMessages, contextMenu, filteredConversations, currentUserId,
      avatarLetter, avatarColor, relativeTime, formatMsgTime,
      loadConversations, openConversation, loadMoreMessages, sendMessage,
      deleteMsg, copyMsg, onMessageContext, insertEmoji, onMessagesScroll,
      searchUsers, startConversation
    }
  }
}
</script>

<style scoped>
.chat-app { display: flex; height: calc(100vh - 70px); background: #f8f6f3; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.06); margin: 0; }

/* Sidebar */
.chat-sidebar { width: 340px; min-width: 340px; background: #fff; border-left: 1px solid rgba(177,162,143,0.15); display: flex; flex-direction: column; position: relative; }
.sidebar-top { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 10px; }
.sidebar-title { font-family: 'Amiri', serif; font-size: 1.3rem; color: #1e3a5f; margin: 0; }
/* FAB - WhatsApp-style new chat button (fixed bottom-left) */
.fab-new-chat { position: fixed; bottom: 32px; left: 32px; width: 60px; height: 60px; border-radius: 50%; border: none; background: linear-gradient(135deg, #B1A28F, #8c7851); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 24px rgba(140,120,81,0.4); transition: transform .2s, box-shadow .2s; z-index: 500; }
.fab-new-chat:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(140,120,81,0.5); }
.fab-new-chat svg { width: 28px; height: 28px; }
.search-box { padding: 8px 16px 12px; position: relative; }
.search-icon { position: absolute; right: 28px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #94a3b8; pointer-events: none; }
.search-input { width: 100%; padding: 10px 40px 10px 14px; border-radius: 10px; border: 1px solid rgba(177,162,143,0.2); background: #f8f6f3; font-size: .85rem; outline: none; direction: rtl; transition: border-color .2s; }
.search-input:focus { border-color: #B1A28F; }

.conversations-list { flex: 1; overflow-y: auto; }
.conversation-item { display: flex; gap: 12px; padding: 14px 20px; cursor: pointer; transition: background .15s; border-bottom: 1px solid rgba(0,0,0,.03); }
.conversation-item:hover { background: rgba(177,162,143,0.06); }
.conversation-item.active { background: rgba(177,162,143,0.12); }
.avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
.avatar.sm { width: 36px; height: 36px; font-size: .9rem; }
.conv-info { flex: 1; min-width: 0; }
.conv-row { display: flex; justify-content: space-between; align-items: center; }
.conv-name { font-weight: 600; color: #1e3a5f; font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-time { font-size: .72rem; color: #94a3b8; flex-shrink: 0; }
.conv-preview { font-size: .78rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.unread-badge { background: #B1A28F; color: #fff; font-size: .68rem; min-width: 20px; height: 20px; border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 0 6px; font-weight: 700; flex-shrink: 0; }

/* Main chat area */
.chat-main { flex: 1; display: flex; flex-direction: column; background: #f0ede8; }
.no-chat-selected { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; gap: 12px; font-size: .95rem; }

.chat-header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #fff; border-bottom: 1px solid rgba(177,162,143,0.12); }
.btn-back-mobile { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
.btn-back-mobile svg { width: 22px; height: 22px; color: #1e3a5f; }
.header-info { display: flex; flex-direction: column; }
.header-name { font-weight: 600; color: #1e3a5f; font-size: .95rem; }
.header-status { font-size: .75rem; color: #94a3b8; }

/* Messages */
.messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 6px; }
.load-more-row { text-align: center; margin-bottom: 10px; }
.btn-load-more { background: rgba(177,162,143,0.15); border: none; padding: 6px 18px; border-radius: 16px; font-size: .78rem; color: #1e3a5f; cursor: pointer; }
.btn-load-more:hover { background: rgba(177,162,143,0.25); }
.message-row { display: flex; }
.message-row.mine { justify-content: flex-end; }
.message-row.theirs { justify-content: flex-start; }
.bubble { max-width: 65%; padding: 10px 14px; border-radius: 14px; position: relative; word-break: break-word; }
.mine .bubble { background: linear-gradient(135deg, #d5cfc6, #c4bba8); color: #1e3a5f; border-bottom-left: 4px; }
.theirs .bubble { background: #fff; color: #1e3a5f; box-shadow: 0 1px 4px rgba(0,0,0,.05); border-bottom-right: 4px; }
.bubble-text { margin: 0; font-size: .9rem; line-height: 1.6; white-space: pre-wrap; }
.bubble-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px; }
.bubble-time { font-size: .65rem; color: #8c7851; opacity: .7; }
.read-icon { width: 14px; height: 14px; color: #94a3b8; }
.read-icon.read { color: #4caf50; }

/* Context menu */
.context-menu { position: fixed; z-index: 9999; background: #fff; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,.12); padding: 6px 0; min-width: 140px; }
.ctx-item { display: block; width: 100%; text-align: right; padding: 8px 16px; border: none; background: none; cursor: pointer; font-size: .85rem; color: #1e3a5f; }
.ctx-item:hover { background: rgba(177,162,143,0.1); }
.ctx-item.danger { color: #e74c3c; }

/* Composer */
.composer { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fff; border-top: 1px solid rgba(177,162,143,0.12); }
.emoji-wrapper { position: relative; }
.btn-emoji { background: none; border: none; cursor: pointer; padding: 4px; }
.btn-emoji svg { width: 24px; height: 24px; color: #8c7851; }
.emoji-picker { position: absolute; bottom: 44px; right: 0; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.12); padding: 10px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; width: 280px; z-index: 100; }
.emoji-item { font-size: 1.3rem; cursor: pointer; text-align: center; padding: 4px; border-radius: 6px; transition: background .15s; }
.emoji-item:hover { background: rgba(177,162,143,0.15); }
.composer-input { flex: 1; padding: 10px 16px; border-radius: 20px; border: 1px solid rgba(177,162,143,0.2); background: #f8f6f3; font-size: .9rem; outline: none; direction: rtl; }
.composer-input:focus { border-color: #B1A28F; }
.btn-send { width: 40px; height: 40px; border-radius: 50%; border: none; background: linear-gradient(135deg, #B1A28F, #8c7851); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform .2s, opacity .2s; }
.btn-send:disabled { opacity: .4; cursor: default; }
.btn-send:not(:disabled):hover { transform: scale(1.08); }
.btn-send svg { width: 18px; height: 18px; }

/* New Chat Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 9000; display: flex; align-items: center; justify-content: center; }
.modal-box { background: #fff; border-radius: 16px; width: 420px; max-width: 92vw; max-height: 70vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,.15); }
.animate-scale-in { animation: scaleIn .2s ease; }
@keyframes scaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.modal-header-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(177,162,143,0.12); }
.modal-header-bar h3 { margin: 0; font-family: 'Amiri', serif; color: #1e3a5f; font-size: 1.1rem; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
.modal-body-area { padding: 16px 20px; flex: 1; overflow-y: auto; }
.modal-body-area .form-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(177,162,143,0.2); background: #f8f6f3; font-size: .85rem; outline: none; margin-bottom: 12px; direction: rtl; }
.user-list { max-height: 300px; overflow-y: auto; }
.user-row { display: flex; align-items: center; gap: 12px; padding: 10px 8px; cursor: pointer; border-radius: 10px; transition: background .15s; }
.user-row:hover { background: rgba(177,162,143,0.08); }
.user-meta { display: flex; flex-direction: column; }
.user-name { font-weight: 600; color: #1e3a5f; font-size: .88rem; }
.user-email { font-size: .75rem; color: #94a3b8; }

/* Utilities */
.loading-center { display: flex; align-items: center; justify-content: center; padding: 30px; }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(177,162,143,0.2); border-top-color: #B1A28F; border-radius: 50%; animation: spin .6s linear infinite; }
.spinner.sm { width: 20px; height: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-hint { text-align: center; padding: 30px; color: #94a3b8; font-size: .85rem; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(177,162,143,0.25); border-radius: 4px; }

/* Mobile */
@media (max-width: 768px) {
  .chat-sidebar { width: 100%; min-width: 100%; position: absolute; inset: 0; z-index: 10; }
  .chat-main { position: absolute; inset: 0; z-index: 10; }
  .chat-sidebar:not(.show-mobile) { display: none; }
  .chat-main:not(.show-mobile) { display: none; }
  .chat-app { position: relative; }
  .btn-back-mobile { display: flex; }
}
</style>
