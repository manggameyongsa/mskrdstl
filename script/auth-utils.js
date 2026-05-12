import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 사용자 권한 가져오기 공통 함수
export async function getUserRole(db, userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().role : 'user';
  } catch { return 'user'; }
}

// 모달 바깥 클릭 시 닫기 기능을 설정하는 공통 함수
export function setupModalOutsideClick(writeModalId, detailModalId, closeWriteFn, closeDetailFn) {
  window.onclick = (event) => {
    const writeModal = document.getElementById(writeModalId);
    const detailModal = document.getElementById(detailModalId);

    if (event.target === writeModal) {
      closeWriteFn();
    }
    if (event.target === detailModal) {
      closeDetailFn();
    }
  };
}

// 링크 및 인라인 이미지 변환 공통 함수
// 사용법: 글 본문에 ![설명](이미지URL) 형식으로 이미지를 삽입할 수 있습니다.
//
// [버그 수정] 이전 방식(두 번 replace)은 ![](url) → <img src="url"> 변환 후
// 두 번째 정규식이 <img src="url"> 안의 url까지 <a>링크로 덮어써서 이미지가 깨졌습니다.
// 수정: 하나의 정규식으로 이미지 패턴과 URL 패턴을 동시에 처리합니다.
export function linkify(text) {
  if (!text) return '';

  const combined = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;

  return text.replace(combined, (match, altText, imgUrl, plainUrl) => {
    if (imgUrl) {
      // ![alt](url) → 인라인 이미지
      return '<img src="' + imgUrl + '" alt="' + (altText || '') + '" class="post-inline-img" onerror="this.style.display=\'none\'">';
    } else {
      // 단독 URL → 링크
      return '<a href="' + plainUrl + '" target="_blank" rel="noopener noreferrer" class="post-link">LINK</a>';
    }
  });
}


// 검색 기능 공통 함수
export function setupSearch(allPosts, renderFn) {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  if (!searchInput || !searchBtn) return;

  const handleSearch = () => {
    const keyword = searchInput.value.toLowerCase().trim();
    const postsArray = Object.values(allPosts);
    
    if (!keyword) {
      renderFn(postsArray);
      return;
    }

    const filtered = postsArray.filter(post => {
      const title = (post.title || '').toLowerCase();
      const subtitle = (post.subtitle || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      const author = (post.userEmail || '').toLowerCase(); 
      
      return title.includes(keyword) || 
             subtitle.includes(keyword) || 
             content.includes(keyword) || 
             author.includes(keyword);
    });

    renderFn(filtered);
  };

  searchBtn.onclick = handleSearch;
  searchInput.onkeyup = (e) => { if (e.key === 'Enter') handleSearch(); };
}
