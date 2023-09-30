class TwoWayMap {
  constructor() {
    this.map = new Map();
    this.revMap = new Map();
  }

  set(key, value) {
    this.map.set(key, value);
    this.revMap.set(value, key);
  }

  delete(key) {
    if (!this.map.has(key)) return;
    const value = this.map.get(key);
    this.map.delete(key);
    this.revMap.delete(value);
  }

  has(key) {
    return this.map.has(key);
  }

  hasValue(value) {
    return this.revMap.has(value);
  }

  get(key) {
    return this.map.get(key);
  }

  getKey(value) {
    return this.revMap.get(value);
  }
}

module.exports = TwoWayMap;
