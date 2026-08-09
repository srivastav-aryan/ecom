/**
 * backfill-ancestors.ts
 *
 * One-time migration script to populate the `ancestors` field for
 * all existing categories in the database.
 *
 * HOW IT WORKS:
 *   1. Fetch all categories from the DB
 *   2. Build an adjacency map: parentId → [child categories]
 *   3. BFS from root categories (parent = null), level by level
 *      - Roots get ancestors = []
 *      - Each child gets ancestors = [...parent.ancestors, parent._id]
 *   4. Bulk-write all updates in one operation
 *
 * WHY BFS (breadth-first)?
 *   We must process parents BEFORE their children, because each child's
 *   ancestors = parent's ancestors + parent._id. BFS guarantees this
 *   by processing level 0 (roots), then level 1, then level 2, etc.
 *
 * SAFE TO RE-RUN: Idempotent — recalculates all ancestors from scratch.
 *
 * USAGE:
 *   npx tsx src/scripts/backfill-ancestors.ts
 */

import mongoose from "mongoose";
import { Category } from "../modules/catalog/models/category.model.js";
import { connectDB } from "../shared/config/dbconfig.js";
import { fileURLToPath } from "url";

interface CategoryDoc {
  _id: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId | null;
  name: string;
}

async function backfillAncestors() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    // Step 1: Fetch all categories (only the fields we need)
    const allCategories = await Category.find(
      {},
      { _id: 1, parent: 1, name: 1 },
    ).lean<CategoryDoc[]>();

    console.log(`Found ${allCategories.length} categories to process`);

    if (allCategories.length === 0) {
      console.log("No categories found. Nothing to do.");
      return;
    }

    // Step 2: Build adjacency map — parentId → [children]
    // Also build a lookup map — categoryId → category doc
    const childrenOf = new Map<string, CategoryDoc[]>();
    const categoryById = new Map<string, CategoryDoc>();
    const roots: CategoryDoc[] = [];

    for (const cat of allCategories) {
      categoryById.set(cat._id.toString(), cat);

      if (!cat.parent) {
        roots.push(cat);
      } else {
        const parentKey = cat.parent.toString();
        if (!childrenOf.has(parentKey)) {
          childrenOf.set(parentKey, []);
        }
        childrenOf.get(parentKey)!.push(cat);
      }
    }

    console.log(`Found ${roots.length} root categories`);

    // Step 3: BFS — process level by level
    // Each entry in the queue is: { categoryId, ancestors }
    const updates: Array<{
      id: mongoose.Types.ObjectId;
      ancestors: mongoose.Types.ObjectId[];
    }> = [];

    // Start BFS with roots (ancestors = [])
    let queue: Array<{
      doc: CategoryDoc;
      ancestors: mongoose.Types.ObjectId[];
    }> = roots.map((root) => ({ doc: root, ancestors: [] }));

    let level = 0;

    while (queue.length > 0) {
      console.log(`Processing level ${level}: ${queue.length} categories`);

      const nextQueue: typeof queue = [];

      for (const { doc, ancestors } of queue) {
        // Record this category's ancestors
        updates.push({ id: doc._id, ancestors });

        // Find this category's children and enqueue them
        const children = childrenOf.get(doc._id.toString()) ?? [];
        for (const child of children) {
          nextQueue.push({
            doc: child,
            ancestors: [...ancestors, doc._id],
          });
        }
      }

      queue = nextQueue;
      level++;
    }

    // Sanity check: did we visit every category?
    if (updates.length !== allCategories.length) {
      console.warn(
        `⚠️  Visited ${updates.length}/${allCategories.length} categories. ` +
          `Some categories may have orphaned parents (parent ID points to a non-existent category).`,
      );
    }

    // Step 4: Bulk write all updates
    console.log(`Writing ancestors for ${updates.length} categories...`);

    const bulkOps = updates.map(({ id, ancestors }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { ancestors } },
      },
    }));

    const result = await Category.bulkWrite(bulkOps);
    console.log(
      `✅ Backfill complete! Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`,
    );
  } catch (error) {
    console.error("❌ Error during backfill:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  backfillAncestors();
}
