function updateBuilder() {
        const boxSpec = getBoxSpec(builderState.items);
        builderRoot.classList.toggle('has-products', builderState.items.length > 0);
        
        // --- [수정] 칸막이 격자 대신 실제 상자처럼 겹쳐서 유연하게 담기는 구조로 변경 ---
        slots.innerHTML = builderState.items.map((item, index) => `
            <button type="button" class="filled-slot gift-item product-${item.category}" data-slot="${index}" aria-label="상자에서 제품 빼기" style="--product-tone:${item.tone};">
                <img src="${item.image}" alt="${item.name}">
            </button>`).join('');

        slots.className = `gift-box-slots capacity-${boxSpec.capacity} items-${builderState.items.length} is-overlapping`;
        boxStage.className = `gift-box-stage capacity-${boxSpec.capacity} item-count-${builderState.items.length}`;
        
        // 상품 개수에 따라 상자 가로 폭이 자연스럽게 늘어나도록 설정 (최소 45%에서 최대 100%)
        const boxWidth = builderState.items.length === 0 ? 45 : Math.min(100, Math.max(45, 35 + builderState.items.length * 9));
        boxStage.style.width = `${boxWidth}%`;
        
        slots.querySelectorAll('[data-slot]').forEach(slot => slot.addEventListener('click', () => {
            builderState.items.splice(Number(slot.dataset.slot), 1);
            updateBuilder();
        }));
        // --------------------------------------------------------------------------

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
