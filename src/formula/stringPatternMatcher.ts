const defaultPresetPatterns: Record<string, RegExp | string> = {
  '+': '+',
  '*': '*',
}

export class StringPatternMatcher {
  maxToMatchI: number = 0
  private presetPatterns: Record<string, RegExp | string>

  constructor(
    public pattern: string,
    presetPatterns: Record<string, RegExp | string>,
  ) {
    this.presetPatterns = {
      ...presetPatterns,
      ...defaultPresetPatterns,
    }
  }

  match(toMatch: string, startIndex?: number) {
    this.maxToMatchI = 0
    const matched = this.doMatching(toMatch)

    return {
      matched,
      startIndex: startIndex,
      lastIndex: this.maxToMatchI,
      matchedStr: toMatch.slice(0, this.maxToMatchI)
    }
  }

  matchFirstSymbol(toMatch?: string): boolean {
    if (!toMatch || toMatch.length === 0) {
      return false
    }

    return isCharMatch(this.getFirstSymbolPattern(), toMatch[0])
  }

  private getFirstSymbolPattern() {
    const currentPattern: string | RegExp = this.pattern[0]

    if (currentPattern === '\\') {
      return this.presetPatterns[this.pattern[1]]
    }

    return currentPattern
  }

  private doMatching(
    toMatch: string,
    patternI: number = 0,
    toMatchI: number = 0,
  ): boolean {
    this.maxToMatchI = Math.max(toMatchI, this.maxToMatchI)
    if (this.pattern.length === patternI) {
      return true
    }

    const currentToMatch = toMatch[toMatchI] || ''
    let currentPattern: string | RegExp = this.pattern[patternI]
    let extraI = 0

    if (currentPattern === '\\') {
      extraI += 1

      currentPattern = this.presetPatterns[this.pattern[patternI + 1]]
    }

    if (this.pattern[patternI + extraI + 1] === '*') {
      return (
        (isCharMatch(currentPattern, currentToMatch) &&
          this.doMatching(toMatch, patternI, toMatchI + 1)) ||
        this.doMatching(toMatch, patternI + 2 + extraI, toMatchI)
      )
    }

    if (this.pattern[patternI + extraI + 1] === '+') {
      return (
        isCharMatch(currentPattern, currentToMatch) &&
        (this.doMatching(toMatch, patternI, toMatchI + 1) ||
          this.doMatching(toMatch, patternI + 2 + extraI, toMatchI + 1))
      )
    }

    if (isCharMatch(currentPattern, currentToMatch)) {
      return this.doMatching(toMatch, patternI + 1 + extraI, toMatchI + 1)
    }

    return false
  }
}

const isCharMatch = (charPattern: string | RegExp, toMatch: string) => {
  if (charPattern instanceof RegExp) {
    return charPattern.test(toMatch)
  }

  return charPattern === toMatch
}

