// Декоратор для троттлинга событий движения указателя
function throttlePointerEvent<
  T extends (event: PointerEvent, ...args: any[]) => any,
>(func: T, limit: number): T {
  let lastCallTime = 0;
  let lastEvent: PointerEvent | null = null;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const currentTime = Date.now();
    const event = args[0] as PointerEvent;

    // Обновляем lastEvent каждый раз, когда получаем новое событие
    lastEvent = event;

    if (currentTime - lastCallTime >= limit) {
      lastCallTime = currentTime;
      const result = func.apply(this, [
        lastEvent,
        ...args.slice(1),
      ] as Parameters<T>);
      lastEvent = null;
      return result;
    }

    return undefined as ReturnType<T>;
  } as T;
}
