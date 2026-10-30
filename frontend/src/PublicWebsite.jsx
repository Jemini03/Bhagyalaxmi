import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ConcreteCalculator from './ConcreteCalculator.jsx';
import OrderModal from './OrderModal.jsx';
import './App.css';

// Official Product & Grade Catalog 
const BROCHURE_PRODUCTS = [
  
  {
    id: 1,
    name: 'M10 Grade Plain Cement Concrete (PCC)',
    category: 'ORDINARY',
    categoryLabel: 'Ordinary Concrete (PCC)',
    classification: 'Ordinary',
    strength: '10 N/mm²',
    slump: '50 - 75 mm',
    description: 'Plain cement concrete (PCC) for leveling course under foundations, bedding for footing, sub-base flooring, and concrete pathways.',
    applications: 'Leveling course, bedding for footing, concrete roads, sub-flooring, trench beds',
    unit: 'm³',
    price: 3600,
    is_available: 1
  },
  {
    id: 2,
    name: 'M15 Grade Plain Cement Concrete (PCC)',
    category: 'ORDINARY',
    categoryLabel: 'Ordinary Concrete (PCC)',
    classification: 'Ordinary',
    strength: '15 N/mm²',
    slump: '50 - 80 mm',
    description: 'PCC leveling course under structural footings, mass concrete foundations, bedding, and farm/internal concrete roads.',
    applications: 'Leveling course, bedding for footing, concrete roads, mass foundation beds',
    unit: 'm³',
    price: 3850,
    is_available: 1
  },

  // Standard Concrete (RCC)
  {
    id: 3,
    name: 'M20 Grade Reinforced Concrete (RCC)',
    category: 'STANDARD',
    categoryLabel: 'Standard Concrete (RCC)',
    classification: 'Standard',
    strength: '20 N/mm²',
    slump: '100 - 120 mm',
    description: 'Reinforced cement concrete (RCC) engineered for mild exposure conditions: residential slabs, beams, columns, lintels, and footings.',
    applications: 'RCC slabs, beams, columns, footings etc. (for mild exposure, residential & light commercial)',
    unit: 'm³',
    price: 4200,
    is_available: 1
  },
  {
    id: 4,
    name: 'M25 Grade Reinforced Concrete (RCC)',
    category: 'STANDARD',
    categoryLabel: 'Standard Concrete (RCC)',
    classification: 'Standard',
    strength: '25 N/mm²',
    slump: '110 - 130 mm',
    description: 'High-strength structural mix conforming to IS 456 for multi-storey residential and commercial RCC frames, slabs, heavy beams, and columns.',
    applications: 'RCC slabs, beams, columns, footings, boundary walls, commercial buildings',
    unit: 'm³',
    price: 4550,
    is_available: 1
  },
  {
    id: 5,
    name: 'M30 Grade Reinforced Concrete (RCC)',
    category: 'STANDARD',
    categoryLabel: 'Standard Concrete (RCC)',
    classification: 'Standard',
    strength: '30 N/mm²',
    slump: '120 - 140 mm',
    description: 'Heavy structural design mix for high-load commercial basements, raft foundations, retaining walls, heavy columns, and water-retaining structures.',
    applications: 'RCC slabs, beams, columns, footings, raft foundations, water tanks, basements',
    unit: 'm³',
    price: 4900,
    is_available: 1
  },
  {
    id: 6,
    name: 'M35 Grade Heavy Structural Concrete (RCC)',
    category: 'STANDARD',
    categoryLabel: 'Standard Concrete (RCC)',
    classification: 'Standard',
    strength: '35 N/mm²',
    slump: '120 - 150 mm',
    description: 'High-performance design mix for bridge culverts, flyovers, industrial floorings, heavy equipment foundations, and critical infrastructure.',
    applications: 'RCC slabs, beams, columns, heavy industrial floors, bridge culverts, machine pads',
    unit: 'm³',
    price: 5250,
    is_available: 1
  },

  // Special Application Concretes 
  {
    id: 7,
    name: 'Fly Ash Concrete',
    category: 'SPECIAL',
    categoryLabel: 'Special Application',
    classification: 'Special Application',
    strength: '20 - 40 N/mm²',
    slump: '100 - 130 mm',
    description: 'A percentage of cement is replaced with high-grade processed fly ash. Enhances workability, reduces thermal cracking during mass pours, and provides long-term durability.',
    applications: 'Mass concrete pours, commercial rafts, thermal crack reduction, economical durable structures',
    unit: 'm³',
    price: 4350,
    is_available: 1
  },
  {
    id: 8,
    name: 'Early Strength Concrete',
    category: 'SPECIAL',
    categoryLabel: 'Special Application',
    classification: 'Special Application',
    strength: 'Rapid 1-3 Day Set',
    slump: '110 - 130 mm',
    description: 'Preferred for its early setting and rapid compressive strength gain. Engineered for fast-track construction that requires high initial strength for early formwork & shuttering removal.',
    applications: 'Fast-track projects, rapid formwork removal, road repair, quick-cycle slab casting',
    unit: 'm³',
    price: 4850,
    is_available: 1
  },
  {
    id: 9,
    name: 'Corrosion Resistant Concrete',
    category: 'SPECIAL',
    categoryLabel: 'Special Application',
    classification: 'Special Application',
    strength: '30 - 45 N/mm²',
    slump: '110 - 130 mm',
    description: 'Provides superior protection against corrosion of steel reinforcement. Eliminates the cost of precoating steel bars and concrete surfaces. Ideal for pile foundations, bridge piers across rivers/sea, and underground RCC.',
    applications: 'Pile foundations, bridge piers across rivers/sea, underground RCC, coastal structures',
    unit: 'm³',
    price: 5400,
    is_available: 1
  },
  {
    id: 10,
    name: 'Self Compacting Concrete (SCC)',
    category: 'SPECIAL',
    categoryLabel: 'Special Application',
    classification: 'Special Application',
    strength: '30 - 45 N/mm²',
    slump: 'Flow 600 - 750 mm',
    description: 'High fluidity and viscosity with extreme load carrying capacity. Enables faster construction, mirror surface finish, and easy placing with zero mechanical vibration. Manpower is greatly reduced (shuttering must be watertight).',
    applications: 'Congested rebar sections, architectural fair-face concrete, deep piles & columns without vibrators',
    unit: 'm³',
    price: 5850,
    is_available: 1
  },
  {
    id: 11,
    name: 'Fiber Reinforced Concrete (FRC)',
    category: 'SPECIAL',
    categoryLabel: 'Special Application',
    classification: 'Special Application',
    strength: '25 - 40 N/mm²',
    slump: '100 - 120 mm',
    description: 'Polypropylene fiber added concrete. Gives extra toughness to heavy industrial floors, bridges, and water-retaining structures. Improves resistance to plastic shrinkage cracking and replaces steel mesh for light/medium slabs on ground.',
    applications: 'Heavy industrial floors, warehouse pavements, bridge decks, water retaining structures, crack control',
    unit: 'm³',
    price: 5150,
    is_available: 1
  },
  {
    id: 12,
    name: 'Coloured Concrete',
    category: 'SPECIAL',
    categoryLabel: 'Special Application',
    classification: 'Special Application',
    strength: '20 - 30 N/mm²',
    slump: '90 - 110 mm',
    description: 'Wide variety of UV-stable integral colours and textured finishes. Premium aesthetic concrete for parking areas, pavements, footpaths, driveways, garden walkways, and architectural plazas.',
    applications: 'Parking areas, pavements, footpaths, driveways, gardens, landscape architecture',
    unit: 'm³',
    price: 5600,
    is_available: 1
  },
  {
    id: 13,
    name: 'Water-proof Concrete',
    category: 'SPECIAL',
    categoryLabel: 'Special Application',
    classification: 'Special Application',
    strength: '25 - 35 N/mm²',
    slump: '100 - 130 mm',
    description: 'Integral crystalline waterproof mix engineered to prevent water seepage and dampness. Ideal for roof terraces, basements, underground sumps, overhead water tanks, and water-contact structures.',
    applications: 'Terraces, basements, overhead water tanks, underground sumps, water-contact structures',
    unit: 'm³',
    price: 5300,
    is_available: 1
  },

  // Raw Materials & Logistics (Fleet Services)
  {
    id: 14,
    name: '10mm & 20mm Basalt Kapchi Haulage',
    category: 'TRANSPORT',
    categoryLabel: 'Aggregates & Transport',
    classification: 'Aggregates',
    strength: 'IS 383 Graded',
    slump: 'Crushed Stone',
    description: 'Clean, double-washed crushed black basalt aggregate for structural RCC. Sourced directly from certified South Gujarat quarries and dispatched via multi-axle tippers.',
    applications: 'Structural concrete batching, road sub-base, civil foundation works',
    unit: 'trip',
    price: 11500,
    is_available: 1
  },
  {
    id: 15,
    name: 'Washed River Sand & M-Sand (Zone II)',
    category: 'TRANSPORT',
    categoryLabel: 'Aggregates & Transport',
    classification: 'Aggregates',
    strength: 'Zone II Silt-Free',
    slump: 'Natural / M-Sand',
    description: 'High-purity washed river sand and uniform cubical manufactured sand (M-Sand) conforming to Zone II specifications for high compressive strength concrete.',
    applications: 'Structural RCC batching, brick masonry, fine wall plastering',
    unit: 'trip',
    price: 10800,
    is_available: 1
  },
  {
    id: 16,
    name: '36-Meter Mobile Concrete Boom Placer Service',
    category: 'TRANSPORT',
    categoryLabel: 'Aggregates & Transport',
    classification: 'Fleet Service',
    strength: '60 m³/hr Flow',
    slump: 'Hydraulic Placer',
    description: '36-meter high-reach hydraulic boom placer truck with certified operators. Rapid monolithic pour for high-rise slabs, deep basements, and congested urban sites.',
    applications: 'Multi-storey floor casting, deep basement rafts, congested site pours',
    unit: 'pour',
    price: 8500,
    is_available: 1
  }
];

// Concrete Technical Matrix conforming 
const CONCRETE_GRADES_MATRIX = [
  {
    classification: 'Ordinary',
    grade: 'M10',
    strength: '10 N/mm²',
    slump: '50 - 75 mm',
    mixType: 'PCC Design',
    usage: 'Leveling course under footings, bedding for foundations, concrete roads, trench bottoms'
  },
  {
    classification: 'Ordinary',
    grade: 'M15',
    strength: '15 N/mm²',
    slump: '50 - 80 mm',
    mixType: 'PCC Design',
    usage: 'Leveling course, footing bedding, pathway concrete, non-structural mass bedding'
  },
  {
    classification: 'Standard',
    grade: 'M20',
    strength: '20 N/mm²',
    slump: '100 - 120 mm',
    mixType: 'RCC Mix',
    usage: 'Single & double-storey residential slabs, beams, columns, lintels, footings (mild exposure)'
  },
  {
    classification: 'Standard',
    grade: 'M25',
    strength: '25 N/mm²',
    slump: '110 - 130 mm',
    mixType: 'RCC Design',
    usage: 'Multi-storey residential & commercial RCC frames, slabs, heavy beams, columns, footings'
  },
  {
    classification: 'Standard',
    grade: 'M30',
    strength: '30 N/mm²',
    slump: '120 - 140 mm',
    mixType: 'Heavy RCC',
    usage: 'Raft foundations, underground basements, water retaining tanks, high-load structural columns'
  },
  {
    classification: 'Standard',
    grade: 'M35',
    strength: '35 N/mm²',
    slump: '120 - 150 mm',
    mixType: 'Infrastructure',
    usage: 'Heavy industrial floorings, bridge culverts, flyover piers, high-abrasion truck roadways'
  },
  {
    classification: 'Special',
    grade: 'SCC',
    strength: '30 - 45 N/mm²',
    slump: 'Flow 600 - 750 mm',
    mixType: 'Self-Compacting',
    usage: 'Congested rebar sections, mirror-smooth fair face concrete, no vibration needed'
  },
  {
    classification: 'Special',
    grade: 'FRC',
    strength: '25 - 40 N/mm²',
    slump: '100 - 120 mm',
    mixType: 'Fiber Reinforced',
    usage: 'Heavy industrial warehouse floors, bridges, water retaining structures, crack control'
  },
  {
    classification: 'Special',
    grade: 'Waterproof',
    strength: '25 - 35 N/mm²',
    slump: '100 - 130 mm',
    mixType: 'Hydrophobic',
    usage: 'Roof terraces, basements, underground sumps, overhead water tanks, damp proofing'
  }
];


const REAL_PROJECTS = [
  {
    id: 'ricon',
    name: 'Ricon Industries',
    tag: 'Industrial Flooring',
    image: '/brochure/project-ricon-industries.jpg',
    secondaryImage: '/brochure/project-ricon-slab-top.jpg',
    location: 'Surat Industrial Belt',
    gradeUsed: 'M30 / Fiber Reinforced Concrete',
    description: 'Massive continuous industrial floor slab casting using laser screed, specialized fiber reinforced mix, and high-abrasion topping.'
  },
  {
    id: 'ambica',
    name: 'Ambica Business Hub',
    tag: 'Commercial Complex',
    image: 'brochure/verified_obj_54.jpg',
    location: 'Surat City',
    gradeUsed: 'M25 & M30 Structural RCC',
    description: 'Multi-storey commercial shopping and office complex with high-rise pumping, column casting, and monolithic slab pours.'
  },
  {
    id: 'gj-buildcone',
    name: 'GJ Buildcone - Vardoli',
    tag: 'Foundation & Night Pour',
    image: '/brochure/project-gj-buildcone-vardoli.jpg',
    location: 'Vardoli, Gujarat',
    gradeUsed: 'M25 Raft Design Mix',
    description: 'Continuous night pour for heavy foundation raft with dense rebar mesh, maintaining optimal hydration temperature and slump.'
  },
  {
    id: 'ecr',
    name: 'ECR Buildtech Private Limited',
    tag: 'Industrial Infrastructure',
    image: '/brochure/verified_obj_57.jpg',
    location: 'South Gujarat Corridor',
    gradeUsed: 'M30 & M35 High Strength',
    description: 'Heavy civil infrastructure casting with 36m mobile boom placer pumps and uninterrupted transit mixer dispatch from Dhamdod plant.'
  },
  {
    id: 'shiv',
    name: 'Shiv Construction',
    tag: 'Civil & Foundation',
    image: '/brochure/dct_obj_68_720x1280.jpg',
    location: 'Dhamdod / Mangrol Region',
    gradeUsed: 'M20 & M25 RCC',
    description: 'Deep footing excavation casting, structural retaining walls, and plinth columns executed with on-site slump testing.'
  },
  {
    id: 'gs-peb',
    name: 'GS PEB & Civil Private Limited',
    tag: 'PEB Civil Works',
    image: '/brochure/dct_obj_82_1179x1213.jpg',
    location: 'Surat Highway Corridor',
    gradeUsed: 'M25 & M30 Foundation Mix',
    description: 'Heavy pre-engineered building (PEB) foundation pedestals, anchor bolt embeds, and civil machine foundations.'
  }
];

const CURRENT_YEAR = new Date().getFullYear();

function PublicWebsite() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(BROCHURE_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('ALL'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProjectModal, setActiveProjectModal] = useState(null);


  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState('6');
  const [modalNotes, setModalNotes] = useState('');


  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5001/api/products');
        if (response.ok) {
          const data = await response.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            
            const enriched = data.map((item) => {
              const found = BROCHURE_PRODUCTS.find(
                (bp) =>
                  bp.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 5)) ||
                  item.name.toLowerCase().includes(bp.name.toLowerCase().slice(0, 5))
              );
              if (found) {
                return { ...found, ...item, category: found.category, categoryLabel: found.categoryLabel };
              }
              const n = item.name.toLowerCase();
              let cat = item.category === 'TRANSPORT' ? 'TRANSPORT' : 'STANDARD';
              let label = 'Standard Concrete (RCC)';
              if (n.includes('m10') || n.includes('m15') || n.includes('pcc')) {
                cat = 'ORDINARY';
                label = 'Ordinary Concrete (PCC)';
              } else if (n.includes('m20') || n.includes('m25') || n.includes('m30') || n.includes('m35')) {
                cat = 'STANDARD';
                label = 'Standard Concrete (RCC)';
              } else if (
                n.includes('scc') ||
                n.includes('compact') ||
                n.includes('fly ash') ||
                n.includes('water') ||
                n.includes('fiber') ||
                n.includes('early') ||
                n.includes('corrosion') ||
                n.includes('colour')
              ) {
                cat = 'SPECIAL';
                label = 'Special Application';
              }
              return { ...item, category: cat, categoryLabel: label };
            });
            setProducts(enriched);
          }
        }
      } catch {
       
      }
    }
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        activeCategory === 'ALL' ||
        prod.category === activeCategory ||
        (activeCategory === 'SPECIAL' && prod.category === 'RMC' && prod.classification === 'Special Application');

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        (prod.description && prod.description.toLowerCase().includes(q)) ||
        (prod.applications && prod.applications.toLowerCase().includes(q)) ||
        (prod.classification && prod.classification.toLowerCase().includes(q)) ||
        prod.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);


  const handleOpenOrder = (productToOrder, qty = '6', note = '') => {
    setModalProduct(productToOrder || products[2] || products[0]);
    setModalQuantity(qty);
    setModalNotes(note);
    setIsOrderModalOpen(true);
  };

  //  Calculator
  const handleCalculatorSelect = ({ gradeName, quantity, structureNote }) => {
    const matched =
      products.find((p) => p.name.toLowerCase().includes(gradeName.toLowerCase().slice(0, 3))) ||
      products.find((p) => p.category === 'STANDARD') ||
      products[2];

    handleOpenOrder(matched, quantity, structureNote);
  };

  return (
    <div className="app-container">
    
      
      {/* Main  Header */}
      <header className="navbar">
        <a href="#home" className="brand">
          <div className="brand-logo-mark">
            <span className="logo-letter">B</span>
          </div>
          <div className="brand-text-block">
            <span className="brand-title">BHAGYALAXMI RMC</span>
            <span className="brand-subtitle">STRENGTH IN EVERY MIX • READY MIX CONCRETE</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
          <a href="#advantages" onClick={() => setMobileMenuOpen(false)}> Advantages</a>
          <a href="#calculator" onClick={() => setMobileMenuOpen(false)}>Volume Calculator</a>
          <a href="#products" onClick={() => setMobileMenuOpen(false)}>Grades & Mixes</a>
          <a href="#quality" onClick={() => setMobileMenuOpen(false)}>Lab Testing</a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)}>Our Projects</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact & Plant</a>

          <div className="nav-actions-mobile">
           
            <button
              type="button"
              className="btn-book-pour"
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenOrder(products[2] || products[0]);
              }}
            >
              Book Pour Now
            </button>
            <button
              type="button"
              className="btn-admin-link"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/admin/login');
              }}
            >
              Plant Admin 🔒
            </button>
          </div>
        </nav>

        {/* Desktop Header Actions */}
        <div className="nav-desktop-actions">
          

          <button
            type="button"
            className="btn-header-order"
            onClick={() => handleOpenOrder(products[2] || products[0])}
          >
            <span>Book a Pour ↗</span>
          </button>

          <button
            type="button"
            className="btn-header-admin"
            onClick={() => navigate('/admin/login')}
            title="Dispatch & Admin Login"
          >
            Admin 🔒
          </button>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'is-active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section" id="home">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge-pill">
                <span className="badge-dot"></span>
                <span>BHAGYALAXMI RMC • DHAMDOD PLANT (SURAT)</span>
              </div>

              <h1 className="hero-headline">
                Strength in Every Mix.
                <br />
                <span className="headline-highlight">Ready-Mix Concrete</span>
                <br />
                Delivered 24/7 Across South Gujarat.
              </h1>

              <p className="hero-description">
                Committed to delivering certified, high-quality concrete solutions for industrial, commercial, residential, and infrastructure projects. Computerized weigh-batching, dedicated borewell water systems, and GPS-tracked BharatBenz transit mixers dispatched on time from our Dhamdod batching plant.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => handleOpenOrder(products[2] || products[0])}
                >
                  <span>Book Concrete Pour Now</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </button>

                <a href="#calculator" className="btn-hero-secondary">
                  <span>Concrete Volume Calculator (m³ / Brass)</span>
                </a>
              </div>

              {/* Plant Highlights */}
              <div className="hero-metrics-strip">
                <div className="metric-item">
                  <strong>2005</strong>
                  <span>Business Experience</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                  <strong>24 x 7</strong>
                  <span>Material Delivery</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                  <strong>100% GPS</strong>
                  <span>Transit Mixer Fleet</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                  <strong>Borewell Water</strong>
                  <span>Pure Mixing System</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                  <strong>On-Site Lab</strong>
                  <span>Cube & Slump Testing</span>
                </div>
              </div>
            </div>

           { /* Hero Visual Card: */}
            <div className="hero-visual-card">
              <div className="hero-visual-image-wrapper">
                <img
                  src="/brochure/site-mixer-stetter-pump.jpg"
                  alt="Bhagyalaxmi RMC BharatBenz transit mixer truck pumping concrete on site"
                  className="hero-main-photo"
                />
                
                <div className="badge-247-overlay">
                  <img
                    src="/brochure/badge-24-7.jpg"
                    alt="24/7 Service Guaranteed"
                    className="service-badge-img"
                  />
                  <span>24/7 Material Delivery & Service</span>
                </div>

                <div className="hero-fleet-card">
                  <span className="fleet-badge">BHARATBENZ FLEET</span>
                  <strong>Bhagyalaxmi RMC Transit Mixers</strong>
                  <p>Computerized batching with continuous slump retention and calibrated boom pumps.</p>
                </div>
              </div>

              <div className="visual-caption-banner">
                <div>
                  <strong>Bhagyalaxmi Batching Plant</strong>
                  <p>Block No. 395/2, Opp. Mahadev Hotel, Near Mahuvej Bridge, Dhamdod (Mangrol, Surat)</p>
                </div>
                <div className="hero-call-actions">
                  <a href="tel:+91982768798" className="btn-quick-call">
                    📞 98276 87981
                  </a>
                  <a
                    href="https://wa.me/98276 87981?text=Hello%20Bhagyalaxmi%20RMC,%20I%20want%20to%20order%20concrete."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-quick-wa"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  About Us */}
        <section className="about-section" id="about">
          <div className="section-head text-center">
            <span className="section-eyebrow">ABOUT BHAGYALAXMI RMC</span>
            <h2>Leading Ready-Mix Concrete Solutions in Gujarat</h2>
            <p className="section-lead-text">
              Bhagyalaxmi RMC is a leading ready-mix concrete manufacturer committed to delivering high-quality concrete solutions for industrial, commercial, residential, and infrastructure projects across South Gujarat.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-image-card">
              <img
                src="brochure/crane-construction-site.jpg"
                alt="Bhagyalaxmi RMC Batching Plant at Dhamdod with twin silos and mixer trucks"
                className="about-plant-img"
              />
              <div className="about-plant-caption">
                <strong>Our Dhamdod Batching Facility</strong>
                <span>Twin storage silos, automated aggregate bins, dedicated borewell water system & transit mixer fleet.</span>
              </div>
            </div>

            <div className="about-text-content">
              <div className="vm-card vision-card">
                <div className="vm-icon">🎯</div>
                <div className="vm-text">
                  <h3>Our Vision</h3>
                  <p>
                    "To become a trusted leader in ready mix concrete solutions."
                  </p>
                </div>
              </div>

              <div className="vm-card mission-card">
                <div className="vm-icon">🚀</div>
                <div className="vm-text">
                  <h3>Our Mission</h3>
                  <p>
                    "Deliver high quality concrete with reliable service and innovation. Build lasting relationship with our customer by safely delivering quality product with superior service."
                  </p>
                </div>
              </div>

              <div className="about-bullets">
                <div className="about-bullet-item">
                  <span className="bullet-chk">✓</span>
                  <div>
                    <strong>20+ Years Heritage (Since 2005)</strong>
                    <p>Deep experience in mix designs, site pouring dynamics, and local South Gujarat construction requirements.</p>
                  </div>
                </div>

                <div className="about-bullet-item">
                  <span className="bullet-chk">✓</span>
                  <div>
                    <strong>Strict IS 456 & IS 10262 Compliance</strong>
                    <p>Every single batch is engineered with calibrated weigh-batchers and verified for characteristic compressive strength.</p>
                  </div>
                </div>

                <div className="about-bullet-item">
                  <span className="bullet-chk">✓</span>
                  <div>
                    <strong>Dual Location Convenience</strong>
                    <p>Heavy batching plant at Dhamdod (near Mahuvej Bridge, Mangrol) + Central administrative office at Sarthana Jakatanaka, Surat.</p>
                  </div>
                </div>
              </div>

              <div className="about-cta-row">
                
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenOrder(products[2] || products[0])}
                >
                  Discuss Your Project With Us →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/*   Advantages  */}
        <section className="advantages-section" id="advantages">
          <div className="section-head text-center">
            <span className="section-eyebrow">KEY ADVANTAGES</span>
            <h2>Why Builders & Contractors Choose Bhagyalaxmi RMC</h2>
            <p>
              Direct advantages engineered to protect your structural integrity, prevent project delays, and maximize job site efficiency.
            </p>
          </div>

          <div className="advantages-grid">
            <div className="adv-card">
              <div className="adv-icon-box">🕒</div>
              <span className="adv-num">01</span>
              <h3>24 x 7 Material Delivery & Service</h3>
              <p>
                Round-the-clock batching and pour support. Whether you need an early-morning slab pour or a 500 m³ continuous night pour for an industrial raft foundation, our plant is active 24/7.
              </p>
              <div className="adv-tag">Continuous Pour Support</div>
            </div>

            <div className="adv-card">
              <div className="adv-icon-box">🛰️</div>
              <span className="adv-num">02</span>
              <h3>GPS Tracking for Punctual Commitments</h3>
              <p>
                Every transit mixer truck is fitted with real-time GPS tracking. We monitor dispatch cycles from our Dhamdod plant to your job site so concrete arrives strictly within its initial setting time.
              </p>
              <div className="adv-tag">Zero Site Idling</div>
            </div>

            <div className="adv-card">
              <div className="adv-icon-box">🏆</div>
              <span className="adv-num">03</span>
              <h3>Business Experience From 2005</h3>
              <p>
                Over 20 years of real field experience. We know local aggregates, temperature curing across seasons, and how to calibrate custom mixes that exceed structural design requirements.
              </p>
              <div className="adv-tag">20+ Years Domain Trust</div>
            </div>

            <div className="adv-card">
              <div className="adv-icon-box">💧</div>
              <span className="adv-num">04</span>
              <h3>Borewell Water Systems</h3>
              <p>
                Concrete strength depends directly on mixing water quality. Bhagyalaxmi RMC operates dedicated borewell water systems with zero chemical impurities or chlorides, ensuring maximum hydration and longevity.
              </p>
              <div className="adv-tag">Chloride-Free Pure Water</div>
            </div>

            <div className="adv-card highlight-card">
              <div className="adv-icon-box">🧪</div>
              <span className="adv-num">05</span>
              <h3>In-House & On-Site Quality Support</h3>
              <p>
                Quality control doesn't stop at the plant gate. Our technicians verify slump cone workability upon batching and at your construction site, casting 150mm test cubes for certified 7 and 28-day compression reports.
              </p>
              <div className="adv-tag">Lab & Site Cube Testing</div>
            </div>
          </div>
        </section>

        {/* Section 4: Concrete Volume & Brass Calculator */}
        <section className="calculator-section" id="calculator">
          <div className="section-head text-center">
            <span className="section-eyebrow">CONTRACTOR'S TOOLKIT</span>
            <h2>Estimate Your Concrete Volume & Mix Requirements</h2>
            <p>
              Avoid expensive site shortages or excess batching. Calculate exact cubic meters (m³), brass, transit mixer loads, and recommended concrete grades for your site.
            </p>
          </div>

          <div className="calculator-wrapper">
            <ConcreteCalculator onSelectForOrder={handleCalculatorSelect} />
          </div>
        </section>

        {/* Concrete Products & Specialized Mixes  */}
        <section className="products-catalogue-section" id="products">
          <div className="catalogue-head">
            <div>
              <span className="section-eyebrow">OFFICIAL PRODUCT CATALOGUE</span>
              <h2>Ready-Mix Concrete Grades & Special Mixes</h2>
              <p>
                Conforming to IS 456 & IS 10262 standards. Ordinary PCC, Standard RCC, and Special Application Concretes.
              </p>
            </div>

            <div className="catalogue-count-badge">
              <strong>{filteredProducts.length}</strong> PRODUCTS AVAILABLE
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="catalogue-toolbar-row">
            <div className="filter-pill-group" role="tablist">
              <button
                type="button"
                className={`filter-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCategory('ALL')}
              >
                All Products ({products.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${activeCategory === 'ORDINARY' ? 'active' : ''}`}
                onClick={() => setActiveCategory('ORDINARY')}
              >
                Ordinary (PCC)
              </button>
              <button
                type="button"
                className={`filter-pill ${activeCategory === 'STANDARD' ? 'active' : ''}`}
                onClick={() => setActiveCategory('STANDARD')}
              >
                Standard (RCC)
              </button>
              <button
                type="button"
                className={`filter-pill ${activeCategory === 'SPECIAL' ? 'active' : ''}`}
                onClick={() => setActiveCategory('SPECIAL')}
              >
                Special Application
              </button>
              <button
                type="button"
                className={`filter-pill ${activeCategory === 'TRANSPORT' ? 'active' : ''}`}
                onClick={() => setActiveCategory('TRANSPORT')}
              >
                Aggregates & Fleet
              </button>
            </div>

            <div className="search-bar-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                placeholder="Search grades (M20, M25), Waterproof, SCC, Kapchi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <article className="product-card" key={prod.id}>
                <div className="product-card-top">
                  <span className={`cat-tag cat-${(prod.category || 'rmc').toLowerCase()}`}>
                    {prod.categoryLabel || prod.category}
                  </span>

                  <span className="product-availability">
                    <span className="avail-dot"></span> Ready for Dispatch
                  </span>
                </div>

                <div className="product-header">
                  <div className="product-icon-box">
                    {prod.category === 'ORDINARY' && '🧱'}
                    {prod.category === 'STANDARD' && '🏢'}
                    {prod.category === 'SPECIAL' && '✨'}
                    {prod.category === 'TRANSPORT' && '🚛'}
                  </div>
                  <h3>{prod.name}</h3>
                </div>

                <p className="product-desc">
                  {prod.description}
                </p>

                {prod.applications && (
                  <div className="product-app-box">
                    <strong>Recommended For:</strong>
                    <span>{prod.applications}</span>
                  </div>
                )}

                <div className="product-spec-row">
                  {prod.strength && (
                    <div className="spec-item">
                      <span className="spec-lbl">Strength / Spec</span>
                      <span className="spec-val">{prod.strength}</span>
                    </div>
                  )}
                  {prod.slump && (
                    <div className="spec-item">
                      <span className="spec-lbl">Workability / Slump</span>
                      <span className="spec-val">{prod.slump}</span>
                    </div>
                  )}
                  <div className="spec-item">
                    <span className="spec-lbl">Unit</span>
                    <span className="spec-val">{prod.unit}</span>
                  </div>
                </div>

                <div className="product-card-footer">
                  <div className="price-block">
                    {prod.price != null ? (
                      <>
                        <span className="price-amount">
                          ₹{Number(prod.price).toLocaleString('en-IN')}
                        </span>
                        <span className="price-unit">per {prod.unit}</span>
                      </>
                    ) : (
                      <span className="price-amount price-quote">Quote on Request</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-order-card"
                    onClick={() => handleOpenOrder(prod)}
                  >
                    <span>Book Pour</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-catalog-box">
              <p>No products or mixes match "{searchQuery}".</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setActiveCategory('ALL');
                  setSearchQuery('');
                }}
              >
                View All Products
              </button>
            </div>
          )}
        </section>

       
        
        {/*  Quality Testing  */}
        <section className="quality-section" id="quality">
          <div className="section-head text-center">
            <span className="section-eyebrow">QUALITY TESTING & ASSURANCE</span>
            <h2>Certified Testing at Plant & On Your Job Site</h2>
            <p>
              Every cubic meter of Bhagyalaxmi RMC is batched under rigorous quality controls. We test raw materials, fresh concrete slump, and cube compressive strength with certified lab reports.
            </p>
          </div>

       
          <div className="quality-gallery-grid">
            <div className="quality-media-card">
              <img
                src="/brochure/dct_obj_33_1600x1200.jpg"
                alt="Digital Compression Testing Machine Peak Load Indicator at Bhagyalaxmi RMC"
              />
              <div className="quality-media-info">
                <h4>Digital Peak Load Compression Testing</h4>
                <p>Digital CTM measuring ultimate load and compressive strength (N/mm²) for 7-day and 28-day concrete cubes.</p>
              </div>
            </div>

            <div className="quality-media-card">
              <img
                src="/brochure/dct_obj_34_960x1280.jpg"
                alt="Slump cone test apparatus conducted by Bhagyalaxmi RMC lab technician"
              />
              <div className="quality-media-info">
                <h4>Slump Cone Workability Testing</h4>
                <p>Standard slump cone tamping verification conducted at the plant and re-verified on your site prior to discharge.</p>
              </div>
            </div>

            <div className="quality-media-card">
              <img
                src="/brochure/lab-slump-flow.jpg"
                alt="Slump flow measurement for high workability and self-compacting concrete"
              />
              <div className="quality-media-info">
                <h4>Slump Flow & Viscosity Check</h4>
                <p>Testing flowability for Self-Compacting Concrete (SCC) and pumpable mixes to guarantee zero honeycomb defects.</p>
              </div>
            </div>
          </div>

          {/* 4 Step Quality Workflow */}
          <div className="quality-steps-grid">
            <div className="quality-step-card">
              <div className="step-num">01</div>
              <h4>Raw Material Sieve Analysis</h4>
              <p>Basalt aggregate and sand are tested for silt content, flakiness index, and Zone II fineness modulus before entering silos.</p>
            </div>

            <div className="quality-step-card">
              <div className="step-num">02</div>
              <h4>Borewell Water & Electronic Dosing</h4>
              <p>Water-cement ratios are computer-controlled using pure borewell water and digital load cells for precise admixture dosing.</p>
            </div>

            <div className="quality-step-card">
              <div className="step-num">03</div>
              <h4>Double Slump Verification</h4>
              <p>Workability is measured immediately upon batching at the Dhamdod plant and confirmed on arrival at your construction site.</p>
            </div>

            <div className="quality-step-card">
              <div className="step-num">04</div>
              <h4>150mm Cube Compression Reports</h4>
              <p>Standard test cubes are sampled and water-cured. Official 7-day & 28-day compressive test reports are issued for your records.</p>
            </div>
          </div>
        </section>

        {/* Real Projects  */}
        <section className="projects-section" id="projects">
          <div className="section-head text-center">
            <span className="section-eyebrow">PROVEN TRACK RECORD</span>
            <h2>Our Projects Across Gujarat</h2>
            <p>
              A snapshot of prominent commercial hubs, industrial floorings, PEB structures, and heavy civil foundations powered by Bhagyalaxmi RMC.
            </p>
          </div>

          <div className="projects-grid">
            {REAL_PROJECTS.map((proj) => (
              <div
                className="project-card"
                key={proj.id}
                onClick={() => setActiveProjectModal(proj)}
              >
                <div className="project-image-box">
                  <img src={proj.image} alt={`${proj.name} project by Bhagyalaxmi RMC`} />
                  <span className="project-tag-pill">{proj.tag}</span>
                  <div className="project-overlay-zoom">🔍 Click to View Site Photo</div>
                </div>

                <div className="project-body">
                  <div className="project-loc">📍 {proj.location}</div>
                  <h3>{proj.name}</h3>
                  <div className="project-grade-pill">Mix: {proj.gradeUsed}</div>
                  <p>{proj.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Project Image  */}
          {activeProjectModal && (
            <div className="image-modal-backdrop" onClick={() => setActiveProjectModal(null)}>
              <div className="image-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="image-modal-close"
                  onClick={() => setActiveProjectModal(null)}
                >
                  &times;
                </button>
                <img
                  src={activeProjectModal.image}
                  alt={activeProjectModal.name}
                  className="modal-full-img"
                />
                <div className="modal-caption-bar">
                  <div>
                    <span className="badge badge-accent">{activeProjectModal.tag}</span>
                    <h3>{activeProjectModal.name}</h3>
                    <p>{activeProjectModal.description}</p>
                    <small>📍 {activeProjectModal.location} • Concrete Grade: {activeProjectModal.gradeUsed}</small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setActiveProjectModal(null);
                      handleOpenOrder(products[2] || products[0]);
                    }}
                  >
                    Enquire for Similar Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/*  Plant Location  */}
        <section className="contact-dispatch-section" id="contact">
          <div className="contact-grid">
            <div className="contact-info-pane">
              <span className="section-eyebrow">GET IN TOUCH</span>
              <h2>Contact Bhagyalaxmi RMC Today</h2>
              <p>
                Discuss your next project with our dispatch engineers and experience the difference that certified quality and punctual service make.
              </p>

              <div className="contact-details-list">
              
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <strong>BATCHING PLANT ADDRESS</strong>
                    <p>
                      Block No. 395/2, Opp. Mahadev Hotel, Near Mahuvej Bridge,
                      <br />
                      At Dhamdod, Ta. Mangrol, Dist. Surat, (Gujarat) 394125 India
                    </p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Mahuvej+Bridge+Dhamdod+Mangrol+Surat+394125"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      View Plant on Google Maps →
                    </a>
                  </div>
                </div>

            
                <div className="contact-item">
                  <span className="contact-icon">🏢</span>
                  <div>
                    <strong>HEAD OFFICE ADDRESS</strong>
                    <p>
                      C-10, Samrat Society, Nr. Shyamdham Temple,
                      <br />
                      Surat - Kamrej Road, Sarthana Jakatanaka, Surat, Gujarat
                    </p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Shyamdham+Temple+Sarthana+Jakatanaka+Surat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      View Office on Google Maps →
                    </a>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">☎</span>
                  <div>
                    <strong>DIRECT DISPATCH HOTLINES (24/7)</strong>
                    <div className="phone-cta-group">
                      <a href="tel:+919825495703" className="direct-phone-btn">
                        📞 +91 98254 95703
                      </a>
                      <a href="tel:+919979460201" className="direct-phone-btn">
                        📞 +91 99794 60201
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <strong>EMAIL ENQUIRIES</strong>
                    <p>
                      <a href="mailto:bhagyalaxmirmc76@gmail.com" className="email-link">
                        bhagyalaxmirmc76@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">⏰</span>
                  <div>
                    <strong>PLANT OPERATIONS & DISPATCH</strong>
                    <p>Monday – Sunday: 24 Hours Active (Night pours scheduled in advance)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action  */}
            <div className="contact-action-pane">
              <div className="contact-callout-box">
                <span className="badge badge-accent">INSTANT DISPATCH ACTION</span>
                <h3>Plan Your Concrete Pour Today</h3>
                <p>
                  Whether you need a single 6 m³ transit mixer for a home slab or 1,000 m³ for an industrial foundation, our dispatch team is ready.
                </p>

                <div className="callout-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-large"
                    onClick={() => handleOpenOrder(products[2] || products[0])}
                  >
                    Open Pour Booking Form →
                  </button>

                  

                
                </div>

                <div className="admin-access-note">
                  <span>Plant Officer or Dispatch Manager?</span>
                  <button
                    type="button"
                    className="btn-admin-text"
                    onClick={() => navigate('/admin/login')}
                  >
                    Sign into Plant Dashboard →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/*  Footer */}
      <footer className="footer-industrial">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <div className="brand footer-brand">
              <div className="brand-logo-mark">
                <span className="logo-letter">B</span>
              </div>
              <div className="brand-text-block">
                <span className="brand-title">BHAGYALAXMI RMC</span>
                <span className="brand-subtitle">STRENGTH IN EVERY MIX</span>
              </div>
            </div>
            <p className="footer-bio">
              Bhagyalaxmi RMC is a leading ready-mix concrete manufacturer committed to delivering high-quality concrete solutions for industrial, commercial, residential, and infrastructure projects across South Gujarat since 2005.
            </p>
            <div className="footer-direct-contacts">
              <a href="tel:+919825495703">☎ 98254 95703</a>
              <span>•</span>
              <a href="tel:+919979460201">99794 60201</a>
              <span>•</span>
              <a href="mailto:bhagyalaxmirmc76@gmail.com">bhagyalaxmirmc76@gmail.com</a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Concrete Grades</h4>
            <ul>
              <li><a href="#products">M10 & M15 (PCC Leveling)</a></li>
              <li><a href="#products">M20 (Residential Slabs)</a></li>
              <li><a href="#products">M25 (Structural RCC)</a></li>
              <li><a href="#products">M30 (Commercial Rafts)</a></li>
              <li><a href="#products">M35 (Heavy Infrastructure)</a></li>
              <li><a href="#calculator">Volume & Brass Calculator</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Special Concretes</h4>
            <ul>
              <li><a href="#products">Fly Ash Concrete</a></li>
              <li><a href="#products">Early Strength Concrete</a></li>
              <li><a href="#products">Corrosion Resistant Concrete</a></li>
              <li><a href="#products">Self Compacting Concrete (SCC)</a></li>
              <li><a href="#products">Fiber Reinforced Concrete (FRC)</a></li>
              <li><a href="#products">Water-proof Concrete</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Plant & Locations</h4>
            <ul>
              <li><a href="#contact">Dhamdod Plant (Mangrol, Surat)</a></li>
              <li><a href="#contact">Sarthana Office (Kamrej Road)</a></li>
              <li><a href="#quality">Lab Test Certificates</a></li>
              <li><a href="#projects">Our Completed Projects</a></li>
              <li><a href="/Bhagyalaxmi-RMC-Brochure.pdf" target="_blank" rel="noopener noreferrer">Download Brochure (PDF)</a></li>
              <li>
                <button
                  type="button"
                  className="footer-admin-btn"
                  onClick={() => navigate('/admin/login')}
                >
                  Admin Operations Portal 🔒
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {CURRENT_YEAR} Bhagyalaxmi RMC. All rights reserved. Registered in Dhamdod, Surat, Gujarat.</p>
          <div className="footer-badges">
            <span>IS 456 : 2000 Compliant</span>
            <span>•</span>
            <span>IS 10262 Mix Design</span>
            <span>•</span>
            <span>2005 - 2026 Two Decades of Trust</span>
          </div>
        </div>
      </footer>

      /* Booking Order Modal */
      {isOrderModalOpen && (
        <OrderModal
          product={modalProduct}
          availableProducts={products}
          initialQuantity={modalQuantity}
          initialNotes={modalNotes}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}
    </div>
  );
}

export default PublicWebsite;
