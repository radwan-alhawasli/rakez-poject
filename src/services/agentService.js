/**
 * Agent (AI/Chatbot) service - in-memory CRUD with optional localStorage persistence.
 * Replace with API calls when backend is available.
 */

const STORAGE_KEY = 'rakez_agents';

function getStoredAgents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredAgents(agents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (_e) {
    // localStorage full or unavailable; in-memory only
  }
}

function nextId(agents) {
  const max = agents.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
  return String(max + 1);
}

const agentService = {
  /**
   * Get all agents.
   * @returns {Promise<Array<{ id, name, description?, humanHelpEnabled, humanHelpLabel, finishEnabled, finishLabel, createdAt, updatedAt }>>}
   */
  async getAgents() {
    const list = getStoredAgents();
    return [...list].sort(
      (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
    );
  },

  /**
   * Get one agent by id.
   * @param {string|number} id
   * @returns {Promise<Object|null>}
   */
  async getAgent(id) {
    const agents = getStoredAgents();
    return agents.find(a => String(a.id) === String(id)) || null;
  },

  /**
   * Create a new agent.
   * @param {Object} data - { name, description?, humanHelpEnabled, humanHelpLabel, finishEnabled, finishLabel }
   * @returns {Promise<Object>} Created agent with id, createdAt, updatedAt
   */
  async createAgent(data) {
    const agents = getStoredAgents();
    const now = new Date().toISOString();
    const agent = {
      id: nextId(agents),
      name: data.name || '',
      description: data.description ?? '',
      humanHelpEnabled: !!data.humanHelpEnabled,
      humanHelpLabel: data.humanHelpLabel ?? 'Human Help',
      finishEnabled: !!data.finishEnabled,
      finishLabel: data.finishLabel ?? 'Finish Conversation',
      createdAt: now,
      updatedAt: now,
    };
    agents.push(agent);
    setStoredAgents(agents);
    return { ...agent };
  },

  /**
   * Update an existing agent.
   * @param {string|number} id
   * @param {Object} data - same shape as create
   * @returns {Promise<Object|null>} Updated agent or null if not found
   */
  async updateAgent(id, data) {
    const agents = getStoredAgents();
    const index = agents.findIndex(a => String(a.id) === String(id));
    if (index === -1) return null;
    const now = new Date().toISOString();
    agents[index] = {
      ...agents[index],
      name: data.name !== undefined ? data.name : agents[index].name,
      description: data.description !== undefined ? data.description : agents[index].description,
      humanHelpEnabled:
        data.humanHelpEnabled !== undefined
          ? !!data.humanHelpEnabled
          : agents[index].humanHelpEnabled,
      humanHelpLabel:
        data.humanHelpLabel !== undefined ? data.humanHelpLabel : agents[index].humanHelpLabel,
      finishEnabled:
        data.finishEnabled !== undefined ? !!data.finishEnabled : agents[index].finishEnabled,
      finishLabel: data.finishLabel !== undefined ? data.finishLabel : agents[index].finishLabel,
      updatedAt: now,
    };
    setStoredAgents(agents);
    return { ...agents[index] };
  },

  /**
   * Delete an agent.
   * @param {string|number} id
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async deleteAgent(id) {
    const agents = getStoredAgents();
    const filtered = agents.filter(a => String(a.id) !== String(id));
    if (filtered.length === agents.length) return false;
    setStoredAgents(filtered);
    return true;
  },
};

export default agentService;
