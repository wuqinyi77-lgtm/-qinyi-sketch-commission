const form = document.getElementById('quoteForm');
const steps = [...document.querySelectorAll('.form-step')];
const progressBar = document.getElementById('progressBar');
const eventDetails = document.getElementById('eventDetails');
const deliveryDateField = document.getElementById('deliveryDateField');
const CONTACT_EMAIL = 'wuqinyi77@gmail.com';
const EVENT_TYPES = ['現場活動', '婚禮', '品牌合作'];
let currentStep = 0;
let calculated = null;

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
  return field.value.trim();
}

function isEventInquiry() {
  return EVENT_TYPES.includes(value('type'));
}

function updateFieldsForType() {
  const show = isEventInquiry();
  eventDetails.hidden = !show;
  deliveryDateField.hidden = show;
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
      msg.textContent = field.type === 'checkbox' ? '請先勾選同意後再寄出。' : '這一題先簡單告訴我就可以。';
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
  let title = '故事收藏型人物速寫';
  let price = 15000;
  let includes = '故事理解、照片參考、人物與背景創作、基礎包裝';

  if (EVENT_TYPES.includes(type)) {
    title = type === '婚禮' ? '婚禮現場藝術體驗' : type === '品牌合作' ? '品牌活動現場創作' : '私人活動現場速寫';
    price = type === '婚禮' ? 50000 : type === '品牌合作' ? 45000 : 25000;
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

  const reason = EVENT_TYPES.includes(type)
    ? '我會依活動流程、希望完成的作品量與預算，規劃真正能在現場執行的方式。'
    : '你寫下的故事會成為作品的核心，而不只是把照片重新畫一次。';

  calculated = { title, price, includes, reason };
  document.getElementById('planTitle').textContent = title;
  document.getElementById('planPrice').textContent = EVENT_TYPES.includes(type) ? '依需求客製規劃' : `NT$${price.toLocaleString('zh-TW')} 起`;
  document.getElementById('planReason').textContent = reason;
  document.getElementById('summary').innerHTML = `
    <strong>委託方向：</strong>${type}<br>
    <strong>人物關係：</strong>${value('relation') || '尚未填寫'}<br>
    <strong>人物／賓客數量：</strong>${isEventInquiry() ? value('guestCount') || '尚未確定' : `${people} 位`}<br>
    <strong>作品／服務方向：</strong>${isEventInquiry() ? value('eventGoal') || depth : depth}<br>
    <strong>預計預算：</strong>${value('budget') ? `NT$${value('budget')}` : '希望由沁頤建議'}<br>
    <strong>希望感受：</strong>${value('feeling') || '尚未填寫'}
  `;
}

function line(label, content) {
  return `${label}：${content || '尚未確定'}`;
}

function buildEmail() {
  const type = value('type');
  const event = isEventInquiry();
  const subjectDate = event ? value('eventDate') : value('deliveryDate');
  const subject = `${type}合作詢問｜${value('name')}${subjectDate ? `｜${subjectDate}` : ''}`;
  const body = [
    '沁頤您好，',
    '',
    '我從網站看見您的作品，想詢問以下委託／合作：',
    '',
    '【基本聯絡資料】',
    line('姓名', value('name')),
    line('Email', value('email')),
    line('Instagram／Line', value('contact')),
    '',
    '【委託方向】',
    line('活動／委託類型', type),
    line('想畫的人與關係', value('relation')),
    line('這次想留下的故事', value('story')),
    line('希望作品帶來的感受', value('feeling')),
    line('期待的創作方式', value('depth')),
    line('預計合作預算', value('budget') ? `NT$${value('budget')}` : '還不確定，希望由沁頤建議'),
  ];

  if (event) {
    body.push(
      '',
      '【婚禮／活動資訊】',
      line('活動日期', value('eventDate')),
      line('活動時段', value('eventPeriod')),
      line('預計服務時間', value('serviceTime')),
      line('地點與場地名稱', value('venue')),
      line('賓客／參與人數', value('guestCount')),
      line('最希望留下的內容', value('eventGoal')),
      line('希望完成的人數／作品量', value('targetOutput')),
      line('目前流程或安排', value('eventFlow')),
      '',
      '如果以上需求需要調整，也希望能依照實際預算，請沁頤協助客製安排服務時間、作品形式與創作重點。'
    );
  } else {
    body.push(
      line('人物數量', `${value('people')} 位`),
      line('希望尺寸', value('size')),
      line('希望收到作品日期', value('deliveryDate'))
    );
  }

  body.push('', '【其他補充】', value('extra') || '無', '', '謝謝您，期待您的回覆！');
  return { subject, body: body.join('\n') };
}

document.querySelectorAll('input[name="type"]').forEach(input => {
  input.addEventListener('change', updateFieldsForType);
});

document.querySelectorAll('.next-button').forEach(button => {
  button.addEventListener('click', () => {
    if (button.id === 'calculateButton') {
      if (!validateStep(currentStep)) return;
      quote();
    } else if (!validateStep(currentStep)) {
      return;
    }
    updateFieldsForType();
    showStep(Math.min(currentStep + 1, steps.length - 1));
  });
});

document.querySelectorAll('.back-button').forEach(button => {
  button.addEventListener('click', () => showStep(Math.max(currentStep - 1, 0)));
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateStep(currentStep)) return;
  const { subject, body } = buildEmail();
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

updateFieldsForType();
showStep(0);
