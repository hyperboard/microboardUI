# Groups UI Integration Documentation

Groups in Hyperboard allow multiple items to be treated as a single unit. They are similar to Frames but without the visible boundaries and title by default.

## Data Structure

A Group is an item with `itemType: "Group"`.

```typescript
{
  id: string,
  itemType: "Group",
  children: string[], // IDs of child items
  transformation: TransformationData // Group's own position/scale
}
```

## How to Interact with Groups

### 1. Creating a Group

Groups are created via the standard `Board.add` operation (or `addLockedGroup` for special cases).
When creating a group, you can optionally provide an initial list of children.

### 2. Adding/Removing Items

Items are added to or removed from a group using the `addChildren` and `removeChildren` operations.

- **Operation**: `addChildren`
- **Method**: `addChildren`
- **NewData**: `{ childIds: string[] }`

When an item is added to a group:

- Its `parent` property changes from `"Board"` to the group's [id](file:///home/alex/microboard/hyperboard/microboard/src/itemFactories.ts#119-128).
- Its transformation is converted from world-space to local-space relative to the group.
- It is removed from the board's global spatial index and added to the group's internal index.

### 3. Transformations

- **Moving the Group**: Transforming the group itself (e.g., via `translateBy`) moves all its children automatically because children are rendered relative to the group.
- **Moving Children**: Children can still be transformed individually. Their transformations are stored as **local** coordinates relative to the group's origin.

## Synchronization (Operations and Commands)

For synchronization across clients, use the following operations:

| Action              | Class                                                                                                | Method                         | Payload (`newData`)               |
| :------------------ | :--------------------------------------------------------------------------------------------------- | :----------------------------- | :-------------------------------- |
| **Add Children**    | [Group](file:///home/alex/microboard/hyperboard/microboard/src/Items/Group)                          | `addChildren`                  | `{ childIds: string[] }`          |
| **Remove Children** | [Group](file:///home/alex/microboard/hyperboard/microboard/src/Items/Group)                          | `removeChildren`               | `{ childIds: string[] }`          |
| **Transform Group** | [Transformation](file:///home/alex/microboard/hyperboard/microboard/src/Items/Frame/Frame.ts#98-102) | `translateBy`, `scaleTo`, etc. | (Standard transformation payload) |

> [!IMPORTANT]
> Always use plural `addChildren`/`removeChildren` for consistency and correct undo/redo support.

## Relationship with Frames

- Both [Group](file:///home/alex/microboard/hyperboard/microboard/src/Items/Group) and [Frame](file:///home/alex/microboard/hyperboard/microboard/src/Items/Frame/Frame.ts#44-824) inherit from [BaseItem](file:///home/alex/microboard/hyperboard/microboard/src/Items/BaseItem/BaseItem.ts#85-598) and use the same nested transformation logic.
- Unlike Frames, Groups do not have a title or a rendered background path by default (though they provide a [render](file:///home/alex/microboard/hyperboard/microboard/src/Items/Frame/Frame.ts#696-714) method that can be extended).
- Current limitation: Groups cannot be nested inside other Groups or Frames.
