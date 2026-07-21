document.addEventListener('DOMContentLoaded', () => {

  /* ====================================================
   * 1. Header & Navigation (Scroll & Mobile Menu)
   * ==================================================== */
  const header = document.getElementById('main-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-item');

  // Floating Header Background on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  function toggleMobileMenu() {
    mobileToggle.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
    
    // Toggle icon shapes
    const spans = mobileToggle.querySelectorAll('span');
    if (mobileToggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    }
  }

  mobileToggle.addEventListener('click', toggleMobileMenu);

  // Close Mobile Menu on Link Click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileOverlay.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });


  /* ====================================================
   * 2. Scroll Reveal Animation (Intersection Observer)
   * ==================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ====================================================
   * 3. Brand Menu Tabs Interaction
   * ==================================================== */
  const tabButtons = document.querySelectorAll('.menu-tab-btn');
  const tabContents = document.querySelectorAll('.menu-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update button active state
      tabButtons.forEach(b => b.classList.toggle('active', b === btn));

      // Update content active state with smooth transition
      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.style.display = 'block';
          // Force reflow
          content.offsetHeight;
          content.classList.add('active');
        } else {
          content.classList.remove('active');
          content.style.display = 'none';
        }
      });
    });
  });


  /* ====================================================
   * 4. Interactive Estimate Simulator
   * ==================================================== */
  // Price Constants
  const PRICE_MAP = {
    desserts: {
      madeleine: 2800,
      financier: 3000,
      cookie: 0
    },
    package: 1500,
    tag: 500
  };

  // Recommended Presets (including detailed sub-flavors)
  const EVENT_PRESETS = {
    wedding: {
      desserts: { madeleine: 2, financier: 1, cookie: 1 },
      subFlavors: {
        'madeleine-lemon': 2,
        'financier-fig': 1,
        'cookie-vanilla': 1
      },
      pkg: 'mint',
      tag: 'custom',
      sets: 50
    },
    baby: {
      desserts: { madeleine: 1, financier: 1, cookie: 1 },
      subFlavors: {
        'madeleine-raspberry': 1,
        'financier-almond': 1,
        'cookie-raspberrycoconut': 1
      },
      pkg: 'pink',
      tag: 'custom',
      sets: 40
    },
    corporate: {
      desserts: { madeleine: 1, financier: 1, cookie: 0 },
      subFlavors: {
        'madeleine-choco': 1,
        'financier-cheese': 1
      },
      pkg: 'mint',
      tag: 'standard',
      sets: 100
    },
    etc: {
      desserts: { madeleine: 1, financier: 0, cookie: 2 },
      subFlavors: {
        'madeleine-earlgrey': 1,
        'cookie-choco': 1,
        'cookie-coffee': 1
      },
      pkg: 'cream',
      tag: 'none',
      sets: 20
    }
  };

  // State Management
  let simState = {
    event: 'wedding',
    desserts: {
      madeleine: 2,
      financier: 1,
      cookie: 1
    },
    subFlavors: {
      // madeleine sub-flavors
      'madeleine-choco': 0,
      'madeleine-matcha': 0,
      'madeleine-earlgrey': 0,
      'madeleine-lemon': 2,
      'madeleine-raspberry': 0,
      // financier sub-flavors
      'financier-fig': 1,
      'financier-almond': 0,
      'financier-cheese': 0,
      'financier-saltcaramel': 0,
      'financier-chocococonut': 0,
      'financier-matchawhite': 0,
      // cookie sub-flavors
      'cookie-choco': 0,
      'cookie-matcha': 0,
      'cookie-cheese': 0,
      'cookie-raspberrycoconut': 0,
      'cookie-vanilla': 1,
      'cookie-coffee': 0
    },
    pkg: 'mint',
    tag: 'custom',
    sets: 50
  };

  // DOM Elements
  const eventButtons = document.querySelectorAll('.event-options [data-event]');
  const pkgButtons = document.querySelectorAll('.package-options [data-pkg]');
  const tagButtons = document.querySelectorAll('.tag-options [data-tag]');
  const setsInput = document.getElementById('total-sets-input');
  
  const receiptEvent = document.getElementById('receipt-event');
  const receiptPackage = document.getElementById('receipt-package');
  const receiptTag = document.getElementById('receipt-tag');
  const receiptItemsContainer = document.getElementById('receipt-items');
  const pricePerSetEl = document.getElementById('price-per-set');
  const totalSetsEl = document.getElementById('receipt-total-sets');
  const discountRow = document.getElementById('receipt-discount-row');
  const discountValEl = document.getElementById('receipt-discount');
  const grandTotalEl = document.getElementById('grand-total');

  const inquirySetsSync = document.getElementById('sim-sets-sync');
  const selectedSummaryInput = document.getElementById('selected-summary');

  // Simulator Accordion Controls
  const accHeaders = document.querySelectorAll('.flavor-acc-header');
  accHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.flavor-acc-item');
      const isActive = item.classList.contains('active');
      
      // Close all accordions
      document.querySelectorAll('.flavor-acc-item').forEach(acc => acc.classList.remove('active'));
      
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Apply Event Preset
  function applyPreset(eventName) {
    const preset = EVENT_PRESETS[eventName];
    if (!preset) return;

    simState.event = eventName;
    simState.desserts = { ...preset.desserts };
    simState.pkg = preset.pkg;
    simState.tag = preset.tag;
    simState.sets = preset.sets;

    // Reset and sync sub-flavors
    Object.keys(simState.subFlavors).forEach(key => {
      simState.subFlavors[key] = preset.subFlavors[key] || 0;
    });

    // Sync HTML Controllers
    // 1. Event Active State
    eventButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-event') === eventName);
    });

    // 2. Category Quantities
    document.querySelectorAll('.dessert-row').forEach(row => {
      const name = row.getAttribute('data-name');
      row.querySelector('.qty-val').textContent = simState.desserts[name];
    });

    // 3. Sub-Flavor Quantities
    syncSubFlavorDOM();

    // 4. Package Active State
    pkgButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-pkg') === simState.pkg);
    });

    // 5. Tag Active State
    tagButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tag') === simState.tag);
    });

    // 6. Total Sets Input
    setsInput.value = simState.sets;

    calculateEstimate();
  }

  // Synchronize state value to Sub-flavor inputs & accordion labels
  function syncSubFlavorDOM() {
    const categories = ['madeleine', 'financier', 'cookie'];

    categories.forEach(cat => {
      const limit = simState.desserts[cat];
      const accItem = document.querySelector(`.flavor-acc-item[data-category="${cat}"]`);
      
      // Update Limit Labels
      accItem.querySelector('.acc-total-limit').textContent = limit;
      
      // Sum currently chosen sub-flavors of this category
      let currentSum = 0;
      const rows = accItem.querySelectorAll('.flavor-mix-row');
      rows.forEach(row => {
        const flvName = row.getAttribute('data-flavor');
        const count = simState.subFlavors[flvName] || 0;
        row.querySelector('.qty-sub-val').textContent = count;
        currentSum += count;
      });

      accItem.querySelector('.acc-current-sum').textContent = currentSum;

      // Enable/Disable plus buttons if limit reached
      rows.forEach(row => {
        const plusBtn = row.querySelector('.qty-sub-btn.plus');
        const minusBtn = row.querySelector('.qty-sub-btn.minus');
        const flvName = row.getAttribute('data-flavor');
        const count = simState.subFlavors[flvName] || 0;

        plusBtn.classList.toggle('disabled', currentSum >= limit);
        minusBtn.classList.toggle('disabled', count <= 0);
      });
    });
  }

  // Adjust sub-flavors if category limit is reduced
  function validateSubFlavors(category) {
    const limit = simState.desserts[category];
    const subKeys = Object.keys(simState.subFlavors).filter(k => k.startsWith(category));
    
    let sum = subKeys.reduce((acc, key) => acc + simState.subFlavors[key], 0);

    // If sum exceeds new limit, deduct count sequentially
    if (sum > limit) {
      let overage = sum - limit;
      for (let i = subKeys.length - 1; i >= 0; i--) {
        const key = subKeys[i];
        const count = simState.subFlavors[key];
        if (count > 0) {
          if (count >= overage) {
            simState.subFlavors[key] -= overage;
            break;
          } else {
            overage -= count;
            simState.subFlavors[key] = 0;
          }
        }
      }
    }
  }

  // Calculate & Update Receipt UI
  function calculateEstimate() {
    let setPrice = 0;
    
    // Dessert Costs
    const madeleineCost = simState.desserts.madeleine * PRICE_MAP.desserts.madeleine;
    const financierCost = simState.desserts.financier * PRICE_MAP.desserts.financier;
    const cookieCost = simState.desserts.cookie * PRICE_MAP.desserts.cookie;
    setPrice += madeleineCost + financierCost + cookieCost;

    // Package Box Cost
    setPrice += PRICE_MAP.package;

    // Message Tag Cost
    const hasTagCost = simState.tag !== 'none';
    const tagUnitCost = hasTagCost ? PRICE_MAP.tag : 0;
    setPrice += tagUnitCost;

    // Total Cost
    let rawTotal = setPrice * simState.sets;

    // Tag Discount (Free tags if sets >= 30)
    let discount = 0;
    const isDiscountEligible = simState.sets >= 30 && hasTagCost;
    if (isDiscountEligible) {
      discount = tagUnitCost * simState.sets;
    }

    const finalTotal = rawTotal - discount;

    // Update Receipt Labels
    const eventLabels = { wedding: '결혼식', baby: '돌잔치 / 백일', corporate: '기업 행사', etc: '생일 / 일반 감사' };
    receiptEvent.textContent = eventLabels[simState.event] || simState.event;

    const pkgLabels = { mint: '시그니처 민트 박스', pink: '로맨틱 핑크 박스', cream: '클래식 크림 박스' };
    receiptPackage.textContent = pkgLabels[simState.pkg] || simState.pkg;

    const tagLabels = { standard: '기본 Thank You 카드', custom: '성함 커스텀 태그', none: '카드 없음' };
    receiptTag.textContent = tagLabels[simState.tag] || simState.tag;

    // Dynamic Items list (Receipt)
    receiptItemsContainer.innerHTML = '';
    
    // Append Category line items with detailed subflavor breakdown
    if (simState.desserts.madeleine > 0) {
      appendCategoryReceiptItem('마들렌', 'madeleine', simState.desserts.madeleine, madeleineCost);
    }
    if (simState.desserts.financier > 0) {
      appendCategoryReceiptItem('휘낭시에', 'financier', simState.desserts.financier, financierCost);
    }
    if (simState.desserts.cookie > 0) {
      appendCategoryReceiptItem('사블레 쿠키', 'cookie', simState.desserts.cookie, cookieCost);
    }
    // Append Package Line
    appendReceiptItem('시그니처 상자', 1, PRICE_MAP.package);
    
    // Append Tag Line
    if (hasTagCost) {
      appendReceiptItem('메시지 카드/태그', 1, tagUnitCost);
    }

    // Set prices texts
    pricePerSetEl.textContent = `₩ ${setPrice.toLocaleString()}`;
    totalSetsEl.textContent = `${simState.sets} 세트`;

    // Discount
    if (isDiscountEligible) {
      discountRow.classList.add('active');
      discountValEl.textContent = `-₩ ${discount.toLocaleString()}`;
    } else {
      discountRow.classList.remove('active');
    }

    grandTotalEl.textContent = `₩ ${finalTotal.toLocaleString()}`;

    // Sync Form Fields
    inquirySetsSync.value = simState.sets;
    
    // Build custom summary description string
    const summaryParts = [];
    const categories = [
      { key: 'madeleine', label: '마들렌' },
      { key: 'financier', label: '휘낭시에' },
      { key: 'cookie', label: '사블레쿠키' }
    ];

    categories.forEach(cat => {
      const count = simState.desserts[cat.key];
      if (count > 0) {
        const details = getSubFlavorSummaryList(cat.key);
        const detailsStr = details.length > 0 ? `(${details.join(', ')})` : '(추천믹스)';
        summaryParts.push(`${cat.label} ${count}개${detailsStr}`);
      }
    });
    
    const pkgShortName = pkgLabels[simState.pkg].replace(' 박스', '');
    const tagShortName = simState.tag !== 'none' ? ` (${tagLabels[simState.tag]})` : '';
    selectedSummaryInput.value = `${summaryParts.join(' + ')} / ${pkgShortName}${tagShortName}`;
  }

  // Returns array of subflavor strings (e.g. ["레몬 2", "초코 1"])
  function getSubFlavorSummaryList(category) {
    const list = [];
    const nameMap = {
      // madeleine
      'choco': '초코', 'matcha': '말차', 'earlgrey': '얼그레이', 'lemon': '레몬', 'raspberry': '라즈베리',
      // financier
      'fig': '무화과', 'almond': '아몬드', 'cheese': '황치즈', 'saltcaramel': '카라멜솔티', 'chocococonut': '초코코코넛', 'matchawhite': '말차화이트',
      // cookie
      'choco': '초코', 'matcha': '말차', 'cheese': '황치즈', 'raspberrycoconut': '라즈베리코코넛', 'vanilla': '바닐라', 'coffee': '커피'
    };

    const subKeys = Object.keys(simState.subFlavors).filter(k => k.startsWith(category));
    subKeys.forEach(key => {
      const count = simState.subFlavors[key];
      if (count > 0) {
        const suffix = key.replace(`${category}-`, '');
        const koreanName = nameMap[suffix] || suffix;
        list.push(`${koreanName} ${count}`);
      }
    });

    return list;
  }

  // Render Category on Receipt with details inside parenthesis
  function appendCategoryReceiptItem(categoryLabel, categoryKey, totalQty, totalCost) {
    const details = getSubFlavorSummaryList(categoryKey);
    const subText = details.length > 0 ? ` (${details.join(', ')})` : ' (추천믹스)';
    
    const li = document.createElement('li');
    li.className = 'receipt-item-li';
    const costText = totalCost === 0 ? '기본 제공' : `₩ ${totalCost.toLocaleString()}`;
    li.innerHTML = `
      <span class="receipt-item-name">${categoryLabel} x${totalQty}${subText}</span>
      <span class="receipt-item-cost">${costText}</span>
    `;
    receiptItemsContainer.appendChild(li);
  }

  // Helper to append generic receipt line (package/tags)
  function appendReceiptItem(name, qty, cost) {
    const li = document.createElement('li');
    li.className = 'receipt-item-li';
    const costText = cost === 0 ? '기본 제공' : `₩ ${cost.toLocaleString()}`;
    li.innerHTML = `
      <span class="receipt-item-name">${name} x${qty}</span>
      <span class="receipt-item-cost">${costText}</span>
    `;
    receiptItemsContainer.appendChild(li);
  }

  // Event Listeners for Event Recommendations
  eventButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetEvent = btn.getAttribute('data-event');
      applyPreset(targetEvent);
    });
  });

  // Category +/- controllers
  document.querySelectorAll('.dessert-row').forEach(row => {
    const name = row.getAttribute('data-name');
    const minusBtn = row.querySelector('.qty-btn.minus');
    const plusBtn = row.querySelector('.qty-btn.plus');
    const qtyVal = row.querySelector('.qty-val');

    minusBtn.addEventListener('click', () => {
      if (simState.desserts[name] > 0) {
        simState.desserts[name]--;
        qtyVal.textContent = simState.desserts[name];
        
        // Adjust subflavors to fit new lower category limit
        validateSubFlavors(name);
        syncSubFlavorDOM();
        calculateEstimate();
      }
    });

    plusBtn.addEventListener('click', () => {
      if (simState.desserts[name] < 10) {
        simState.desserts[name]++;
        qtyVal.textContent = simState.desserts[name];
        
        syncSubFlavorDOM();
        calculateEstimate();
      }
    });
  });

  // Sub-Flavor +/- controllers (Flavor Customizer Panel)
  document.querySelectorAll('.flavor-mix-row').forEach(row => {
    const flvName = row.getAttribute('data-flavor');
    // Extract category name from sub flavor key (e.g., 'madeleine-choco' -> 'madeleine')
    const category = flvName.split('-')[0];
    const minusBtn = row.querySelector('.qty-sub-btn.minus');
    const plusBtn = row.querySelector('.qty-sub-btn.plus');

    minusBtn.addEventListener('click', () => {
      if (simState.subFlavors[flvName] > 0) {
        simState.subFlavors[flvName]--;
        syncSubFlavorDOM();
        calculateEstimate();
      }
    });

    plusBtn.addEventListener('click', () => {
      const limit = simState.desserts[category];
      const subKeys = Object.keys(simState.subFlavors).filter(k => k.startsWith(category));
      const currentSum = subKeys.reduce((acc, key) => acc + simState.subFlavors[key], 0);

      // Only allow increment if below current category total limit
      if (currentSum < limit) {
        simState.subFlavors[flvName]++;
        syncSubFlavorDOM();
        calculateEstimate();
      }
    });
  });

  // Package select
  pkgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      simState.pkg = btn.getAttribute('data-pkg');
      pkgButtons.forEach(b => b.classList.toggle('active', b === btn));
      calculateEstimate();
    });
  });

  // Message tag select
  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      simState.tag = btn.getAttribute('data-tag');
      tagButtons.forEach(b => b.classList.toggle('active', b === btn));
      calculateEstimate();
    });
  });

  // Sets Input handlers
  setsInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 10) {
      simState.sets = 10;
    } else {
      simState.sets = val;
    }
    calculateEstimate();
  });

  setsInput.addEventListener('blur', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 10) {
      e.target.value = 10;
      simState.sets = 10;
    } else if (val > 1000) {
      e.target.value = 1000;
      simState.sets = 1000;
    }
    calculateEstimate();
  });

  inquirySetsSync.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 10) {
      simState.sets = val;
      setsInput.value = val;
      calculateEstimate();
    }
  });

  /* ====================================================
   * 4-1. Visual Sweet Box Builder
   * ==================================================== */
  const builderRoot = document.getElementById('box-builder');
  if (builderRoot) {
    const builderProducts = [
      { id: 'm-choco', category: 'madeleine', name: '초코 마들렌', price: 2800, image: 'assets/products/madeleine-choco.webp', tone: '#765044' },
      { id: 'm-matcha', category: 'madeleine', name: '말차 마들렌', price: 2900, image: 'assets/products/madeleine-matcha.webp', tone: '#82916a' },
      { id: 'm-earlgrey', category: 'madeleine', name: '얼그레이 마들렌', price: 2800, image: 'assets/products/madeleine-earlgrey.webp', tone: '#c19b72' },
      { id: 'm-lemon', category: 'madeleine', name: '레몬 마들렌', price: 2800, image: 'assets/products/madeleine-lemon.webp', tone: '#e4b957' },
      { id: 'm-raspberry', category: 'madeleine', name: '라즈베리 마들렌', price: 2900, image: 'assets/products/madeleine-raspberry.webp', tone: '#d88989' },
      { id: 'f-fig', category: 'financier', name: '무화과 휘낭시에', price: 3200, image: 'assets/products/financier-fig.webp', tone: '#a16c4c' },
      { id: 'f-almond', category: 'financier', name: '아몬드 휘낭시에', price: 3000, image: 'assets/products/financier-almond.webp', tone: '#c6945f' },
      { id: 'f-cheese', category: 'financier', name: '황치즈 휘낭시에', price: 3100, image: 'assets/products/financier-cheese.webp', tone: '#d6a33d' },
      { id: 'f-caramel', category: 'financier', name: '카라멜솔티 휘낭시에', price: 3100, image: 'assets/products/financier-caramel.webp', tone: '#9d5f35' },
      { id: 'f-coconut', category: 'financier', name: '초코코코넛 휘낭시에', price: 3200, image: 'assets/products/financier-coconut.webp', tone: '#69483f' },
      { id: 'f-matcha', category: 'financier', name: '말차화이트초코 휘낭시에', price: 3200, image: 'assets/products/financier-matcha.webp', tone: '#718762' },
      { id: 'c-choco', category: 'cookie', name: '초코 사블레', price: 2200, image: 'assets/products/sable-choco.webp', tone: '#6e4b3c' },
      { id: 'c-matcha', category: 'cookie', name: '말차 사블레', price: 2300, image: 'assets/products/sable-matcha.webp', tone: '#75875d' },
      { id: 'c-cheese', category: 'cookie', name: '황치즈 사블레', price: 2300, image: 'assets/products/sable-cheese.webp', tone: '#d7a84e' },
      { id: 'c-raspberry', category: 'cookie', name: '라즈베리코코넛 사블레', price: 2400, image: 'assets/products/sable-raspberry.webp', tone: '#d28d91' },
      { id: 'c-vanilla', category: 'cookie', name: '바닐라 사블레', price: 2200, image: 'assets/products/sable-vanilla.webp', tone: '#d6bf98' },
      { id: 'c-coffee', category: 'cookie', name: '커피 사블레', price: 2300, image: 'assets/products/sable-coffee.webp', tone: '#80614c' }
    ];
    const builderState = { items: [], sets: 10, filter: 'all' };
    const productGrid = document.getElementById('builder-products');
    const slots = document.getElementById('gift-box-slots');
    const boxStage = builderRoot.querySelector('.gift-box-stage');
    const setQuantity = document.getElementById('builder-set-quantity');
    const won = value => `₩${value.toLocaleString('ko-KR')}`;

    function getBoxSpec(items) {
      const count = items.length;
      const categories = new Set(items.map(item => item.category));
      const onlyMadeleine = categories.size === 1 && categories.has('madeleine');
      const onlyFinancier = categories.size === 1 && categories.has('financier');
      const madeleineFinancierMix = categories.size === 2 && categories.has('madeleine') && categories.has('financier');
      let capacity = 3;
      let max = 12;
      let label = '빈 상자 · 3구';

      if (onlyMadeleine) {
        max = 5;
        capacity = count <= 3 ? 3 : 5;
        label = `마들렌 ${capacity}구`;
      } else if (onlyFinancier) {
        max = 6;
        capacity = count <= 3 ? 3 : count <= 4 ? 4 : 6;
        label = `휘낭시에 ${capacity}구`;
      } else if (madeleineFinancierMix) {
        max = 6;
        capacity = count <= 3 ? 3 : count <= 4 ? 4 : count <= 5 ? 5 : 6;
        label = `마들렌 · 휘낭시에 직사각 ${capacity}구`;
      } else if (categories.has('cookie')) {
        max = 12;
        capacity = count <= 3 ? 3 : count <= 4 ? 4 : count <= 6 ? 6 : count <= 8 ? 8 : 12;
        label = `믹스 선물상자 ${capacity}구`;
      }
      return { capacity, max, label };
    }

    function renderBuilderProducts() {
      const visible = builderProducts.filter(item => builderState.filter === 'all' || item.category === builderState.filter);
      productGrid.innerHTML = visible.map(item => `
        <button type="button" class="builder-product-card" data-product="${item.id}" style="--product-tone:${item.tone}">
          <span class="product-thumb"><img src="${item.image}" alt=""></span>
          <span class="product-copy"><b>${item.name}</b><small>${won(item.price)}</small></span>
          <span class="product-add">＋</span>
        </button>`).join('');
      productGrid.querySelectorAll('[data-product]').forEach(button => {
        button.addEventListener('click', () => {
          const nextItem = builderProducts.find(item => item.id === button.dataset.product);
          const nextItems = [...builderState.items, nextItem];
          const nextSpec = getBoxSpec(nextItems);
          if (nextItems.length > nextSpec.max) {
            builderRoot.classList.remove('box-full');
            void builderRoot.offsetWidth;
            builderRoot.classList.add('box-full');
            return;
          }
          builderState.items.push(nextItem);
          updateBuilder();
        });
      });
    }

    function updateBuilder() {
      const boxSpec = getBoxSpec(builderState.items);
      builderRoot.classList.toggle('has-products', builderState.items.length > 0);
      const categoryOrder = ['madeleine', 'financier', 'cookie'];
      const groupedItems = categoryOrder.map(category => ({
        category,
        items: builderState.items.map((item, index) => ({ item, index })).filter(entry => entry.item.category === category)
      })).filter(group => group.items.length);
      slots.innerHTML = groupedItems.map(group => `
        <div class="pastry-group group-${group.category} count-${group.items.length}" style="--group-weight:${group.items.length}">
          ${group.items.map(({ item, index }) => `
            <button type="button" class="filled-slot product-${item.category}" data-slot="${index}" aria-label="상자에서 제품 빼기" style="--product-tone:${item.tone}">
              <img src="${item.image}" alt="">
            </button>`).join('')}
        </div>`).join('');
      slots.className = `gift-box-slots capacity-${boxSpec.capacity} items-${builderState.items.length} groups-${groupedItems.length}${groupedItems.length > 1 ? ' is-mixed' : ' is-single'}`;
      boxStage.className = `gift-box-stage capacity-${boxSpec.capacity}`;
      slots.querySelectorAll('[data-slot]').forEach(slot => slot.addEventListener('click', () => {
        builderState.items.splice(Number(slot.dataset.slot), 1);
        updateBuilder();
      }));
      const itemTotal = builderState.items.reduce((sum, item) => sum + item.price, 0);
      const packagePrice = builderState.items.length ? 1500 : 0;
      const setPrice = itemTotal + packagePrice;
      const grandTotal = setPrice * builderState.sets;
      document.getElementById('box-count').textContent = builderState.items.length;
      document.getElementById('box-capacity').textContent = boxSpec.capacity;
      document.getElementById('box-format').textContent = boxSpec.label;
      document.getElementById('builder-item-count').textContent = `${builderState.items.length}개`;
      document.getElementById('builder-package-price').textContent = won(packagePrice);
      document.getElementById('builder-set-price').textContent = won(setPrice);
      document.getElementById('builder-grand-total').textContent = won(grandTotal);
      if (selectedSummaryInput) selectedSummaryInput.value = builderState.items.length
        ? `${builderState.items.map(item => item.name).join(', ')} / ${builderState.sets}세트 / 예상 ${won(grandTotal)}`
        : `제품 미선택 / ${builderState.sets}세트`;
      if (inquirySetsSync) inquirySetsSync.value = builderState.sets;
    }

    document.querySelectorAll('.lineup-tab').forEach(tab => tab.addEventListener('click', () => {
      builderState.filter = tab.dataset.filter;
      document.querySelectorAll('.lineup-tab').forEach(item => item.classList.toggle('active', item === tab));
      renderBuilderProducts();
    }));
    document.getElementById('box-reset').addEventListener('click', () => { builderState.items = []; updateBuilder(); });
    document.getElementById('sets-minus').addEventListener('click', () => { builderState.sets = Math.max(10, builderState.sets - 1); setQuantity.value = builderState.sets; updateBuilder(); });
    document.getElementById('sets-plus').addEventListener('click', () => { builderState.sets = Math.min(1000, builderState.sets + 1); setQuantity.value = builderState.sets; updateBuilder(); });
    setQuantity.addEventListener('input', () => { builderState.sets = Math.min(1000, Math.max(10, Number(setQuantity.value) || 10)); updateBuilder(); });
    setQuantity.addEventListener('blur', () => { setQuantity.value = builderState.sets; });
    renderBuilderProducts();
    updateBuilder();
  }

  /* ====================================================
   * 5. Contact Form Submission & Modal Dialog
   * ==================================================== */
  const inquiryForm = document.getElementById('inquiry-form');
  const successModal = document.getElementById('success-modal');
  const modalCloseBtn = successModal.querySelector('.modal-close-btn');
  const kakaoInquiryBtn = document.getElementById('kakao-inquiry-btn');

  // 실제 카카오톡 채널 URL이 등록되기 전 안내
  kakaoInquiryBtn?.addEventListener('click', (e) => {
    if (kakaoInquiryBtn.getAttribute('href') === '#') {
      e.preventDefault();
      alert('카카오톡 채널 링크를 준비 중입니다. 잠시 후 다시 이용해 주세요.');
    }
  });

  // Submit
  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = inquiryForm.querySelector('.btn-submit-form');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '신청을 접수하는 중...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      successModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      inquiryForm.reset();
      calculateEstimate();
    }, 1500);
  });

  modalCloseBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Initialize view
  applyPreset('wedding');
});
