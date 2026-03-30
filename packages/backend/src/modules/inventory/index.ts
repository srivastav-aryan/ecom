// === Inventory Module Public API ===
// Other modules should ONLY import from this file, never reach into internals.

export { CartReservation, type ICartReservation } from "./models/cartReservation.model.js";
export { InventoryEvent, type IInventoryEvent, type InventoryEventType } from "./models/inventoryEvent.model.js";
