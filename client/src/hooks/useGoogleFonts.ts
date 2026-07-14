export function useGoogleFonts(fontFamilies: string[]) {
  const loaded = new Set<string>()

  const extractFontNames = (families: string[]): string[] => {
    const names: string[] = []
    for (const f of families) {
      const match = f.match(/^['"]?([A-Za-z\s]+)['"]?/)
      if (match) {
        const name = match[1].trim()
        if (name !== 'serif' && name !== 'sans-serif' && name !== 'cursive' && name !== 'monospace') {
          names.push(name)
        }
      }
    }
    return names
  }

  const loadFont = (fontName: string) => {
    if (loaded.has(fontName)) return
    loaded.add(fontName)

    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  const names = extractFontNames(fontFamilies)
  names.forEach(loadFont)

  return { loadedFonts: names }
}
