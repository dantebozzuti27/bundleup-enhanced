/**
 * Spec Normalizer - ENHANCED VERSION
 * Comprehensive spec extraction with robust patterns
 * 
 * LOCATION: lib/spec-normalizer-enhanced.js
 * ACTION: Replace or extend your existing spec-normalizer.js
 */

class SpecNormalizerEnhanced {
  constructor() {
    this.patterns = this.initializePatterns();
  }

  initializePatterns() {
    return {
      // Display & Resolution
      resolution: [
        { regex: /8K|7680\s*[x×]\s*4320/i, value: '8K' },
        { regex: /4K|UHD|Ultra\s*HD|3840\s*[x×]\s*2160/i, value: '4K' },
        { regex: /QHD|1440p|2560\s*[x×]\s*1440/i, value: 'QHD' },
        { regex: /1080p|Full\s*HD|FHD|1920\s*[x×]\s*1080/i, value: '1080p' },
        { regex: /720p|HD|1280\s*[x×]\s*720/i, value: '720p' },
      ],
      
      refreshRate: [
        { regex: /(\d+)\s*Hz/i, capture: 1, type: 'number' },
        { regex: /(\d+)\s*hertz/i, capture: 1, type: 'number' },
      ],
      
      screenSize: [
        { regex: /(\d+(?:\.\d+)?)\s*["']?\s*(?:inch|in)/i, capture: 1, type: 'number' },
      ],

      // Connectivity
      hdmi: [
        { regex: /HDMI\s*(\d+\.\d+)/i, capture: 1, type: 'version' },
        { regex: /HDMI\s*(\d+)/i, capture: 1, type: 'version' },
        { regex: /HDMI\s*2\.1/i, value: '2.1' },
        { regex: /HDMI\s*2\.0/i, value: '2.0' },
      ],

      usb: [
        { regex: /USB-C|USB\s*C|Type-C/i, value: 'USB-C' },
        { regex: /USB\s*4/i, value: 'USB 4' },
        { regex: /USB\s*3\.2/i, value: 'USB 3.2' },
        { regex: /USB\s*3\.1/i, value: 'USB 3.1' },
        { regex: /USB\s*3\.0/i, value: 'USB 3.0' },
        { regex: /USB\s*2\.0/i, value: 'USB 2.0' },
        { regex: /Thunderbolt\s*(\d+)/i, capture: 1, prefix: 'Thunderbolt ' },
      ],

      bluetooth: [
        { regex: /Bluetooth\s*(\d+\.\d+)/i, capture: 1, type: 'version' },
        { regex: /BT\s*(\d+\.\d+)/i, capture: 1, type: 'version' },
        { regex: /Bluetooth\s*5\.3/i, value: '5.3' },
        { regex: /Bluetooth\s*5\.2/i, value: '5.2' },
        { regex: /Bluetooth\s*5\.1/i, value: '5.1' },
        { regex: /Bluetooth\s*5\.0/i, value: '5.0' },
      ],

      wifi: [
        { regex: /WiFi\s*7|Wi-Fi\s*7|802\.11be/i, value: 'WiFi 7' },
        { regex: /WiFi\s*6E|Wi-Fi\s*6E/i, value: 'WiFi 6E' },
        { regex: /WiFi\s*6|Wi-Fi\s*6|802\.11ax/i, value: 'WiFi 6' },
        { regex: /WiFi\s*5|Wi-Fi\s*5|802\.11ac/i, value: 'WiFi 5' },
        { regex: /802\.11n/i, value: 'WiFi 4' },
      ],

      // Audio
      channels: [
        { regex: /(\d+\.\d+)\s*(?:ch|channel)/i, capture: 1, type: 'channels' },
        { regex: /7\.1\.2/i, value: '7.1.2' },
        { regex: /7\.1/i, value: '7.1' },
        { regex: /5\.1\.2/i, value: '5.1.2' },
        { regex: /5\.1/i, value: '5.1' },
        { regex: /2\.1/i, value: '2.1' },
        { regex: /stereo|2\.0/i, value: '2.0' },
      ],

      impedance: [
        { regex: /(\d+)\s*(?:Ω|ohm|ohms)/i, capture: 1, type: 'number', unit: 'Ω' },
      ],

      frequency: [
        { regex: /(\d+)\s*(?:Hz|hertz)\s*-\s*(\d+)\s*(?:kHz|KHz)/i, captures: [1, 2], type: 'range' },
        { regex: /(\d+)\s*Hz\s*-\s*(\d+)\s*(?:kHz|KHz)/i, captures: [1, 2], type: 'range' },
      ],

      // Power
      power: [
        { regex: /(\d+)\s*(?:W|watt|watts)(?!\s*h)/i, capture: 1, type: 'number', unit: 'W' },
        { regex: /(\d+)\s*(?:watts|watt)\s*RMS/i, capture: 1, type: 'number', unit: 'W RMS' },
      ],

      voltage: [
        { regex: /(\d+)\s*(?:V|volt|volts)(?:\s*AC|\s*DC)?/i, capture: 1, type: 'number', unit: 'V' },
        { regex: /(\d+)-(\d+)\s*V/i, captures: [1, 2], type: 'range', unit: 'V' },
      ],

      // Storage & Memory
      storage: [
        { regex: /(\d+)\s*TB/i, capture: 1, multiplier: 1000, unit: 'GB' },
        { regex: /(\d+)\s*GB/i, capture: 1, type: 'number', unit: 'GB' },
        { regex: /(\d+)\s*MB/i, capture: 1, divider: 1000, unit: 'GB' },
      ],

      ram: [
        { regex: /(\d+)\s*GB\s*(?:RAM|Memory|DDR\d?)/i, capture: 1, type: 'number', unit: 'GB' },
        { regex: /DDR5-(\d+)/i, capture: 1, prefix: 'DDR5-' },
        { regex: /DDR4-(\d+)/i, capture: 1, prefix: 'DDR4-' },
      ],

      // Dimensions (for physical compatibility)
      dimensions: [
        { regex: /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:in|inch|"|cm)/i, 
          captures: [1, 2, 3], type: 'dimensions' },
      ],

      weight: [
        { regex: /(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)/i, capture: 1, type: 'number', unit: 'lbs' },
        { regex: /(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/i, capture: 1, multiplier: 2.205, unit: 'lbs' },
      ],
    };
  }

  /**
   * Normalize a single product's specs
   */
  async normalize(product) {
    const normalized = {};
    const text = `${product.title} ${product.description || ''}`;

    for (const [specType, patterns] of Object.entries(this.patterns)) {
      const value = this.extractSpec(text, patterns);
      if (value !== null) {
        normalized[specType] = value;
      }
    }

    return {
      ...product,
      normalized_specs: normalized,
      extraction_confidence: this.calculateConfidence(normalized),
    };
  }

  /**
   * Extract a spec value using pattern matching
   */
  extractSpec(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      
      if (match) {
        // Simple value
        if (pattern.value) {
          return pattern.value;
        }
        
        // Single capture
        if (pattern.capture && match[pattern.capture]) {
          let value = match[pattern.capture];
          
          if (pattern.type === 'number') {
            value = parseFloat(value);
            if (pattern.multiplier) value *= pattern.multiplier;
            if (pattern.divider) value /= pattern.divider;
          }
          
          if (pattern.prefix) value = pattern.prefix + value;
          if (pattern.unit) value = { value, unit: pattern.unit };
          
          return value;
        }
        
        // Multiple captures (ranges, dimensions)
        if (pattern.captures) {
          const values = pattern.captures.map(i => parseFloat(match[i]));
          
          if (pattern.type === 'range') {
            return { min: values[0], max: values[1], unit: pattern.unit };
          }
          
          if (pattern.type === 'dimensions') {
            return { width: values[0], height: values[1], depth: values[2] };
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Calculate extraction confidence
   */
  calculateConfidence(normalized) {
    const totalSpecs = Object.keys(this.patterns).length;
    const extractedSpecs = Object.keys(normalized).length;
    
    // Base confidence on extraction rate
    const baseConfidence = extractedSpecs / totalSpecs;
    
    // Boost for critical specs
    const criticalSpecs = ['resolution', 'hdmi', 'power', 'channels'];
    const hasCritical = criticalSpecs.filter(spec => normalized[spec]).length;
    const criticalBoost = hasCritical / criticalSpecs.length * 0.2;
    
    return Math.min(baseConfidence + criticalBoost, 1.0);
  }

  /**
   * Batch normalize multiple products
   */
  async batchNormalize(products) {
    return Promise.all(products.map(p => this.normalize(p)));
  }

  /**
   * Compare two normalized specs for compatibility
   */
  compareSpecs(specA, specB, specType) {
    const a = specA.normalized_specs?.[specType];
    const b = specB.normalized_specs?.[specType];

    if (!a || !b) return 'unknown';

    // Version comparison (HDMI, Bluetooth, etc.)
    if (typeof a === 'string' && typeof b === 'string') {
      const versionA = this.parseVersion(a);
      const versionB = this.parseVersion(b);
      
      if (versionA && versionB) {
        return versionA >= versionB ? 'compatible' : 'incompatible';
      }
    }

    // Number comparison
    if (typeof a === 'number' && typeof b === 'number') {
      return a === b ? 'compatible' : 'warning';
    }

    // Object comparison (ranges, dimensions)
    if (typeof a === 'object' && typeof b === 'object') {
      if (a.min !== undefined && b.min !== undefined) {
        // Range overlap check
        return (a.max >= b.min && b.max >= a.min) ? 'compatible' : 'incompatible';
      }
    }

    return 'unknown';
  }

  /**
   * Parse version string to comparable number
   */
  parseVersion(versionString) {
    const match = versionString.match(/(\d+)\.?(\d+)?/);
    if (!match) return null;
    
    const major = parseInt(match[1]);
    const minor = parseInt(match[2] || 0);
    return major * 10 + minor;
  }
}

export default SpecNormalizerEnhanced;
