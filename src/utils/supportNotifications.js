import { getJsonItem, setJsonItem } from './persistentStorage.js';

const STORAGE_KEY = 'support_unread_map_v1';
const TICKET_KEY_FIELDS = [
    'ticket_no',
    'ticketNo',
    'ticket_number',
    'ticketNumber',
    'ticket_id',
    'ticketId',
    'id'
];

function cloneMap(source) {
    if (!source || typeof source !== 'object') {
        return {};
    }
    return Object.fromEntries(
        Object.entries(source).map(([key, value]) => [key, { ...value }])
    );
}

function readStateObject(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return {};
    }
    const state = {};
    Object.entries(raw).forEach(([key, value]) => {
        if (!key) return;
        if (value && typeof value === 'object') {
            state[key] = {
                status: value.status ?? value.status_raw ?? null,
                status_raw: value.status_raw ?? value.status ?? null,
                updated_at: normalizeTimestamp(value.updated_at),
                notified_at: normalizeTimestamp(value.notified_at),
                previous_status: value.previous_status ?? value.previousStatus ?? null,
                previous_status_raw:
                    value.previous_status_raw ?? value.previousStatusRaw ?? null
            };
        }
    });
    return state;
}

function normalizeTimestamp(value) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
        return numeric;
    }
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.getTime();
    }
    return Date.now();
}

export function extractTicketKey(entry) {
    if (!entry || typeof entry !== 'object') {
        return null;
    }
    for (const field of TICKET_KEY_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(entry, field)) {
            const value = entry[field];
            if (value === null || value === undefined) {
                continue;
            }
            const text = String(value).trim();
            if (text) {
                return text;
            }
        }
    }
    return null;
}

async function persistState(map) {
    await setJsonItem(STORAGE_KEY, map);
}

export async function getSupportUnreadState() {
    const raw = await getJsonItem(STORAGE_KEY, {});
    const map = readStateObject(raw);
    return { map, count: Object.keys(map).length };
}

export async function mergeSupportUpdates(updates = []) {
    const { map } = await getSupportUnreadState();
    const working = cloneMap(map);
    let changed = false;
    const now = Date.now();

    updates.forEach(update => {
        const key = extractTicketKey(update);
        if (!key) {
            return;
        }
        const normalized = {
            status: update?.status ?? update?.status_raw ?? null,
            status_raw: update?.status_raw ?? update?.status ?? null,
            updated_at: normalizeTimestamp(update?.updated_at),
            previous_status: update?.previous_status ?? update?.previousStatus ?? null,
            previous_status_raw:
                update?.previous_status_raw ?? update?.previousStatusRaw ?? null,
            notified_at: now
        };

        const existing = working[key];
        if (
            !existing ||
            existing.updated_at !== normalized.updated_at ||
            !equalsIgnoreCase(existing.status, normalized.status) ||
            !equalsIgnoreCase(existing.status_raw, normalized.status_raw)
        ) {
            working[key] = normalized;
            changed = true;
        }
    });

    if (changed) {
        await persistState(working);
    }

    return {
        map: working,
        count: Object.keys(working).length,
        changed
    };
}

export async function markSupportTicketsRead(ticketKeys = []) {
    if (!Array.isArray(ticketKeys) || ticketKeys.length === 0) {
        return getSupportUnreadState();
    }
    const { map } = await getSupportUnreadState();
    const working = cloneMap(map);
    let changed = false;

    ticketKeys
        .map(key => String(key).trim())
        .filter(Boolean)
        .forEach(key => {
            if (working[key]) {
                delete working[key];
                changed = true;
            }
        });

    if (changed) {
        await persistState(working);
    }

    return {
        map: working,
        count: Object.keys(working).length,
        changed
    };
}

export async function markAllSupportTicketsRead() {
    await persistState({});
    return { map: {}, count: 0, changed: true };
}

function equalsIgnoreCase(left, right) {
    if (left === right) {
        return true;
    }
    if (left == null || right == null) {
        return false;
    }
    return String(left).toLowerCase() === String(right).toLowerCase();
}
