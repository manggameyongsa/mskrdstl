import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const imgList = document.getElementById('img-list');

let allPosts = [];
let currentPage = 1;
const itemsPerPage = 20; // 한 페이지당 20개

function getMaxPageButtons() {
  return window.innerWidth < 768 ? 5 : 10;
}

// 1. 이미지 목록 렌더링
function renderPosts() {
  if (!imgList) return;
  imgList.innerHTML = '';

  if (allPosts.length === 0) {
    imgList.innerHTML = '<p class="empty-msg">등록된 이미지가 없습니다.</p>';
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allPosts.length);
  const currentPosts = allPosts.slice(startIndex, endIndex);

  currentPosts.forEach(data => {
    const card = document.createElement('div');
    card.className = 'img-card';
    
    // Firestore 필드명(imageUrl, title 등)에 맞게 수정 가능
    card.innerHTML = `
      <img src="${data.imageUrl || data.url || ''}" alt="${data.title || 'backup image'}" style="max-width: 100%;" />
      <p>${data.title || ''}</p>
    `;
    imgList.appendChild(card);
  });
}

// 2. 페이지네이션 바 렌더링
function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(allPosts.length / itemsPerPage);
  if (totalPages <= 1) return;

  const maxButtons = getMaxPageButtons();
  const currentGroup = Math.floor((currentPage - 1) / maxButtons);
  const startPage = currentGroup * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  // ▶ 버튼
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '▶';
  nextBtn.disabled = endPage >= totalPages;
  nextBtn.onclick = () => {
    currentPage = endPage + 1;
    updateView();
  };

  // ▷ 버튼
  const lastBtn = document.createElement('button');
  lastBtn.textContent = '▷';
  lastBtn.disabled = currentPage === totalPages;
  lastBtn.onclick = () => {
    currentPage = totalPages;
    updateView();
  };

  // 숫자 버튼
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === currentPage) pageBtn.classList.add('active');
    pageBtn.onclick = () => {
      currentPage = i;
      updateView();
    };
    paginationContainer.appendChild(pageBtn);
  }

  paginationContainer.appendChild(nextBtn);
  paginationContainer.appendChild(lastBtn);
}

function updateView() {
  renderPosts();
  renderPagination();
}

// Firestore 'imgbackup' 컬렉션 데이터 수신 (컬렉션 이름이 다른 경우 "imgbackup" 수정)
const q = query(collection(db, "imgbackup"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  allPosts = snapshot.docs.map(doc => doc.data());
  updateView();
});

// 화면 크기 변경 시 (PC <-> 모바일) 페이지네이션 재조정
window.addEventListener('resize', () => {
  renderPagination();
});
