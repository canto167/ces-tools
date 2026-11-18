/**
 * UI components and interactive kit
 */

export const UIKit = {
  /**
   * Bind stepper (+ / -) to an input
   */
  bindStepper(inputEl, step = 1, min = 0, max = Infinity, onChange = null) {
    const parent = inputEl.parentElement;
    if (!parent) return;

    let stepperContainer = parent.querySelector('.stepper-controls');
    if (!stepperContainer) {
      stepperContainer = document.createElement('div');
      stepperContainer.className = 'stepper-controls';
      stepperContainer.innerHTML = `
        <button type="button" class="btn-step btn-step-down" aria-label="Decrease">−</button>
        <button type="button" class="btn-step btn-step-up" aria-label="Increase">+</button>
      `;
      parent.appendChild(stepperContainer);

      stepperContainer.querySelector('.btn-step-down').addEventListener('click', () => {
        const cur = Number(inputEl.value) || 0;
        const next = Math.max(min, cur - step);
        inputEl.value = next;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        if (onChange) onChange(next);
      });

      stepperContainer.querySelector('.btn-step-up').addEventListener('click', () => {
        const cur = Number(inputEl.value) || 0;
        const next = Math.min(max, cur + step);
        inputEl.value = next;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        if (onChange) onChange(next);
      });
    }
  },

  /**
   * Build segmented button group (e.g. bar diameter selector)
   */
  createSegmentedGroup(name, options, selectedVal, onSelect) {
    const group = document.createElement('div');
    group.className = 'segmented-group';
    group.setAttribute('role', 'radiogroup');

    options.forEach(opt => {
      const val = typeof opt === 'object' ? opt.value : opt;
      const label = typeof opt === 'object' ? opt.label : String(opt);
      const isSelected = String(val) === String(selectedVal);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `segmented-btn ${isSelected ? 'active' : ''}`;
      btn.textContent = label;
      btn.setAttribute('data-value', String(val));
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');

      btn.addEventListener('click', () => {
        group.querySelectorAll('.segmented-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        if (onSelect) onSelect(val);
      });

      group.appendChild(btn);
    });

    return group;
  },

  /**
   * Render design check status card
   */
  renderStatusCard(check) {
    const isPass = check.status === 'PASS';
    const isWarn = check.status === 'WARN';
    const statusClass = isPass ? 'status-pass' : (isWarn ? 'status-warn' : 'status-fail');
    const badgeText = isPass ? 'PASS' : (isWarn ? 'WARNING' : 'FAIL');
    const ratioPct = Math.min(100, Math.max(0, (check.ratio || 0) * 100));

    return `
      <div class="check-card ${statusClass}">
        <div class="check-header">
          <span class="check-name">${check.name}</span>
          <span class="status-badge ${statusClass}">${badgeText}</span>
        </div>
        <div class="check-values">
          <span class="check-val">Demand: <strong>${typeof check.demand === 'number' ? check.demand.toFixed(2) : check.demand}</strong> ${check.unit || ''}</span>
          <span class="check-val">Capacity: <strong>${typeof check.capacity === 'number' ? check.capacity.toFixed(2) : check.capacity}</strong> ${check.unit || ''}</span>
          <span class="check-ratio">Utilisation: <strong>${(check.ratio * 100).toFixed(1)}%</strong></span>
        </div>
        <div class="util-bar-track">
          <div class="util-bar-fill ${statusClass}" style="width: ${ratioPct}%;"></div>
        </div>
        ${check.clause ? `<div class="check-clause">Ref: ${check.clause}</div>` : ''}
        ${check.message ? `<div class="check-msg">${check.message}</div>` : ''}
      </div>
    `;
  }
};
