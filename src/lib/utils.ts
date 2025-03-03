export function gaussianRandom(mean: number, stdDev: number) {
    let u = 1 - Math.random();
    let v = 1 - Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return Math.round(mean + z * stdDev);
}

export function clamp(num: number, lower: number, upper: number) {
    return Math.min(Math.max(num, lower), upper);
}

export function rollDice(diceString: string): { total: number, rolls: number[] } {
    // Parse the dice string using a regular expression.
    const match = diceString.match(/^(\d+)d(\d+)$/);
    if (!match) {
      throw new Error("Invalid dice format. Use NdM, e.g. '3d6'.");
    }
    
    const count = Number(match[1]);
    const sides = Number(match[2]);
    let total = 0;
    const rolls: number[] = [];
    
    // Roll the dice 'count' times.
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    return { total, rolls };
  }
  