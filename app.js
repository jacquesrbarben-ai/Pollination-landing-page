function initApp() {
  // --- LANGUAGE CONTROLLER ---
  let currentLang = 'en';
  try {
    currentLang = localStorage.getItem('pollination_lang') || 'en';
  } catch (e) {
    console.warn("localStorage is not available:", e);
  }

  const transDb = typeof window !== 'undefined' && window.translations ? window.translations : (typeof translations !== 'undefined' ? translations : null);

  function t(key) {
    if (!transDb) return key;
    if (transDb[currentLang] && transDb[currentLang][key] !== undefined) {
      return transDb[currentLang][key];
    }
    if (transDb['en'] && transDb['en'][key] !== undefined) {
      return transDb['en'][key];
    }
    return key;
  }

  function applyTranslations() {
    // 1. Static text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = t(key);
      if (translation) {
        if (translation.includes('<') || translation.includes('&')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // 2. Input Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = t(key);
      if (translation) {
        el.setAttribute('placeholder', translation);
      }
    });

    // 3. Document Meta Tags & lang attribute
    document.documentElement.setAttribute('lang', currentLang);
    const pageTitle = t('title');
    if (pageTitle) {
      document.title = pageTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const descVal = t('meta_desc');
      if (descVal) {
        metaDesc.setAttribute('content', descVal);
      }
    }
  }

  function switchLanguage(lang) {
    currentLang = lang;
    try {
      localStorage.setItem('pollination_lang', lang);
    } catch (e) {
      console.warn("localStorage is not available for saving:", e);
    }
    
    // Apply standard dictionary updates
    applyTranslations();
    
    // Update active states on switcher dropdown items
    document.querySelectorAll('.lang-dropdown-item').forEach(item => {
      if (item.dataset.lang === lang) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update active label text on triggers
    const desktopLabel = document.querySelector('#langDropdownTrigger .active-lang-label');
    if (desktopLabel) {
      desktopLabel.textContent = lang.toUpperCase();
    }
    const mobileLabel = document.querySelector('#langDropdownMobileTrigger .active-lang-label');
    if (mobileLabel) {
      mobileLabel.textContent = lang === 'af' ? 'Afrikaans' : 'English';
    }

    // Re-run dynamic calculators to update language-specific logic/strings
    updateEstimator();
    updateFlightSimulator();
    calculateAuditScore();
  }

  // Handle language dropdown toggling
  const desktopTrigger = document.getElementById('langDropdownTrigger');
  const desktopDropdown = document.getElementById('langDropdown');
  const mobileTrigger = document.getElementById('langDropdownMobileTrigger');
  const mobileDropdown = document.getElementById('langDropdownMobile');

  if (desktopTrigger && desktopDropdown) {
    desktopTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopDropdown.classList.toggle('active');
      if (mobileDropdown) mobileDropdown.classList.remove('active');
    });
  }

  if (mobileTrigger && mobileDropdown) {
    mobileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDropdown.classList.toggle('active');
      if (desktopDropdown) desktopDropdown.classList.remove('active');
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    if (desktopDropdown) desktopDropdown.classList.remove('active');
    if (mobileDropdown) mobileDropdown.classList.remove('active');
  });

  // Bind click handlers to dropdown items
  document.querySelectorAll('.lang-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedLang = item.dataset.lang;
      switchLanguage(selectedLang);
      if (desktopDropdown) desktopDropdown.classList.remove('active');
      if (mobileDropdown) mobileDropdown.classList.remove('active');
    });
  });

  // --- TABS CONTROLLER ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(`${targetTab}-panel`).classList.add('active');
    });
  });

  // --- HIVE REQUIREMENT ESTIMATOR ---
  const cropSelect = document.getElementById('cropSelect');
  const hectaresInput = document.getElementById('hectaresInput');
  const hectaresVal = document.getElementById('hectaresVal');
  const tariffInput = document.getElementById('tariffInput');

  const resultHives = document.getElementById('result-hives');
  const resultSites = document.getElementById('result-sites');
  const resultCost = document.getElementById('result-cost');
  const resultBrood = document.getElementById('result-brood');
  const resultBees = document.getElementById('result-bees');
  const cropGuideline = document.getElementById('crop-guideline');

  // Hortgro guidelines: hives per hectare
  const cropRatios = {
    apples_standard: { ratio: 2.5, key: 'crop_ratio_apples_std' },
    apples_high: { ratio: 4.0, key: 'crop_ratio_apples_high' },
    pears: { ratio: 5.0, key: 'crop_ratio_pears' },
    plums: { ratio: 6.0, key: 'crop_ratio_plums' },
    apricots: { ratio: 2.0, key: 'crop_ratio_apricots' }
  };

  function updateEstimator() {
    const crop = cropSelect.value;
    const hectares = parseFloat(hectaresInput.value);
    const tariff = parseFloat(tariffInput.value) || 0;

    // Update range slider text representation
    hectaresVal.textContent = hectares.toFixed(1);

    const ratioInfo = cropRatios[crop];
    const totalHives = Math.round(ratioInfo.ratio * hectares);
    
    // Group in circles of ~6 hives, maximum 400m apart
    const suggestedSites = Math.max(1, Math.ceil(totalHives / 6));
    const totalCost = totalHives * tariff;

    // Minimum Quality standards: 8 bee frames, 4 brood frames
    const minBrood = totalHives * 4;
    const minBees = totalHives * 8;

    // Update DOM
    resultHives.textContent = totalHives;
    resultSites.textContent = suggestedSites;
    const locale = currentLang === 'af' ? 'af-ZA' : 'en-ZA';
    resultCost.textContent = `R ${totalCost.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    resultBrood.textContent = minBrood;
    resultBees.textContent = minBees;
    cropGuideline.textContent = t(ratioInfo.key);

    // Automatically sync info to contract input fields
    const contractHivesInput = document.getElementById('contractHives');
    const contractCostInput = document.getElementById('contractCost');
    if (contractHivesInput) contractHivesInput.value = totalHives;
    if (contractCostInput) contractCostInput.value = totalCost;
    updateContract();
  }

  cropSelect.addEventListener('change', updateEstimator);
  hectaresInput.addEventListener('input', updateEstimator);
  tariffInput.addEventListener('input', updateEstimator);

  // --- WEATHER & FLIGHT SIMULATOR ---
  const tempInput = document.getElementById('tempInput');
  const tempVal = document.getElementById('tempVal');
  const windInput = document.getElementById('windInput');
  const windVal = document.getElementById('windVal');
  const skySelect = document.getElementById('skySelect');

  const dialFill = document.querySelector('.flight-dial-fill');
  const dialValue = document.querySelector('.flight-dial-value');
  const flightBadge = document.getElementById('flight-badge');
  const flightDesc = document.getElementById('flight-desc');

  // Circle circumference is 2 * pi * r (r = 80, circumference ~ 502)
  const dialCircumference = 2 * Math.PI * 80;
  if (dialFill) {
    dialFill.style.strokeDasharray = dialCircumference;
  }

  function updateFlightSimulator() {
    const temp = parseFloat(tempInput.value);
    const wind = parseFloat(windInput.value);
    const sky = skySelect.value;

    tempVal.textContent = `${temp}°C`;
    windVal.textContent = `${wind} km/h`;

    let activity = 100;
    let reasons = [];

    // 1. Temperature Impact (Bees prefer 15°C - 32°C)
    if (temp < 10) {
      activity = 0;
      reasons.push('reason_too_cold');
    } else if (temp < 15) {
      const penalty = (15 - temp) * 15;
      activity -= penalty;
      reasons.push('reason_low_temp');
    } else if (temp > 33) {
      const penalty = (temp - 33) * 8;
      activity -= penalty;
      reasons.push('reason_extreme_heat');
    }

    // 2. Wind Impact (Bees flight disrupted above 15km/h, stops above 30km/h)
    if (wind > 35) {
      activity = 0;
      reasons.push('reason_gale_wind');
    } else if (wind > 15) {
      const penalty = (wind - 15) * 4.5;
      activity -= penalty;
      reasons.push('reason_high_wind');
    }

    // 3. Sky & Rain conditions
    let skyMultiplier = 1.0;
    if (sky === 'rain') {
      activity = 0;
      reasons.push('reason_rain');
    } else if (sky === 'overcast') {
      skyMultiplier = 0.6;
      reasons.push('reason_overcast');
    } else if (sky === 'cloudy') {
      skyMultiplier = 0.85;
      reasons.push('reason_cloudy');
    }

    activity = Math.max(0, Math.min(100, Math.round(activity * skyMultiplier)));

    // Update Dial UI
    dialValue.textContent = `${activity}%`;
    const offset = dialCircumference - (activity / 100) * dialCircumference;
    if (dialFill) {
      dialFill.style.strokeDashoffset = offset;
      
      // Update colour based on activity
      if (activity >= 75) {
        dialFill.style.stroke = 'var(--success)';
        flightBadge.textContent = t('flight_status_optimal');
        flightBadge.className = 'flight-status-badge flight-status-optimal';
      } else if (activity >= 40) {
        dialFill.style.stroke = 'var(--primary)';
        flightBadge.textContent = t('flight_status_suboptimal');
        flightBadge.className = 'flight-status-badge flight-status-suboptimal';
      } else {
        dialFill.style.stroke = 'var(--danger)';
        flightBadge.textContent = t('flight_status_danger');
        flightBadge.className = 'flight-status-badge flight-status-danger';
      }
    }

    if (activity === 0) {
      flightDesc.textContent = reasons.length > 0 ? t(reasons[0]) : t('flight_desc_none');
    } else {
      flightDesc.textContent = reasons.length > 0 
        ? `${t('flight_desc_prefix')}${reasons.map(r => t(r)).join(' ')}` 
        : t('flight_desc_optimal');
    }
  }

  tempInput.addEventListener('input', updateFlightSimulator);
  windInput.addEventListener('input', updateFlightSimulator);
  skySelect.addEventListener('change', updateFlightSimulator);


  // --- INTERACTIVE AUDIT CHECKLIST ---
  const checklistItems = document.querySelectorAll('.checklist-item');
  const scoreDial = document.querySelector('.score-dial');
  const scoreProgressFill = document.querySelector('.score-progress-fill');
  const auditGrade = document.querySelector('.audit-grade');
  const auditFeedback = document.querySelector('.audit-feedback');

  function calculateAuditScore() {
    const total = checklistItems.length;
    const checked = document.querySelectorAll('.checklist-item.checked').length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

    // Update DOM
    scoreDial.textContent = `${percentage}%`;
    scoreProgressFill.style.width = `${percentage}%`;

    // Grade and colour adjustments
    if (percentage === 100) {
      auditGrade.textContent = t('audit_grade_full');
      auditGrade.style.color = 'var(--success)';
      auditFeedback.textContent = t('audit_feedback_full');
    } else if (percentage >= 75) {
      auditGrade.textContent = t('audit_grade_good');
      auditGrade.style.color = 'var(--primary-dark)';
      auditFeedback.textContent = t('audit_feedback_good');
    } else if (percentage >= 40) {
      auditGrade.textContent = t('audit_grade_warn');
      auditGrade.style.color = 'var(--warning)';
      auditFeedback.textContent = t('audit_feedback_warn');
    } else {
      auditGrade.textContent = t('audit_grade_danger');
      auditGrade.style.color = 'var(--danger)';
      auditFeedback.textContent = t('audit_feedback_danger');
    }
  }

  checklistItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Toggle state
      item.classList.toggle('checked');
      calculateAuditScore();
    });
  });


  // --- GROWER-BEEKEEPER CONTRACT BUILDER ---
  const contractGrower = document.getElementById('contractGrower');
  const contractBeekeeper = document.getElementById('contractBeekeeper');
  const contractFarm = document.getElementById('contractFarm');
  const contractHives = document.getElementById('contractHives');
  const contractDate = document.getElementById('contractDate');
  const contractCost = document.getElementById('contractCost');
  const btnPrint = document.getElementById('btnPrint');

  function updateContract() {
    const prevGrower = document.getElementById('prev-grower');
    const prevBeekeeper = document.getElementById('prev-beekeeper');
    const prevFarm = document.getElementById('prev-farm');
    const prevHives = document.getElementById('prev-hives');
    const prevDate = document.getElementById('prev-date');
    const prevCost = document.getElementById('prev-cost');
    const prevDateSig = document.getElementById('prev-date-sig');

    if (prevGrower) prevGrower.textContent = contractGrower.value || '_______________________';
    if (prevBeekeeper) prevBeekeeper.textContent = contractBeekeeper.value || '_______________________';
    if (prevFarm) prevFarm.textContent = contractFarm.value || '_______________________';
    if (prevHives) prevHives.textContent = contractHives.value || '___';
    
    const locale = currentLang === 'af' ? 'af-ZA' : 'en-ZA';
    // Format Date
    if (contractDate.value) {
      const dateObj = new Date(contractDate.value);
      if (prevDate) prevDate.textContent = dateObj.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
      if (prevDateSig) prevDateSig.textContent = dateObj.toLocaleDateString(locale);
    } else {
      if (prevDate) prevDate.textContent = '_______________________';
      if (prevDateSig) prevDateSig.textContent = '__________';
    }

    // Format Cost
    const costVal = parseFloat(contractCost.value) || 0;
    if (prevCost) {
      prevCost.textContent = costVal > 0 
        ? `R ${costVal.toLocaleString(locale, { minimumFractionDigits: 2 })}` 
        : 'R ____________';
    }
  }

  // Bind inputs
  const inputs = [contractGrower, contractBeekeeper, contractFarm, contractHives, contractDate, contractCost];
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateContract);
    }
  });

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // --- POLLINATION CALENDAR FILTERING ---
  const cropFilters = document.getElementById('cropFilters');
  const calendarRows = document.querySelectorAll('.calendar-row');

  if (cropFilters) {
    const filterButtons = cropFilters.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filterValue = button.dataset.filter;

        // Active class toggle
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        calendarRows.forEach(row => {
          const rowCrops = row.dataset.crops.split(',');
          
          if (filterValue === 'all') {
            row.classList.remove('dimmed');
            row.querySelectorAll('.active-month').forEach(cell => cell.classList.remove('dimmed-cell'));
          } else {
            if (rowCrops.includes(filterValue)) {
              row.classList.remove('dimmed');
              
              row.querySelectorAll('.active-month').forEach(cell => {
                if (cell.classList.contains(filterValue)) {
                  cell.classList.remove('dimmed-cell');
                } else {
                  cell.classList.add('dimmed-cell');
                }
              });
            } else {
              row.classList.add('dimmed');
              row.querySelectorAll('.active-month').forEach(cell => cell.classList.add('dimmed-cell'));
            }
          }
        });
      });
    });
  }

  // --- FAQ SINGLE OPEN CONSTRAINT ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const summary = item.querySelector('summary');
      if (e.target === summary || summary.contains(e.target)) {
        if (!item.hasAttribute('open')) {
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.removeAttribute('open');
            }
          });
        }
      }
    });
  });

  // --- SCROLL NAV ACTIVE HIGHLIGHT ---
  const navLinks = document.querySelectorAll('nav > a');
  const sections = document.querySelectorAll('section[id]');

  function highlightNavOnScroll() {
    let scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120; // offset for sticky header
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavOnScroll);

  // --- MOBILE NAV TOGGLE ---
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const nav = document.querySelector('nav');
  const navLinksList = document.querySelectorAll('nav a');

  if (hamburgerMenu && nav) {
    hamburgerMenu.addEventListener('click', () => {
      hamburgerMenu.classList.toggle('active');
      nav.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinksList.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }

  // --- CONTACT A BEEKEEPER MODAL LOGIC ---
  const contactModal = document.getElementById('contact-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const btnSuccessClose = document.getElementById('btn-success-close');
  const contactForm = document.getElementById('contact-form');
  const successScreen = document.getElementById('success-screen');
  const formFieldsGrid = document.getElementById('form-fields-grid');

  // Modal Fields
  const modalCropSelect = document.getElementById('modalCropSelect');
  const modalHectaresInput = document.getElementById('modalHectaresInput');
  const modalHectaresVal = document.getElementById('modalHectaresVal');
  const modalHivesPerHa = document.getElementById('modalHivesPerHa');
  const modalTariffInput = document.getElementById('modalTariffInput');

  // Default densities per crop
  const cropDefaultDensities = {
    plums: 6.0,
    pears: 5.0,
    apples_standard: 2.5,
    apples_high: 4.0,
    apricots: 2.0,
    berries: 3.5,
    seed_crops: 9.0
  };

  // Sync Modal Hectares slider
  if (modalHectaresInput && modalHectaresVal) {
    modalHectaresInput.addEventListener('input', () => {
      modalHectaresVal.textContent = parseFloat(modalHectaresInput.value).toFixed(1);
    });
  }

  // Update default density in modal when crop selection changes
  if (modalCropSelect && modalHivesPerHa) {
    modalCropSelect.addEventListener('change', () => {
      const selectedCrop = modalCropSelect.value;
      if (cropDefaultDensities[selectedCrop]) {
        modalHivesPerHa.value = cropDefaultDensities[selectedCrop];
      }
    });
  }

  function openModal(options = {}) {
    // Reset success screen
    if (successScreen) successScreen.style.display = 'none';
    if (formFieldsGrid) formFieldsGrid.style.display = 'block';

    // Close mobile nav if open
    if (hamburgerMenu && nav) {
      hamburgerMenu.classList.remove('active');
      nav.classList.remove('active');
    }

    // Prefill parameters if provided
    if (options.crop) {
      modalCropSelect.value = options.crop;
      // Trigger change to set default hives density
      modalCropSelect.dispatchEvent(new Event('change'));
    }
    if (options.hectares !== undefined) {
      modalHectaresInput.value = options.hectares;
      if (modalHectaresVal) {
        modalHectaresVal.textContent = parseFloat(options.hectares).toFixed(1);
      }
    }
    if (options.density !== undefined) {
      modalHivesPerHa.value = options.density;
    }
    if (options.price !== undefined) {
      modalTariffInput.value = Math.round(options.price);
    }

    // Open modal and lock scroll
    if (contactModal) {
      contactModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (contactModal) {
      contactModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (contactForm) {
      contactForm.reset();
    }
  }

  // Bind all triggers (including dynamically populated elements if any)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.contact-trigger');
    if (!trigger) return;

    e.preventDefault();
    const options = {};

    // 1. Triggered from Crop Card
    if (trigger.classList.contains('btn-crop-inquire')) {
      options.crop = trigger.dataset.crop;
    }

    // 2. Triggered from Hive Calculator
    if (trigger.id === 'btn-calculator-contact') {
      options.crop = cropSelect ? cropSelect.value : 'plums';
      options.hectares = hectaresInput ? parseFloat(hectaresInput.value) : 10;
      options.price = tariffInput ? parseFloat(tariffInput.value) : 1432;
      
      const ratioInfo = cropRatios[options.crop];
      options.density = ratioInfo ? ratioInfo.ratio : 5.0;
    }

    openModal(options);
  });

  // Bind close buttons
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (btnSuccessClose) btnSuccessClose.addEventListener('click', closeModal);

  // Close when clicking overlay background
  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        closeModal();
      }
    });
  }

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal && contactModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Form submission handler
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const grower = document.getElementById('growerName').value;
      const cropVal = modalCropSelect.value;
      const cropNameKeys = {
        plums: 'crop_name_plums',
        pears: 'crop_name_pears',
        apples_standard: 'crop_name_apples_standard',
        apples_high: 'crop_name_apples_high',
        apricots: 'crop_name_apricots',
        berries: 'crop_name_berries',
        seed_crops: 'crop_name_seed_crops'
      };
      const cropText = t(cropNameKeys[cropVal]) || modalCropSelect.options[modalCropSelect.selectedIndex].text.split(' (')[0];
      const location = document.getElementById('farmLocation').value;
      const hectares = parseFloat(modalHectaresInput.value);
      const density = parseFloat(modalHivesPerHa.value);
      const totalHives = Math.round(hectares * density);
      const price = parseFloat(modalTariffInput.value) || 0;

      // Populate summary fields on success screen
      const summaryGrower = document.getElementById('summary-grower');
      const summaryCrop = document.getElementById('summary-crop');
      const summaryLocation = document.getElementById('summary-location');
      const summarySize = document.getElementById('summary-size');
      const summaryDensity = document.getElementById('summary-density');
      const summaryTotalHives = document.getElementById('summary-total-hives');
      const summaryPrice = document.getElementById('summary-price');

      if (summaryGrower) summaryGrower.textContent = grower;
      if (summaryCrop) summaryCrop.textContent = cropText;
      if (summaryLocation) summaryLocation.textContent = location;
      if (summarySize) summarySize.textContent = hectares.toFixed(1);
      const densityUnit = currentLang === 'af' ? 'Korwe/Ha' : 'Hives/Ha';
      if (summaryDensity) summaryDensity.textContent = `${density.toFixed(1)} ${densityUnit}`;
      if (summaryTotalHives) summaryTotalHives.textContent = totalHives;
      if (summaryPrice) {
        summaryPrice.textContent = price.toLocaleString(currentLang === 'af' ? 'af-ZA' : 'en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      // Show success screen and hide fields
      if (formFieldsGrid) formFieldsGrid.style.display = 'none';
      if (successScreen) successScreen.style.display = 'block';
    });
  }

  // --- INITIALIZE ALL ---
  switchLanguage(currentLang);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
