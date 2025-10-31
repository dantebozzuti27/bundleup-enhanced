/**
 * Compatibility Checker - ENHANCED VERSION
 * Comprehensive compatibility rules including cables, power, dimensions
 * 
 * LOCATION: lib/compatibility-checker-enhanced.js
 * ACTION: Replace your existing compatibility-checker.js
 */

class CompatibilityCheckerEnhanced {
  constructor() {
    this.rules = this.initializeRules();
  }

  initializeRules() {
    return [
      // HDMI Compatibility
      {
        id: 'hdmi_version',
        name: 'HDMI Version Compatibility',
        check: (productA, productB) => {
          const hdmiA = productA.normalized_specs?.hdmi;
          const hdmiB = productB.normalized_specs?.hdmi;
          
          if (!hdmiA || !hdmiB) return null;
          
          const versionA = parseFloat(hdmiA);
          const versionB = parseFloat(hdmiB);
          
          if (Math.min(versionA, versionB) < 2.0 && 
              productA.normalized_specs?.resolution === '4K') {
            return {
              status: 'ERROR',
              message: `HDMI version mismatch: ${productA.title} requires HDMI 2.0+ for 4K, but ${productB.title} has HDMI ${versionB}`,
              recommendation: 'Upgrade to HDMI 2.0 or higher for full 4K support',
            };
          }
          
          if (Math.min(versionA, versionB) < 2.1 && 
              productA.normalized_specs?.refreshRate > 60) {
            return {
              status: 'WARNING',
              message: `HDMI 2.1 recommended for ${productA.normalized_specs.refreshRate}Hz refresh rate`,
              recommendation: 'Consider HDMI 2.1 for best performance',
            };
          }
          
          return { status: 'PASS' };
        },
      },

      // Cable Requirements
      {
        id: 'hdmi_cable',
        name: 'HDMI Cable Requirements',
        check: (productA, productB) => {
          const hdmiA = productA.normalized_specs?.hdmi;
          const hdmiB = productB.normalized_specs?.hdmi;
          
          if (!hdmiA || !hdmiB) return null;
          
          const maxVersion = Math.max(parseFloat(hdmiA), parseFloat(hdmiB));
          
          if (maxVersion >= 2.1) {
            return {
              status: 'WARNING',
              message: 'HDMI 2.1 requires Ultra High Speed cables',
              recommendation: 'Purchase certified Ultra High Speed HDMI cables (48Gbps)',
            };
          }
          
          return { status: 'PASS' };
        },
      },

      // Speaker Impedance
      {
        id: 'impedance_match',
        name: 'Speaker Impedance Matching',
        check: (productA, productB) => {
          const impedanceA = productA.normalized_specs?.impedance;
          const impedanceB = productB.normalized_specs?.impedance;
          
          if (!impedanceA || !impedanceB) return null;
          
          const impA = typeof impedanceA === 'object' ? impedanceA.value : impedanceA;
          const impB = typeof impedanceB === 'object' ? impedanceB.value : impedanceB;
          
          if (impA !== impB) {
            return {
              status: 'WARNING',
              message: `Impedance mismatch: ${productA.title} (${impA}Ω) and ${productB.title} (${impB}Ω)`,
              recommendation: 'Ensure amplifier supports both impedances or match impedance ratings',
            };
          }
          
          return { status: 'PASS' };
        },
      },

      // Power Requirements
      {
        id: 'power_total',
        name: 'Total Power Consumption',
        check: (products) => {
          const totalPower = products.reduce((sum, p) => {
            const power = p.normalized_specs?.power;
            const watts = typeof power === 'object' ? power.value : power;
            return sum + (watts || 0);
          }, 0);
          
          // Typical household circuit: 15A @ 120V = 1800W
          const circuitLimit = 1800;
          const safeLimit = circuitLimit * 0.8; // 80% rule
          
          if (totalPower > safeLimit) {
            return {
              status: 'ERROR',
              message: `Total power consumption (${totalPower}W) exceeds safe circuit limit (${safeLimit}W)`,
              recommendation: 'Distribute devices across multiple circuits or reduce total power draw',
            };
          }
          
          if (totalPower > circuitLimit * 0.6) {
            return {
              status: 'WARNING',
              message: `Total power consumption (${totalPower}W) is high`,
              recommendation: 'Consider dedicated circuit or power management',
            };
          }
          
          return { status: 'PASS' };
        },
        collective: true, // Check all products together
      },

      // Physical Dimensions
      {
        id: 'physical_fit',
        name: 'Physical Compatibility',
        check: (productA, productB) => {
          const dimsA = productA.normalized_specs?.dimensions;
          const dimsB = productB.normalized_specs?.dimensions;
          
          if (!dimsA || !dimsB) return null;
          
          // Check if soundbar fits under TV
          if (productA.title.toLowerCase().includes('soundbar') && 
              productB.title.toLowerCase().includes('tv')) {
            const soundbarWidth = dimsA.width;
            const tvWidth = dimsB.width;
            
            if (soundbarWidth > tvWidth) {
              return {
                status: 'WARNING',
                message: `Soundbar width (${soundbarWidth}") exceeds TV width (${tvWidth}")`,
                recommendation: 'Soundbar will extend beyond TV edges',
              };
            }
          }
          
          return { status: 'PASS' };
        },
      },

      // WiFi Compatibility
      {
        id: 'wifi_compatibility',
        name: 'WiFi Network Compatibility',
        check: (productA, productB) => {
          const wifiA = productA.normalized_specs?.wifi;
          const wifiB = productB.normalized_specs?.wifi;
          
          if (!wifiA || !wifiB) return null;
          
          // Check if router supports device requirements
          if (wifiA === 'WiFi 6E' && wifiB !== 'WiFi 6E' && wifiB !== 'WiFi 7') {
            return {
              status: 'WARNING',
              message: `${productA.title} supports WiFi 6E but ${productB.title} only supports ${wifiB}`,
              recommendation: 'Device will work but won\'t utilize 6GHz band',
            };
          }
          
          return { status: 'PASS' };
        },
      },

      // Bluetooth Compatibility
      {
        id: 'bluetooth_compatibility',
        name: 'Bluetooth Compatibility',
        check: (productA, productB) => {
          const btA = productA.normalized_specs?.bluetooth;
          const btB = productB.normalized_specs?.bluetooth;
          
          if (!btA || !btB) return null;
          
          const versionA = parseFloat(btA);
          const versionB = parseFloat(btB);
          
          // Bluetooth is backward compatible
          if (Math.abs(versionA - versionB) > 2.0) {
            return {
              status: 'WARNING',
              message: `Large Bluetooth version gap: ${btA} and ${btB}`,
              recommendation: 'Devices will connect but may not support latest features',
            };
          }
          
          return { status: 'PASS' };
        },
      },

      // USB Compatibility
      {
        id: 'usb_compatibility',
        name: 'USB Compatibility',
        check: (productA, productB) => {
          const usbA = productA.normalized_specs?.usb;
          const usbB = productB.normalized_specs?.usb;
          
          if (!usbA || !usbB) return null;
          
          // Check for USB-C requirements
          if (usbA === 'USB-C' && !usbB.includes('USB-C')) {
            return {
              status: 'WARNING',
              message: `${productA.title} requires USB-C but ${productB.title} uses ${usbB}`,
              recommendation: 'Use USB-C adapter or different cable',
            };
          }
          
          return { status: 'PASS' };
        },
      },

      // Audio Channels
      {
        id: 'audio_channels',
        name: 'Audio Channel Configuration',
        check: (productA, productB) => {
          const channelsA = productA.normalized_specs?.channels;
          const channelsB = productB.normalized_specs?.channels;
          
          if (!channelsA || !channelsB) return null;
          
          // Check if receiver supports speaker configuration
          if (productA.title.toLowerCase().includes('receiver')) {
            const receiverChannels = parseFloat(channelsA);
            const speakerChannels = parseFloat(channelsB);
            
            if (speakerChannels > receiverChannels) {
              return {
                status: 'ERROR',
                message: `Receiver supports ${channelsA} but speakers require ${channelsB}`,
                recommendation: 'Upgrade receiver or reduce speaker configuration',
              };
            }
          }
          
          return { status: 'PASS' };
        },
      },

      // Resolution & Refresh Rate
      {
        id: 'resolution_refresh',
        name: 'Resolution & Refresh Rate Support',
        check: (productA, productB) => {
          const resA = productA.normalized_specs?.resolution;
          const refreshA = productA.normalized_specs?.refreshRate;
          const resB = productB.normalized_specs?.resolution;
          const refreshB = productB.normalized_specs?.refreshRate;
          
          if (!resA || !resB) return null;
          
          // Check if display supports source output
          const sourceIs4K = resA === '4K' || resA === '8K';
          const displayIs4K = resB === '4K' || resB === '8K';
          
          if (sourceIs4K && !displayIs4K) {
            return {
              status: 'WARNING',
              message: `Source outputs ${resA} but display only supports ${resB}`,
              recommendation: 'Display will downscale to native resolution',
            };
          }
          
          if (refreshA && refreshB && refreshA > refreshB) {
            return {
              status: 'WARNING',
              message: `Source outputs ${refreshA}Hz but display only supports ${refreshB}Hz`,
              recommendation: 'Display will limit refresh rate',
            };
          }
          
          return { status: 'PASS' };
        },
      },
    ];
  }

  /**
   * Check compatibility between all products
   */
  async checkCompatibility(products) {
    const results = {
      compatible: true,
      compatibilityScore: 1.0,
      issues: [],
      warnings: [],
      passes: [],
      checkedAt: new Date().toISOString(),
    };

    // Check pairwise compatibility
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        for (const rule of this.rules) {
          if (rule.collective) continue; // Skip collective rules in pairwise check
          
          const result = rule.check(products[i], products[j]);
          
          if (result && result.status !== 'PASS') {
            const entry = {
              rule: rule.name,
              productA: products[i].title,
              productB: products[j].title,
              issue: result.message,
              recommendation: result.recommendation,
            };
            
            if (result.status === 'ERROR') {
              results.issues.push(entry);
              results.compatible = false;
            } else if (result.status === 'WARNING') {
              results.warnings.push(entry);
            }
          } else if (result && result.status === 'PASS') {
            results.passes.push({ rule: rule.name });
          }
        }
      }
    }

    // Check collective rules (all products together)
    for (const rule of this.rules) {
      if (!rule.collective) continue;
      
      const result = rule.check(products);
      
      if (result && result.status !== 'PASS') {
        const entry = {
          rule: rule.name,
          issue: result.message,
          recommendation: result.recommendation,
        };
        
        if (result.status === 'ERROR') {
          results.issues.push(entry);
          results.compatible = false;
        } else if (result.status === 'WARNING') {
          results.warnings.push(entry);
        }
      } else if (result && result.status === 'PASS') {
        results.passes.push({ rule: rule.name });
      }
    }

    // Calculate compatibility score
    results.compatibilityScore = this.calculateScore(results);

    return results;
  }

  /**
   * Calculate overall compatibility score
   */
  calculateScore(results) {
    const totalChecks = results.issues.length + results.warnings.length + results.passes.length;
    if (totalChecks === 0) return 1.0;
    
    const passes = results.passes.length;
    const warnings = results.warnings.length;
    
    // Weight: PASS = 1.0, WARNING = 0.5, ERROR = 0.0
    const score = (passes + (warnings * 0.5)) / totalChecks;
    return Math.round(score * 100) / 100;
  }
}

export default CompatibilityCheckerEnhanced;
