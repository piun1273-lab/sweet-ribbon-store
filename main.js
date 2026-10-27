document.addEventListener('DOMContentLoaded', () => {

  /* ====================================================
   * 1. Header & Navigation (Scroll & Mobile Menu)
   * ==================================================== */
  const header = document.getElementById('main-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-item');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  function toggleMobileMenu() {
    mobileToggle?.classList.toggle('active');
    mobileOverlay?.classList.toggle('active');
    document.body.style.overflow = mobileOverlay?.classList.contains('active') ? 'hidden' : '';
    
    const spans = mobileToggle?.querySelectorAll('span');
    if (spans && spans.length >= 3) {
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
  }

  mobileToggle?.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileOverlay?.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  /* ====================================================
   * 2. Scroll Reveal Animation
   * ==================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ====================================================
   * 3. Brand Menu Tabs Interaction
   * ==================================================== */
  const tabButtons = document.querySelectorAll('.menu-tab-btn');
  const tabContents = document.querySelectorAll('.menu-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.toggle('active', b === btn));
      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.style.display = 'block';
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
   * 4. Interactive Estimate Simulator & Box Builder (마들렌 한 줄 최대 5개 규칙 적용)
   * ==================================================== */
  const inquirySetsSync = document.getElementById('sim-sets-sync');
  const selectedSummaryInput = document.getElementById('selected-summary');
  const inquiryForm = document.getElementById('inquiry-form');
  const successModal = document.getElementById('success-modal');
  const modalCloseBtn = successModal?.querySelector('.modal-close-btn');
  const kakaoInquiryBtn = document.getElementById('kakao-inquiry-btn');

  kakaoInquiryBtn?.addEventListener('click', (e) => {
    if (kakaoInquiryBtn.getAttribute('href') === '#') {
      e.preventDefault();
      alert('카카오톡 채널 링크를 준비 중입니다. 잠시 후 다시 이용해 주세요.');
    }
  });

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
      const capacity = count === 0 ? 0 : Math.ceil(count / 5) * 5;
      return { capacity, max: 12, label: `선물상자 (${count}개 담김)` };
    }

    function renderBuilderProducts() {
      if (!productGrid) return;
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
          if (nextItem) {
            if (builderState.items.length >= getBoxSpec(builderState.items).max) { builderRoot.classList.add('box-full'); return; } builderRoot.classList.remove('box-full'); builderState.items.push(nextItem);
            updateBuilder();
          }
        });
      });
    }

    function updateBuilder() {
      const boxSpec = getBoxSpec(builderState.items);
      builderRoot.classList.toggle('has-products', builderState.items.length > 0);
      
      if (slots) {
        // 한 줄에 최대 5개, 6개부터는 아랫줄(2단)로 떨어지도록 그리드 레이아웃 적용
        slots.innerHTML = builderState.items.map((item, index) => `
          <button type="button" class="filled-slot gift-item product-${item.category}" data-slot="${index}" aria-label="상자에서 제품 빼기" style="--product-tone:${item.tone};grid-row:${Math.floor(index / 5) + 1};grid-column:${(index % 5) + 1 + (index >= builderState.items.length - (builderState.items.length % 5 || 5) ? Math.floor((5 - (builderState.items.length % 5 || 5)) / 2) : 0)};">
            <img src="${item.image}" alt="${item.name}">
          </button>`).join('');

        // 5개 초과 시 자동으로 2단 줄바꿈이 되도록 클래스 제어
        const isTwoRows = builderState.items.length > 5;
        slots.className = `gift-box-slots items-${builderState.items.length} ${isTwoRows ? 'two-rows' : 'one-row'}`;
        
        slots.querySelectorAll('[data-slot]').forEach(slot => {
          slot.addEventListener('click', () => {
            builderState.items.splice(Number(slot.dataset.slot), 1);
            updateBuilder();
          });
        });
      }

      if (boxStage) {
        boxStage.className = `gift-box-stage item-count-${builderState.items.length}`;
        const boxWidth = builderState.items.length === 0 ? 45 : Math.min(100, 35 + Math.min(builderState.items.length, 5) * 11 + Math.max(0, builderState.items.length - 5) * 3);
        boxStage.style.width = `${boxWidth}%`;
      }

      const itemTotal = builderState.items.reduce((sum, item) => sum + item.price, 0);
      const packagePrice = builderState.items.length ? 1500 : 0;
      const setPrice = itemTotal + packagePrice;
      const grandTotal = setPrice * builderState.sets;

      const boxCountEl = document.getElementById('box-count');
      const boxCapacityEl = document.getElementById('box-capacity');
      const boxFormatEl = document.getElementById('box-format');
      const builderItemCountEl = document.getElementById('builder-item-count');
      const builderPackagePriceEl = document.getElementById('builder-package-price');
      const builderSetPriceEl = document.getElementById('builder-set-price');
      const builderGrandTotalEl = document.getElementById('builder-grand-total');

      if (boxCountEl) boxCountEl.textContent = builderState.items.length;
      if (boxCapacityEl) boxCapacityEl.textContent = builderState.items.length;
      if (boxFormatEl) boxFormatEl.textContent = boxSpec.label;
      if (builderItemCountEl) builderItemCountEl.textContent = `${builderState.items.length}개`;
      if (builderPackagePriceEl) builderPackagePriceEl.textContent = won(packagePrice);
      if (builderSetPriceEl) builderSetPriceEl.textContent = won(setPrice);
      if (builderGrandTotalEl) builderGrandTotalEl.textContent = won(grandTotal);

      if (selectedSummaryInput) {
        selectedSummaryInput.value = builderState.items.length
          ? `${builderState.items.map(item => item.name).join(', ')} / ${builderState.sets}세트 / 예상 ${won(grandTotal)}`
          : `제품 미선택 / ${builderState.sets}세트`;
      }
      if (inquirySetsSync) inquirySetsSync.value = builderState.sets;
    }

    document.querySelectorAll('.lineup-tab').forEach(tab => tab.addEventListener('click', () => {
      builderState.filter = tab.dataset.filter;
      document.querySelectorAll('.lineup-tab').forEach(item => item.classList.toggle('active', item === tab));
      renderBuilderProducts();
    }));

    document.getElementById('box-reset')?.addEventListener('click', () => { builderState.items = []; updateBuilder(); });
    document.getElementById('sets-minus')?.addEventListener('click', () => { builderState.sets = Math.max(10, builderState.sets - 1); if (setQuantity) setQuantity.value = builderState.sets; updateBuilder(); });
    document.getElementById('sets-plus')?.addEventListener('click', () => { builderState.sets = Math.min(1000, builderState.sets + 1); if (setQuantity) setQuantity.value = builderState.sets; updateBuilder(); });
    
    setQuantity?.addEventListener('input', () => { builderState.sets = Math.min(1000, Math.max(10, Number(setQuantity.value) || 10)); updateBuilder(); });
    setQuantity?.addEventListener('blur', () => { if (setQuantity) setQuantity.value = builderState.sets; });

    renderBuilderProducts();
    updateBuilder();
  }

  /* ====================================================
   * 5. Contact Form Submission & Modal Dialog
   * ==================================================== */
  inquiryForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = inquiryForm.querySelector('.btn-submit-form');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.textContent = '신청을 접수하는 중...';
      submitBtn.disabled = true;
    }

    try {
      const inquiryResponse = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('user-name')?.value || '',
          phone: document.getElementById('user-phone')?.value || '',
          eventDate: document.getElementById('event-date')?.value || '',
          quantity: document.getElementById('sim-sets-sync')?.value || '',
          estimate: document.getElementById('selected-summary')?.value || '',
          message: document.getElementById('user-message')?.value || '',
          website: document.getElementById('website')?.value || ''
        })
      });

      const inquiryResult = await inquiryResponse.json().catch(() => ({}));
      if (!inquiryResponse.ok || !inquiryResult.ok) {
        throw new Error(inquiryResult.message || '상담 신청을 전송하지 못했습니다.');
      }

      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }

      successModal?.classList.add('active');
      document.body.style.overflow = 'hidden';
      inquiryForm.reset();
    } catch (error) {
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
      alert(error.message || '전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  });

  modalCloseBtn?.addEventListener('click', () => {
    successModal?.classList.remove('active');
    document.body.style.overflow = '';
  });

  successModal?.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.getElementById('quick-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('quick-bottom')?.addEventListener('click', () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });
});
