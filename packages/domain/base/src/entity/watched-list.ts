export abstract class WatchedList<T> {
  public currentItems: T[]
  private initial: T[]
  private newItems: T[]
  private removedItems: T[]

  constructor(initialItems?: T[]) {
    this.currentItems = initialItems ?? []
    this.initial = initialItems ?? []
    this.newItems = []
    this.removedItems = []
  }

  abstract compareItems(a: T, b: T): boolean

  public getItems(): T[] {
    return this.currentItems
  }

  public getNewItems(): T[] {
    return this.newItems
  }

  public getRemovedItems(): T[] {
    return this.removedItems
  }

  private isCurrentItem(item: T): boolean {
    return (
      this.currentItems.filter((value: T) => this.compareItems(item, value))
        .length !== 0
    )
  }

  private isNewItem(item: T): boolean {
    return (
      this.newItems.filter((value: T) => this.compareItems(item, value))
        .length !== 0
    )
  }

  private isRemovedItem(item: T): boolean {
    return (
      this.removedItems.filter((value: T) => this.compareItems(item, value))
        .length !== 0
    )
  }

  private removeFromNew(item: T): void {
    this.newItems = this.newItems.filter(
      (value) => !this.compareItems(value, item),
    )
  }

  private removeFromCurrent(item: T): void {
    this.currentItems = this.currentItems.filter(
      (value) => !this.compareItems(item, value),
    )
  }

  private removeFromRemoved(item: T): void {
    this.removedItems = this.removedItems.filter(
      (value) => !this.compareItems(item, value),
    )
  }

  private wasAddedInitially(item: T): boolean {
    return (
      this.initial.filter((value: T) => this.compareItems(item, value))
        .length !== 0
    )
  }

  public exists(item: T): boolean {
    return this.isCurrentItem(item)
  }

  public add(item: T): void {
    if (this.isRemovedItem(item)) {
      this.removeFromRemoved(item)
    }

    if (!this.isNewItem(item) && !this.wasAddedInitially(item)) {
      this.newItems.push(item)
    }

    if (!this.isCurrentItem(item)) {
      this.currentItems.push(item)
    }
  }

  public remove(item: T): void {
    this.removeFromCurrent(item)

    if (this.isNewItem(item)) {
      this.removeFromNew(item)
      return
    }

    if (!this.isRemovedItem(item)) {
      this.removedItems.push(item)
    }
  }

  public update(items: T[]): void {
    const addedItems = items.filter((candidate) => {
      return !this.getItems().some((current) =>
        this.compareItems(candidate, current),
      )
    })

    const droppedItems = this.getItems().filter((current) => {
      return !items.some((candidate) => this.compareItems(current, candidate))
    })

    this.currentItems = items
    this.newItems = addedItems
    this.removedItems = droppedItems
  }
}
