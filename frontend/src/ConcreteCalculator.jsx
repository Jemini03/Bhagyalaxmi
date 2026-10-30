import React, { useState } from 'react';

function ConcreteCalculator({ onSelectForOrder }) {
  const [structureType, setStructureType] = useState('slab'); 
  const [unitSystem, setUnitSystem] = useState('meters'); 


  // Slab / Road inputs
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('8');
  const [thickness, setThickness] = useState('0.15'); 
  // Column inputs
  const [colLength, setColLength] = useState('0.3');
  const [colWidth, setColWidth] = useState('0.3'); 
  const [colHeight, setColHeight] = useState('3.0'); 
  const [colCount, setColCount] = useState('6');

  // Footing inputs
  const [footLength, setFootLength] = useState('1.5');
  const [footWidth, setFootWidth] = useState('1.5');
  const [footDepth, setFootDepth] = useState('0.45');
  const [footCount, setFootCount] = useState('6');

  // Calculations
  const calculateVolumeM3 = () => {
    let rawM3 = 0;
    const isM = unitSystem === 'meters';

    if (structureType === 'slab' || structureType === 'road' || structureType === 'waterproof') {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      const t = parseFloat(thickness) || 0;

      if (isM) {
        // l in m, w in m, t in m
        rawM3 = l * w * t;
      } else {
        // l in ft, w in ft, t in inches -> convert to cu ft -> convert to m³ (1 m³ = 35.3147 cu ft)
        const cuFt = l * w * (t / 12);
        rawM3 = cuFt / 35.3147;
      }
    } else if (structureType === 'column') {
      const l = parseFloat(colLength) || 0;
      const w = parseFloat(colWidth) || 0;
      const h = parseFloat(colHeight) || 0;
      const count = parseInt(colCount, 10) || 0;

      if (isM) {
        rawM3 = l * w * h * count;
      } else {
        const cuFt = (l / 12) * (w / 12) * h * count;
        rawM3 = cuFt / 35.3147;
      }
    } else if (structureType === 'footing') {
      const l = parseFloat(footLength) || 0;
      const w = parseFloat(footWidth) || 0;
      const d = parseFloat(footDepth) || 0;
      const count = parseInt(footCount, 10) || 0;

      if (isM) {
        rawM3 = l * w * d * count;
      } else {
        const cuFt = l * w * (d / 12) * count;
        rawM3 = cuFt / 35.3147;
      }
    }

    return Math.max(0, rawM3);
  };

  const volumeM3 = calculateVolumeM3();
  const volumeCuFt = volumeM3 * 35.3147;
  // Standard transit mixer drum capacity: 6 m³
  const transitMixersNeeded = volumeM3 > 0 ? Math.ceil(volumeM3 / 6) : 0;

  // Recommended grades
  const getRecommendation = () => {
    switch (structureType) {
      case 'slab':
        return {
          grade: 'M25 Grade Structural Concrete',
          strength: '25 N/mm²',
          slump: '100 - 120 mm (Pumpable)',
          description: 'Optimal compressive strength & crack resistance for residential and commercial RCC slabs.'
        };
      case 'column':
        return {
          grade: 'M30 Grade Reinforced Concrete',
          strength: '30 N/mm²',
          slump: '110 - 130 mm',
          description: 'High vertical load-bearing capacity for columns, lift shafts and shear walls.'
        };
      case 'footing':
        return {
          grade: 'M25 Grade Structural Concrete',
          strength: '25 N/mm²',
          slump: '80 - 100 mm',
          description: 'Heavy foundation and raft support protecting reinforcement from soil moisture.'
        };
      case 'road':
        return {
          grade: 'M35 Grade Heavy Infrastructure Concrete',
          strength: '35 N/mm²',
          slump: '40 - 60 mm (Pavement Quality)',
          description: 'Abrasion-resistant, heavy axle vehicle load bearing for internal concrete roads & loading bays.'
        };
      case 'waterproof':
        return {
          grade: 'Water-Proof Concrete (Integral Hydrophobic)',
          strength: '25 - 30 N/mm²',
          slump: '110 - 130 mm',
          description: 'Crystalline waterproof mix for terraces, basements, water tanks, retaining walls and damp prevention.'
        };
      default:
        return {
          grade: 'M25 Grade Structural Concrete',
          strength: '25 N/mm²',
          slump: '100 - 120 mm',
          description: 'Standard structural ready-mix concrete.'
        };
    }
  };

  const rec = getRecommendation();

  const handleOrderTransfer = () => {
    if (onSelectForOrder) {
      onSelectForOrder({
        gradeName: rec.grade,
        quantity: volumeM3.toFixed(2),
        structureNote: `${structureType.toUpperCase()} pour (${volumeM3.toFixed(2)} m³ calculated)`,
        mixers: transitMixersNeeded
      });
    }
  };

  return (
    <div className="calculator-card">
      <div className="calculator-header">
        <div className="calc-title-group">
          <span className="badge badge-accent">SMART SITE TOOL</span>
          <h3>Concrete Volume & Fleet Estimator</h3>
          <p>
            Estimate accurate ready-mix concrete volume (m³), transit mixer truck loads, and optimal mix grade for your site.
          </p>
        </div>

        <div className="calc-unit-toggle" role="group" aria-label="Unit System">
          <button
            type="button"
            className={`unit-toggle-btn ${unitSystem === 'meters' ? 'active' : ''}`}
            onClick={() => setUnitSystem('meters')}
          >
            Meters (m)
          </button>
          <button
            type="button"
            className={`unit-toggle-btn ${unitSystem === 'feet' ? 'active' : ''}`}
            onClick={() => setUnitSystem('feet')}
          >
            Feet & Inches
          </button>
        </div>
      </div>

      {/* Structure Type Navigation Tabs */}
      <div className="calc-type-tabs">
        <button
          type="button"
          className={`calc-type-btn ${structureType === 'slab' ? 'active' : ''}`}
          onClick={() => setStructureType('slab')}
        >
          <span className="calc-icon">🏢</span> Slab / Roof Cast
        </button>
        <button
          type="button"
          className={`calc-type-btn ${structureType === 'column' ? 'active' : ''}`}
          onClick={() => setStructureType('column')}
        >
          <span className="calc-icon">🏛️</span> Columns / Pillars
        </button>
        <button
          type="button"
          className={`calc-type-btn ${structureType === 'footing' ? 'active' : ''}`}
          onClick={() => setStructureType('footing')}
        >
          <span className="calc-icon">🏗️</span> Footing / Raft
        </button>
        <button
          type="button"
          className={`calc-type-btn ${structureType === 'road' ? 'active' : ''}`}
          onClick={() => setStructureType('road')}
        >
          <span className="calc-icon">🛣️</span> Road / Floor
        </button>
        <button
          type="button"
          className={`calc-type-btn ${structureType === 'waterproof' ? 'active' : ''}`}
          onClick={() => setStructureType('waterproof')}
        >
          <span className="calc-icon">💧</span> Terrace / Tank
        </button>
      </div>

      <div className="calc-body-grid">
        {/* Form Inputs */}
        <div className="calc-inputs-pane">
          {(structureType === 'slab' || structureType === 'road' || structureType === 'waterproof') && (
            <div className="calc-form-grid">
              <label>
                Length {unitSystem === 'meters' ? '(meters)' : '(feet)'}
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder={unitSystem === 'meters' ? 'e.g. 12.5' : 'e.g. 40'}
                />
              </label>

              <label>
                Width {unitSystem === 'meters' ? '(meters)' : '(feet)'}
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder={unitSystem === 'meters' ? 'e.g. 8.0' : 'e.g. 26'}
                />
              </label>

              <label>
                Thickness {unitSystem === 'meters' ? '(meters, e.g. 0.15 = 150mm)' : '(inches, e.g. 5 or 6)'}
                <input
                  type="number"
                  step={unitSystem === 'meters' ? '0.01' : '0.5'}
                  min="0.01"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  placeholder={unitSystem === 'meters' ? '0.15' : '6'}
                />
              </label>
            </div>
          )}

          {structureType === 'column' && (
            <div className="calc-form-grid">
              <label>
                Column Breadth {unitSystem === 'meters' ? '(meters)' : '(inches)'}
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={colLength}
                  onChange={(e) => setColLength(e.target.value)}
                  placeholder={unitSystem === 'meters' ? '0.30' : '12'}
                />
              </label>

              <label>
                Column Depth {unitSystem === 'meters' ? '(meters)' : '(inches)'}
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={colWidth}
                  onChange={(e) => setColWidth(e.target.value)}
                  placeholder={unitSystem === 'meters' ? '0.30' : '12'}
                />
              </label>

              <label>
                Column Height {unitSystem === 'meters' ? '(meters)' : '(feet)'}
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={colHeight}
                  onChange={(e) => setColHeight(e.target.value)}
                  placeholder={unitSystem === 'meters' ? '3.0' : '10'}
                />
              </label>

              <label>
                Number of Columns
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={colCount}
                  onChange={(e) => setColCount(e.target.value)}
                  placeholder="e.g. 8"
                />
              </label>
            </div>
          )}

          {structureType === 'footing' && (
            <div className="calc-form-grid">
              <label>
                Footing Length {unitSystem === 'meters' ? '(meters)' : '(feet)'}
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={footLength}
                  onChange={(e) => setFootLength(e.target.value)}
                  placeholder={unitSystem === 'meters' ? '1.5' : '5'}
                />
              </label>

              <label>
                Footing Width {unitSystem === 'meters' ? '(meters)' : '(feet)'}
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={footWidth}
                  onChange={(e) => setFootWidth(e.target.value)}
                  placeholder={unitSystem === 'meters' ? '1.5' : '5'}
                />
              </label>

              <label>
                Depth / Thickness {unitSystem === 'meters' ? '(meters)' : '(inches)'}
                <input
                  type="number"
                  step={unitSystem === 'meters' ? '0.05' : '1'}
                  min="0.05"
                  value={footDepth}
                  onChange={(e) => setFootDepth(e.target.value)}
                  placeholder={unitSystem === 'meters' ? '0.45' : '18'}
                />
              </label>

              <label>
                Number of Footings
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={footCount}
                  onChange={(e) => setFootCount(e.target.value)}
                  placeholder="e.g. 6"
                />
              </label>
            </div>
          )}

          
        </div>

        {/* Calculation Result Preview Box */}
        <div className="calc-results-pane">
          <div className="results-badge">ENGINEER ESTIMATION</div>
          
          <div className="results-volume-display">
            <div className="volume-main">
              <span className="volume-num">{volumeM3.toFixed(2)}</span>
              <span className="volume-unit">m³ (Cubic Meters)</span>
            </div>
            <div className="volume-sub">
              ≈ <strong>{volumeCuFt.toFixed(1)}</strong> cu. ft • <strong>{(volumeCuFt / 100).toFixed(2)}</strong> Brass
            </div>
          </div>

          <div className="results-stats-row">
  <div className="stat-pill">
    <span className="stat-label">Estimated Mixer Loads</span>
    <span className="stat-val">{transitMixersNeeded} Loads</span>
  </div>
</div>

          <div className="results-rec-box">
  <div className="rec-badge">CONCRETE GRADE</div>
  <h4>Confirm your required grade</h4>
  <p>
    Select the concrete grade specified by your project engineer.
    Our team can confirm product availability and delivery details
    before your order is placed.
  </p>
</div>

          <button
            type="button"
            className="calc-order-cta"
            onClick={handleOrderTransfer}
          >
            <span>Proceed to Order {volumeM3.toFixed(2)} m³</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConcreteCalculator;
