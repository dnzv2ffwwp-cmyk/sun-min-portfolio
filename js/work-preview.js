(() => {
  const dialog = document.querySelector('[data-work-preview]');
  if (!dialog) return;
  const image = dialog.querySelector('img');
  const close = dialog.querySelector('button');
  let previousOverflow = '';
  document.querySelector('.works-archive .gallery-section--banner')?.addEventListener('click', event => {
    const card = event.target.closest('.asset-card');
    if (!card || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    image.src = card.href;
    image.alt = card.querySelector('img').alt.replace('미리보기', '전체 디자인');
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.scrollTop = 0;
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
  });
})();
