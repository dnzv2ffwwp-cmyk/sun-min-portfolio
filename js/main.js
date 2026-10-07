const scene = document.querySelector('.sticky-scene');
const stage = document.querySelector('.stage');
const experience = document.querySelector('.experience');
const aboutSection = document.querySelector('.about');
const mobileResumeLayout = document.querySelector('.mobile-resume-layout');
const mobileResumePosition = document.querySelector('.mobile-resume-layout__image');
const sectionDirectory = document.querySelector('.section-directory');
const resumeFolder = document.querySelector('.folder--resume');
const resumeSheet = document.querySelector('.resume-scroll-sheet');
const scrollCircle = document.querySelector('.scroll-circle');
const aboutKicker = document.querySelector('.about-kicker');
const profileIntro = document.querySelector('.profile-intro');
const profileDetails = document.querySelector('.profile-details');
const otherFolders = document.querySelectorAll('.folders > .folder:not(.folder--resume)');
const folders = document.querySelector('.folders');

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (from, to, value) => {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
};
let hoverAmount = 0;
let hoverStart = 0;
let hoverFrom = 0;
let hoverTarget = 0;
let hoverFrame = 0;
const hoverDuration = 500;
let dragX = 0;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffset = 0;
let draggingFolders = false;
let folderDragCandidate = false;
let folderWasDragged = false;
let sceneFrame = 0;
let resizeFrame = 0;
let lastLayoutWidth = window.innerWidth;
let mobileSheetStart = {left: 0, top: 0, width: 0};

function animateResumeHover(now){
  const progress = clamp((now - hoverStart) / hoverDuration, 0, 1);
  hoverAmount = lerp(hoverFrom, hoverTarget, smoothstep(0, 1, progress));
  updateScene();
  if(progress < 1) hoverFrame = requestAnimationFrame(animateResumeHover);
  else hoverFrame = 0;
}

function updateResumeHover(){
  const target = resumeFolder.matches(':hover,:focus') ? 1 : 0;
  if(target === hoverTarget) return;
  hoverFrom = hoverAmount;
  hoverTarget = target;
  hoverStart = performance.now();
  if(hoverFrame) cancelAnimationFrame(hoverFrame);
  hoverFrame = requestAnimationFrame(animateResumeHover);
}

function resizeStage(){
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const scale = vw <= 760
    ? vw / 402
    : vw < 1200
      ? vw / 1024
      : Math.max(vw / 1920, vh / 1000);
  stage.style.setProperty('--stage-scale', scale);
}

function updateScene(){
  const rect = experience.getBoundingClientRect();
  const max = Math.max(1, experience.offsetHeight - window.innerHeight);
  const distance = clamp(-rect.top, 0, max);
  const p = distance / max;
  const vw = window.innerWidth;
  const mobile = vw <= 760;
  const tablet = vw > 760 && vw < 1200;
  const largeScreen = vw >= 1600;

  if(mobile && p >= 0.995){
    const aboutBox = aboutSection.getBoundingClientRect();
    const finalImageBox = mobileResumePosition.getBoundingClientRect();
    if(!mobileSheetStart.width){
      mobileSheetStart = {left: finalImageBox.left, top: finalImageBox.top, width: finalImageBox.width};
    }
    const aboutTravel = Math.max(0, window.innerHeight - aboutBox.top);
    const handoff = smoothstep(0, window.innerHeight * 0.65, aboutTravel);
    const handoffComplete = handoff >= 0.999;
    const directoryApproach = window.innerHeight - sectionDirectory.getBoundingClientRect().top;
    resumeSheet.style.setProperty('--resume-sheet-x', `${lerp(mobileSheetStart.left, finalImageBox.left, handoff)}px`);
    resumeSheet.style.setProperty('--resume-sheet-y', `${lerp(mobileSheetStart.top, finalImageBox.top, handoff)}px`);
    resumeSheet.style.width = `${lerp(mobileSheetStart.width, finalImageBox.width, handoff)}px`;
    resumeSheet.style.clipPath = 'inset(0)';
    resumeSheet.style.opacity = handoffComplete ? '0' : '1';
    mobileResumePosition.style.setProperty('--mobile-static-opacity', handoffComplete ? 1 : 0);
    mobileResumeLayout.style.setProperty('--mobile-copy-opacity', 1);
    mobileResumeLayout.style.setProperty('--mobile-copy-offset', '0px');
    profileIntro.style.setProperty('--profile-opacity', 0);
    aboutKicker.style.setProperty('--about-kicker-opacity',
      1 - smoothstep(0, window.innerHeight * 0.7, directoryApproach)
    );
    scrollCircle.style.setProperty('--scroll-opacity', 0);
    scene.style.setProperty('--intro-opacity', 0);
    return;
  }

  const grow = smoothstep(0.05, 0.65, p);
  const folderExit = smoothstep(0.68, 0.9, p);
  const profileEntrance = smoothstep(0.38, 0.52, p);
  const detailsReveal = smoothstep(0.76, 0.92, p);
  const titleMove = smoothstep(0, 0.45, p);
  const mobileHeaderExit = mobile ? smoothstep(0.62, 0.9, p) : 0;
  const mobileCopyReveal = mobile ? smoothstep(0.9, 0.99, p) : 0;

  mobileResumeLayout.style.setProperty('--mobile-copy-opacity', mobileCopyReveal);

  // The resume rises out of the same red folder as it grows into the preview position.
  const resumeScale = lerp(1, mobile ? 1.3 : tablet ? 1.45 : 2.25, grow);
  const mobileCenteredX = (402 - 245 * resumeScale) / 2 - 42 - dragX;
  const mobileCentering = smoothstep(0.2, 0.45, p);
  const resumeX = mobile
    ? lerp(0, mobileCenteredX, mobileCentering)
    : lerp(0, tablet ? 150 : 310, grow);
  stage.style.setProperty('--resume-folder-x', `${resumeX}px`);
  stage.style.setProperty('--resume-folder-y', `${lerp(0, mobile ? 60 : tablet ? -160 : -180, grow)}px`);
  stage.style.setProperty('--resume-folder-scale', resumeScale);
  stage.style.setProperty('--resume-folder-opacity', 1 - folderExit);
  resumeFolder.tabIndex = folderExit >= 0.98 ? -1 : 0;
  resumeFolder.style.pointerEvents = folderExit >= 0.98 ? 'none' : 'auto';

  stage.style.setProperty('--title-x', `${lerp(0, mobile ? -25 : tablet ? -145 : -510, titleMove)}px`);
  stage.style.setProperty('--title-scale', lerp(1, mobile ? 0.7 : 0.51, titleMove));
  stage.style.setProperty('--title-opacity', 1 - smoothstep(0.36, 0.5, p));
  stage.style.setProperty('--other-folders-opacity', 1 - smoothstep(0.18, 0.5, p));
  otherFolders.forEach(folder => {
    folder.tabIndex = p >= 0.5 ? -1 : 0;
    folder.style.pointerEvents = p >= 0.5 ? 'none' : 'auto';
  });
  stage.style.setProperty('--decor-opacity', 1 - smoothstep(0.12, 0.44, p));
  stage.style.setProperty('--decor-rotation', `${lerp(0, 180, smoothstep(0, 0.44, p))}deg`);
  const directoryApproach = window.innerHeight - sectionDirectory.getBoundingClientRect().top;
  const directoryExit = smoothstep(0, window.innerHeight * 0.7, directoryApproach);
  const detailsTop = profileDetails.getBoundingClientRect().top;
  const profileExit = mobile ? directoryExit : Math.max(directoryExit, 1 - smoothstep(80, 300, detailsTop));
  profileIntro.style.setProperty('--profile-opacity', profileEntrance * (1 - profileExit) * (1 - mobileHeaderExit));
  profileIntro.style.setProperty('--profile-y', `${lerp(30, 0, profileEntrance)}px`);
  profileIntro.style.setProperty('--tagline-opacity', profileEntrance * (1 - detailsReveal));
  profileIntro.style.setProperty('--tagline-y', `${lerp(0, -18, detailsReveal)}px`);
  scene.style.setProperty('--intro-opacity', 1 - smoothstep(0.5, 0.72, p));

  const scrollOpacity = 1 - smoothstep(0, 0.13, p);
  scrollCircle.style.setProperty('--scroll-opacity', scrollOpacity);
  scrollCircle.style.setProperty('--scroll-y', `${lerp(0, 48, smoothstep(0, 0.13, p))}px`);

  // One resume sheet stays on screen after the folder fades and then scrolls past Skills.
  const folderBox = resumeFolder.getBoundingClientRect();
  const beyondIntro = Math.max(0, window.innerHeight - rect.bottom);
  const sheetWidth = folderBox.width * 0.68;
  const sheetHeight = sheetWidth * 1.5;
  const hoverRise = hoverAmount * 0.28 * (1 - grow);
  const rise = 0.58 * smoothstep(0.12, 0.64, p) + hoverRise;
  const scrollSpeed = mobile ? 0.35 : tablet ? 0.4 : 0.45;
  const sheetLeft = folderBox.left + folderBox.width * 0.16;
  const sheetTop = folderBox.top + beyondIntro + folderBox.height * 0.17
    - sheetHeight * rise - beyondIntro * scrollSpeed;
  const folderLip = folderBox.top + beyondIntro + folderBox.height * (112 / 416);
  const clippedBottom = Math.max(0, sheetHeight - Math.max(0, folderLip - sheetTop)) * (1 - folderExit);

  const aboutBox = profileDetails.parentElement.getBoundingClientRect();
  const rightStart = aboutBox.left + aboutBox.width * 0.48;
  const rightWidth = aboutBox.width * 0.52;
  const pinnedWidth = Math.min(520, window.innerHeight * (largeScreen ? 0.555 : 0.52), rightWidth);
  const pinnedLeft = largeScreen
    ? window.innerWidth * 0.91 - pinnedWidth
    : rightStart + (rightWidth - pinnedWidth) / 2;
  const pinnedTop = largeScreen
    ? clamp(window.innerHeight * 0.078, 64, 100)
    : clamp(window.innerHeight * 0.1, 70, 110);
  const pinProgress = mobile ? 0 : smoothstep(0.74, 0.9, p);
  const releaseDistance = mobile ? 0 : Math.max(0, pinnedTop - profileDetails.getBoundingClientRect().bottom);
  const displayedSheetLeft = mobile
    ? sheetLeft
    : lerp(sheetLeft, pinnedLeft, pinProgress);
  const displayedSheetTop = mobile
    ? sheetTop
    : lerp(sheetTop, pinnedTop, pinProgress) - releaseDistance * pinProgress;
  const displayedSheetWidth = mobile
    ? sheetWidth
    : lerp(sheetWidth, pinnedWidth, pinProgress);
  resumeSheet.style.setProperty('--resume-sheet-x', `${displayedSheetLeft}px`);
  resumeSheet.style.setProperty('--resume-sheet-y', `${displayedSheetTop}px`);
  resumeSheet.style.width = `${displayedSheetWidth}px`;
  if(mobile){
    mobileSheetStart = {left: displayedSheetLeft, top: displayedSheetTop, width: displayedSheetWidth};
    mobileResumePosition.style.setProperty('--mobile-static-opacity', 0);
    mobileResumeLayout.style.setProperty('--mobile-copy-offset', `${(1 - mobileCopyReveal) * 16}px`);
  }
  resumeSheet.style.clipPath = `inset(0 0 ${clippedBottom}px 0)`;
  const directoryScroll = -sectionDirectory.getBoundingClientRect().top;
  resumeSheet.style.opacity = `${1 - smoothstep(0, window.innerHeight * 0.5, directoryScroll)}`;
  aboutKicker.style.setProperty('--about-kicker-opacity',
    profileEntrance * (1 - smoothstep(0, window.innerHeight * 0.7, directoryApproach))
  );
}

function requestSceneUpdate(){
  if(sceneFrame) return;
  sceneFrame = requestAnimationFrame(() => {
    sceneFrame = 0;
    updateScene();
  });
}

function update(){
  resizeStage();
  const dragBounds = getDragBounds();
  dragX = clamp(dragX, dragBounds.min, dragBounds.max);
  folders.style.setProperty('--folders-drag-x', `${dragX}px`);
  updateScene();
}

function getDragBounds(){
  const scale = parseFloat(getComputedStyle(stage).getPropertyValue('--stage-scale')) || 1;
  const folderWidth = folders.scrollWidth * scale;
  const viewportWidth = window.innerWidth;
  const baseLeft = folders.getBoundingClientRect().left - dragX * scale;
  return {
    min: Math.min(0, (viewportWidth - baseLeft - folderWidth - 24) / scale),
    max: Math.max(0, (24 - baseLeft) / scale)
  };
}

folders.addEventListener('pointerdown', event => {
  if(event.button !== 0) return;
  folderDragCandidate = true;
  folderWasDragged = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartOffset = dragX;
});
folders.addEventListener('pointermove', event => {
  if(!folderDragCandidate) return;
  if(Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY) >= 8) folderWasDragged = true;
  if(!draggingFolders){
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    if(Math.hypot(deltaX, deltaY) < 8) return;
    if(Math.abs(deltaY) >= Math.abs(deltaX)){
      folderDragCandidate = false;
      return;
    }
    draggingFolders = true;
    folders.classList.add('is-dragging');
    folders.setPointerCapture(event.pointerId);
  }
  const bounds = getDragBounds();
  const scale = parseFloat(getComputedStyle(stage).getPropertyValue('--stage-scale')) || 1;
  dragX = clamp(dragStartOffset + (event.clientX - dragStartX) / scale, bounds.min, bounds.max);
  folders.style.setProperty('--folders-drag-x', `${dragX}px`);
  requestSceneUpdate();
});
const stopFolderDrag = event => {
  folderDragCandidate = false;
  if(!draggingFolders) return;
  draggingFolders = false;
  folders.classList.remove('is-dragging');
  if(folders.hasPointerCapture(event.pointerId)) folders.releasePointerCapture(event.pointerId);
};
folders.addEventListener('pointerup', stopFolderDrag);
folders.addEventListener('pointercancel', stopFolderDrag);
folders.addEventListener('click', event => {
  if(!folderWasDragged) return;
  event.preventDefault();
  event.stopPropagation();
  folderWasDragged = false;
}, true);

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  if(width <= 760 && Math.abs(width - lastLayoutWidth) < 1) return;
  lastLayoutWidth = width;
  if(resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    update();
  });
}, {passive:true});
window.addEventListener('scroll', requestSceneUpdate, {passive:true});
['pointerenter','pointerleave','focus','blur'].forEach(type => {
  resumeFolder.addEventListener(type, updateResumeHover);
});
window.addEventListener('load', () => {
  update();
  // Used only to render the provided end-state preview when opening ?state=end.
  if(new URLSearchParams(location.search).get('state') === 'end'){
    requestAnimationFrame(() => {
      window.scrollTo(0, experience.offsetHeight - window.innerHeight);
      requestAnimationFrame(updateScene);
    });
  }
});

// Keep the large red resume folder still; orbit the work folders around it.
const visualWorks = document.querySelector('.visual-works');
const visualCopy = document.querySelector('.visual-works__copy');
const visualFolderLayer = document.querySelector('.visual-works__folders');
const centerVisualFolder = document.querySelector('.visual-folder--center');
const originalVisualFolders = [...document.querySelectorAll('.visual-folder:not(.visual-folder--center)')];
const repeatedVisualFolders = originalVisualFolders.slice(0, 3).map(folder => {
  const repeat = folder.cloneNode(true);
  repeat.classList.add('visual-folder--repeat');
  repeat.setAttribute('aria-label', `${folder.getAttribute('aria-label')} 두 번째 폴더`);
  centerVisualFolder.parentElement.insertBefore(repeat, centerVisualFolder);
  return repeat;
});
const orbitingVisualFolders = [...originalVisualFolders, ...repeatedVisualFolders];
const reducedOrbitMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileOrbitMotion = window.matchMedia('(max-width: 760px)');
const orbitDuration = 120000;
let orbitVectors = [];
let orbitPhase = 0;
let orbitLastFrame = 0;
let orbitFrame = 0;
let orbitVisible = false;

function measureVisualOrbit(){
  const centerX = centerVisualFolder.offsetLeft + centerVisualFolder.offsetWidth / 2;
  const centerY = centerVisualFolder.offsetTop + centerVisualFolder.offsetHeight / 2;
  const angleStep = Math.PI * 2 / orbitingVisualFolders.length;

  // Read the authored positions at each breakpoint before placing the even orbit.
  originalVisualFolders.forEach(folder => {
    folder.style.left = '';
    folder.style.top = '';
    folder.style.right = '';
    folder.style.bottom = '';
  });
  const originalVectors = originalVisualFolders.slice(0, 3).map(folder => ({
    x: folder.offsetLeft + folder.offsetWidth / 2 - centerX,
    y: folder.offsetTop + folder.offsetHeight / 2 - centerY
  }));
  const radius = originalVectors.reduce((sum, {x, y}) => sum + Math.hypot(x, y), 0) / originalVectors.length;
  const startAngle = originalVectors.reduce((sum, {x, y}, index) =>
    sum + Math.atan2(y, x) - index * Math.PI / 3, 0) / originalVectors.length;

  orbitVectors = orbitingVisualFolders.map((folder, index) => {
    const angle = startAngle + index * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    folder.style.left = `${centerX + x - folder.offsetWidth / 2}px`;
    folder.style.top = `${centerY + y - folder.offsetHeight / 2}px`;
    folder.style.right = 'auto';
    folder.style.bottom = 'auto';
    return {folder, x, y};
  });
  drawVisualOrbit();

  visualFolderLayer.style.setProperty('--visual-folders-shift', '0px');
  if(window.innerWidth < 1200){
    const textBottom = visualCopy.lastElementChild.getBoundingClientRect().bottom;
    const firstFolderTop = Math.min(...[...orbitingVisualFolders, centerVisualFolder]
      .map(folder => folder.getBoundingClientRect().top));
    const gap = Math.max(0, firstFolderTop - textBottom);
    visualFolderLayer.style.setProperty('--visual-folders-shift', `${-gap / 2}px`);
  }
}

function drawVisualOrbit(){
  const cos = Math.cos(orbitPhase);
  const sin = Math.sin(orbitPhase);
  orbitVectors.forEach(({folder, x, y}) => {
    const moveX = x * cos - y * sin - x;
    const moveY = x * sin + y * cos - y;
    folder.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  });
}

function animateVisualOrbit(now){
  if(mobileOrbitMotion.matches && orbitLastFrame && now - orbitLastFrame < 1000 / 30){
    orbitFrame = requestAnimationFrame(animateVisualOrbit);
    return;
  }
  if(orbitLastFrame) orbitPhase += (now - orbitLastFrame) * Math.PI * 2 / orbitDuration;
  orbitLastFrame = now;
  drawVisualOrbit();
  orbitFrame = requestAnimationFrame(animateVisualOrbit);
}

function updateVisualOrbitMotion(){
  if(orbitVisible && !reducedOrbitMotion.matches){
    if(!orbitFrame) orbitFrame = requestAnimationFrame(animateVisualOrbit);
  }else{
    cancelAnimationFrame(orbitFrame);
    orbitFrame = 0;
    orbitLastFrame = 0;
    if(reducedOrbitMotion.matches){
      orbitPhase = 0;
      orbitingVisualFolders.forEach(folder => { folder.style.transform = ''; });
    }
  }
}

measureVisualOrbit();
document.fonts.ready.then(measureVisualOrbit);
let lastOrbitWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if(Math.abs(window.innerWidth - lastOrbitWidth) < 1) return;
  lastOrbitWidth = window.innerWidth;
  requestAnimationFrame(measureVisualOrbit);
}, {passive:true});
reducedOrbitMotion.addEventListener('change', updateVisualOrbitMotion);
mobileOrbitMotion.addEventListener('change', updateVisualOrbitMotion);
new IntersectionObserver(entries => {
  orbitVisible = entries[0].isIntersecting;
  updateVisualOrbitMotion();
}).observe(visualWorks);

const projectsSection = document.querySelector('.projects');
const projectRevealItems = {
  laptop: document.querySelector('.project-mockup--mellowee'),
  topTablet: document.querySelector('.project-mockup--mobbly-home'),
  bottomTablet: document.querySelector('.project-mockup--tablet'),
  phone: document.querySelector('.project-mockup--mobile')
};
const projectRevealAllItems = Object.values(projectRevealItems).filter(Boolean);
const projectLargeScreen = window.matchMedia('(min-width: 1200px)');
const projectMobileScreen = window.matchMedia('(max-width: 760px)');
const projectRevealThresholds = [0.06, 0.2, 0.34, 0.48];
const projectMobileRevealThresholds = [0.06, 0.24, 0.42];
let projectRevealFrame = 0;

function getProjectRevealOrder(){
  if(projectLargeScreen.matches){
    return [
      projectRevealItems.laptop,
      projectRevealItems.topTablet,
      projectRevealItems.bottomTablet,
      projectRevealItems.phone
    ].filter(Boolean);
  }
  if(projectMobileScreen.matches){
    return [
      projectRevealItems.bottomTablet,
      projectRevealItems.phone,
      projectRevealItems.laptop
    ].filter(Boolean);
  }
  return [
    projectRevealItems.topTablet,
    projectRevealItems.bottomTablet,
    projectRevealItems.phone,
    projectRevealItems.laptop
  ].filter(Boolean);
}

function updateProjectReveal(){
  projectRevealFrame = 0;
  if(!projectsSection || !projectRevealAllItems.length) return;

  const rect = projectsSection.getBoundingClientRect();
  const progress = clamp(
    (window.innerHeight - rect.top) / (rect.height + window.innerHeight),
    0,
    1
  );

  const thresholds = projectMobileScreen.matches
    ? projectMobileRevealThresholds
    : projectRevealThresholds;

  getProjectRevealOrder().forEach((item, index) => {
    const shouldShow = progress >= thresholds[index];
    if(projectLargeScreen.matches || projectMobileScreen.matches){
      item.classList.toggle('is-visible', shouldShow);
    }
    else if(shouldShow) item.classList.add('is-visible');
  });
}

function requestProjectReveal(){
  if(projectRevealFrame) return;
  projectRevealFrame = requestAnimationFrame(updateProjectReveal);
}

if(projectsSection && projectRevealAllItems.length){
  projectsSection.classList.add('is-reveal-ready');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    projectRevealAllItems.forEach(item => item.classList.add('is-visible'));
  }else{
    window.addEventListener('scroll', requestProjectReveal, {passive:true});
    window.addEventListener('resize', requestProjectReveal, {passive:true});
    const resetProjectReveal = () => {
      projectRevealAllItems.forEach(item => item.classList.remove('is-visible'));
      requestProjectReveal();
    };
    projectLargeScreen.addEventListener('change', resetProjectReveal);
    projectMobileScreen.addEventListener('change', resetProjectReveal);
    requestProjectReveal();
  }
}
