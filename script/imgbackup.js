import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const itemsPerPage = 9;

function getMaxPageButtons() {
  return window.innerWidth < 768 ? 5 : 10;
}

// 1. 갤러리 카드 렌더링 (20개씩 분할)
function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = '';

  const targetList = filteredPosts;
  
  if (targetList.length === 0) {
    gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0;">게시물이 없습니다.</p>';
    renderPagination();
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, targetList.length);
  const currentPosts = targetList.slice(startIndex, endIndex);

  const template = document.getElementById('post-card-template');

  currentPosts.forEach(data => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.post-card');
    
    card.querySelector('.main-title').textContent = data.title || '';
    card.querySelector('.main-subtitle').textContent = data.subtitle || '';

    const thumbContainer = card.querySelector('.post-thumbnail');
    if (data.images && data.images.length > 0) {
      const img = document.createElement('img');
      img.src = data.images[0];
      img.alt = data.title || '';
      thumbContainer.appendChild(img);
    }

    card.addEventListener('click', () => openDetailModal(data));
    gallery.appendChild(card);
  });

  renderPagination();
}

// 2. 페이지네이션 바 렌더링 (▶, ▷ 적용)
function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  if (totalPages <= 1) return;

  const maxButtons = getMaxPageButtons();
  const currentGroup = Math.floor((currentPage - 1) / maxButtons);
  const startPage = currentGroup * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  // ▶ 버튼 (다음 페이지 그룹)
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '▶';
  nextBtn.disabled = endPage >= totalPages;
  nextBtn.onclick = () => {
    currentPage = endPage + 1;
    renderGallery();
  };

  // ▷ 버튼 (맨 끝 페이지)
  const lastBtn = document.createElement('button');
  lastBtn.textContent = '▷';
  lastBtn.disabled = currentPage === totalPages;
  lastBtn.onclick = () => {
    currentPage = totalPages;
    renderGallery();
  };

  // 숫자 페이지 버튼
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === currentPage) pageBtn.classList.add('active');
    pageBtn.onclick = () => {
      currentPage = i;
      renderGallery();
    };
    paginationContainer.appendChild(pageBtn);
  }

  paginationContainer.appendChild(nextBtn);
  paginationContainer.appendChild(lastBtn);
}

// Firestore 실시간 로드
const q = query(collection(db, "imgbackup"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filteredPosts = [...allPosts];
  currentPage = 1;
  renderGallery();
});

// 검색 기능
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

function handleSearch() {
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (!keyword) {
    filteredPosts = [...allPosts];
  } else {
    filteredPosts = allPosts.filter(post => 
      (post.title && post.title.toLowerCase().includes(keyword)) ||
      (post.subtitle && post.subtitle.toLowerCase().includes(keyword)) ||
      (post.content && post.content.toLowerCase().includes(keyword))
    );
  }
  currentPage = 1;
  renderGallery();
}

if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (searchInput) {
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

// 화면 크기 변경 반응형 처리
window.addEventListener('resize', () => {
  renderPagination();
});
