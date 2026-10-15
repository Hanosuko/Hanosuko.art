export interface PopoverPlace {
  left: number
  top: number
  // Центр элемента относительно левого края окна — сюда смотрит стрелка
  arrow: number
  below: boolean
}

// Окно над элементом и по его центру. У края экрана сдвигается внутрь, но arrow остаётся над элементом;
// если сверху не хватает места — открывается под элементом
export const placeOver = (anchor: DOMRect, width: number, height: number, gap = 12, edge = 8, arrowInset = 16): PopoverPlace => {
  const center = anchor.left + anchor.width / 2
  const left = Math.min(Math.max(center - width / 2, edge), window.innerWidth - edge - width)
  const below = anchor.top - gap - height < edge
  return {
    left,
    top: below ? anchor.bottom + gap : anchor.top - gap - height,
    arrow: Math.min(Math.max(center - left, arrowInset), width - arrowInset),
    below,
  }
}
