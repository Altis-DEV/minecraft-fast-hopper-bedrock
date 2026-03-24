import { system, EntityComponentTypes } from "@minecraft/server";

const BLOCK_ID = "altis:fast_hopper";
const STORAGE_ENTITY_ID = "entity:fast_hopper";

function posKey(loc) {
  return `${loc.x},${loc.y},${loc.z}`;
}

function getStorageEntityAt(dimension, location) {
  return dimension.getEntitiesAtBlockLocation(location).find(e => e.typeId === STORAGE_ENTITY_ID);
}

class FastHopperComponent {
  onPlace(ev) {
    const block = ev.block;
    const dim = block.dimension;
    const loc = block.location;

    if (getStorageEntityAt(dim, loc)) return;

    dim.spawnEntity(STORAGE_ENTITY_ID, {
      x: loc.x + 0.5,
      y: loc.y + 0.5,
      z: loc.z + 0.5
    });
  }

  onBreak(ev) {
    const block = ev.block;
    const dim = block.dimension;
    const loc = block.location;

    for (const e of dim.getEntitiesAtBlockLocation(loc)) {
      if (e.typeId === STORAGE_ENTITY_ID) {
        e.remove();
      }
    }
  }

  onTick(ev) {
    const block = ev.block;
    if (block.typeId !== BLOCK_ID) return;

    const dim = block.dimension;
    const loc = block.location;

    const storageEntity = getStorageEntityAt(dim, loc);
    if (!storageEntity) return;

    const storageInv = storageEntity.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!storageInv) return;

    // Đẩy item xuống block bên dưới
    const below = dim.getBlock({ x: loc.x, y: loc.y - 1, z: loc.z });
    const belowInv = below?.getComponent("minecraft:inventory")?.container;

    if (belowInv) {
      for (let i = 0; i < storageInv.size; i++) {
        const item = storageInv.getItem(i);
        if (!item) continue;

        const moved = belowInv.addItem(item);
        if (!moved) {
          storageInv.setItem(i, null);
        }
      }
    }
  }
}

system.beforeEvents.startup.subscribe((initEvent) => {
  initEvent.blockComponentRegistry.registerCustomComponent("altis:fast_hopper", new FastHopperComponent());
});
