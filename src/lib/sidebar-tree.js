import { resolveSidebarIcon } from "@/lib/sidebar-icons";

const parentIdKey = (parentId) => {
  if (parentId === null || parentId === undefined || parentId === "") return null;
  return String(parentId);
};

/**
 * Build nested nav items from a flat API sidebar list (sorted by order).
 * @param {import('@/types/sidebar.types').SidebarItem[]} items
 */
export const buildNavigationFromSidebarItems = (items = []) => {
  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const byParent = new Map();

  for (const item of sorted) {
    const key = parentIdKey(item.parentId);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }

  const mapItem = (item) => {
    const children = (byParent.get(String(item._id)) || []).map((child) => ({
      _id: child._id,
      slug: child.slug || deriveSlug(child.route),
      to: child.route,
      label: child.title,
      icon: resolveSidebarIcon(child.icon),
      order: child.order
    }));

    return {
      _id: item._id,
      slug: item.slug || deriveSlug(item.route),
      to: item.route,
      label: item.title,
      icon: resolveSidebarIcon(item.icon),
      order: item.order,
      ...(children.length ? { children } : {})
    };
  };

  const topLevel = (byParent.get(null) || []).map(mapItem);

  return {
    navigationGroups: [{ label: "Menu", items: topLevel }],
    navigationItems: topLevel
  };
};

const deriveSlug = (route = "") => {
  const path = String(route).replace(/\/+$/, "") || "/";
  return path.split("/").filter(Boolean).pop() || "home";
};

/**
 * Apply a new top-level order locally after drag.
 * @param {import('@/types/sidebar.types').SidebarItem[]} items
 * @param {string[]} orderedTopLevelIds
 */
export const applyTopLevelOrder = (items, orderedTopLevelIds) => {
  const idToOrder = new Map(orderedTopLevelIds.map((id, index) => [String(id), index + 1]));
  return items.map((item) => {
    if (parentIdKey(item.parentId) !== null) return item;
    const nextOrder = idToOrder.get(String(item._id));
    if (nextOrder === undefined) return item;
    return { ...item, order: nextOrder };
  });
};

/**
 * Sort items alphabetically by title within each parent group,
 * then reassign sequential `order` values.
 * @param {import('@/types/sidebar.types').SidebarItem[]} items
 */
export const applyAlphabeticalOrder = (items = []) => {
  const byParent = new Map();

  for (const item of items) {
    const key = parentIdKey(item.parentId);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }

  const orderById = new Map();

  for (const groupItems of byParent.values()) {
    const sorted = [...groupItems].sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""), undefined, {
        sensitivity: "base",
        numeric: true
      })
    );
    sorted.forEach((item, index) => {
      orderById.set(String(item._id), index + 1);
    });
  }

  return items.map((item) => {
    const nextOrder = orderById.get(String(item._id));
    if (nextOrder === undefined) return item;
    return { ...item, order: nextOrder };
  });
};
