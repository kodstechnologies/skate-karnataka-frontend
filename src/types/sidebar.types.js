/**
 * @typedef {Object} SidebarItem
 * @property {string} _id
 * @property {string} title
 * @property {string} route
 * @property {string} icon
 * @property {string|null} [parentId]
 * @property {number} order
 * @property {string} [slug]
 * @property {boolean} [isActive]
 */

/**
 * @typedef {Object} SidebarReorderItem
 * @property {string} _id
 * @property {number} order
 */

/**
 * @typedef {Object} NavChildItem
 * @property {string} _id
 * @property {string} slug
 * @property {string} to
 * @property {string} label
 * @property {import('react').ComponentType<any>} icon
 */

/**
 * @typedef {Object} NavItem
 * @property {string} _id
 * @property {string} slug
 * @property {string} to
 * @property {string} label
 * @property {import('react').ComponentType<any>} icon
 * @property {NavChildItem[]} [children]
 */

/**
 * @typedef {Object} NavGroup
 * @property {string} label
 * @property {NavItem[]} items
 */

export {};
