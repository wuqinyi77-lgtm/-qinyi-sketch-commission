const form = document.getElementById('quoteForm');
const steps = [...document.querySelectorAll('.form-step')];
const progressBar = document.getElementById('progressBar');
let currentStep = 0;
let calculated = null;

// 部署 Google Apps Script 後，把 Web App URL 貼在這裡。
const GOOGLE_APPS_SCRIPT_URL = '';

function showStep(index) {
  steps.forEach((step, i) => step.classList.toggle('active', i === index));
  currentStep = index;
  progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
  document.getElementById('commission').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function value(name) {
  const field = form.elements[name];
  if (!field) return '';
  if (field instanceof RadioNodeList) return field.value;
  return field.value;
}

function validateStep(index) {
  const required = [...steps[index].querySelectorAll('[required]')];
  let valid = true;
  steps[index].querySelectorAll('.error').forEach(el => el.remove());

  required.forEach(field => {
    const checked = field.type === 'checkbox' ? field.checked : Boolean(field.value.trim());
    if (!checked) {
      valid = false;
      const msg = document.createElement('p');
      msg.className = 'error';
      msg.textContent = field.type === 'checkbox' ? '請先勾選同意後再送出。' : '這一題先簡單告訴我就可以。';
      field.closest('label')?.appendChild(msg);
    }
  });
  return valid;
}

function quote() {
  const type = value('type');
  const people = Number(value('people') || 1);
  const size = value('size');
  const depth = value('depth');
  const budget = Number(value('budget') || 0);
  let title = '故事收藏型人物速寫';
  let price = 15000;
  let includes = '故事理解、照片參考、人物與背景創作、基礎包裝';

  if (['現場活動', '婚禮', '品牌合作'].includes(type)) {
    title = type === '婚禮' ? '婚禮現場藝術體驗' : type === '品牌合作' ? '品牌活動現場創作' : '私人活動現場速寫';
    price = type === '品牌合作' ? 35000 : 25000;
    includes = '前期流程確認、現場出席、速寫創作與材料；交通、稅金與額外時數另計';
  } else if (depth === '自由速寫') {
    title = '自由流動水彩速寫';
    price = people === 1 ? 8000 : people === 2 ? 12000 : people === 3 ? 18000 : 24000;
    includes = '照片參考、喜歡色彩、由沁頤自由詮釋、不含框';
  } else if (depth === '深度故事創作') {
    title = '深度故事情感創作';
    price = people === 1 ? 25000 : people === 2 ? 35000 : people === 3 ? 50000 : 60000;
    includes = '深度訪談、照片與影片資料、重新構圖、故事與情緒轉譯';
  } else {
    price = people === 1 ? 15000 : people === 2 ? 25000 : people === 3 ? 35000 : 45000;
    if (size === '大型作品') price += 15000;
  }

  let reason = value('story')
    ? '你寫下的故事會成為作品的核心，而不是只把照片重新畫一次。'
    : '這個方案能保留人物神韻，也讓多年後的你重新想起當時的感受。';

  if (budget && budget < price) {
    reason += ' 目前預算和建議方案有一些差距，我會優先調整尺寸或創作深度，不會直接犧牲最重要的人物與情感。';
  }

  calculated = { title, price, includes, reason };
  document.getElementById('planTitle').textContent = title;
  document.getElementById('planPrice').textContent = `NT$${price.toLocaleString('zh-TW')} 起`;
  document.getElementById('planReason').textContent = reason;
  document.getElementById('summary').innerHTML = `
    <strong>委託方向：</strong>${type}<br>
    <strong>人物關係：</strong>${value('relation') || '尚未填寫'}<br>
    <strong>人物數量：</strong>${people} 位<br>
    <strong>作品尺寸：</strong>${size}<br>
    <strong>創作方式：</strong>${depth}<br>
    <strong>內容包含：</strong>${includes}<br>
    <strong>希望感受：</strong>${value('feeling') || '尚未填寫'}
  `;
}

document.querySelectorAll('.next-button').forEach(button => {
  button.addEventListener('click', () => {
    if (button.id === 'calculateButton') {
      if (!validateStep(currentStep)) return;
      quote();
    } else if (!validateStep(currentStep)) {
      return;
    }
    showStep(Math.min(currentStep + 1, steps.length - 1));
  });
});

document.querySelectorAll('.back-button').forEach(button => {
  button.addEventListener('click', () => showStep(Math.max(currentStep - 1, 0)));
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateStep(currentStep)) return;

  const submitButton = form.querySelector('.submit-button');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = '正在送出…';

  const payload = {
    name: value('name'),
    email: value('email'),
    contact: value('contact'),
    type: value('type'),
    relation: value('relation'),
    story: value('story'),
    feeling: value('feeling'),
    people: Number(value('people') || 1),
    size: value('size'),
    depth: value('depth'),
    budget: Number(value('budget') || 0),
    date: value('date'),
    plan: calculated?.title || '',
    price: calculated?.price || 0,
    extra: value('extra')
  };

  try {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script 尚未完成部署。');
    }

    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const box = document.createElement('div');
    box.className = 'success-box';
    box.innerHTML = `<strong>已收到你的委託需求 🤍</strong><br><br>資料已送入沁頤的 Google 試算表，並建立 Gmail 回覆草稿。沁頤確認後會親自回覆你。`;
    form.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.reset();
  } catch (error) {
    const box = document.createElement('div');
    box.className = 'success-box';
    box.innerHTML = `<strong>目前還差最後一個 Google 授權步驟。</strong><br><br>${error.message}<br>網站內容已保留，請稍後再試。`;
    form.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

showStep(0);
