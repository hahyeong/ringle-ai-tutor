// public/js/membership.js

// 멤버십 상태 확인
async function checkMembershipStatus() {
    try {
        const membershipInfo = document.getElementById('membershipInfo');
        const purchaseSection = document.getElementById('purchaseSection');
        
        // 현재 사용자 정보 표시
        displayCurrentUser();
        
        const data = await getMembershipStatus();
        if (!data) return; // 로그인되지 않은 경우
        
        if (data.has_membership) {
            // 활성 멤버십이 있는 경우
            displayMembershipInfo(data.membership);
            enableFeatures(data.membership.features);
            purchaseSection.style.display = 'none';
        } else {
            // 멤버십이 없는 경우
            displayNoMembership();
            disableAllFeatures();
            purchaseSection.style.display = 'block';
        }
    } catch (error) {
        console.error('멤버십 상태 확인 실패:', error);
        displayError('멤버십 정보를 불러올 수 없습니다.');
    }
}

// 현재 사용자 정보 표시
function displayCurrentUser() {
    const userInfo = getCurrentUserInfo();
    if (!userInfo) return;
    
    // 기존 헤더에 사용자 정보 추가
    const header = document.querySelector('header');
    if (header && !header.querySelector('.user-info')) {
        const userInfoDiv = document.createElement('div');
        userInfoDiv.className = 'user-info';
        userInfoDiv.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        
        userInfoDiv.innerHTML = `
            <div style="text-align: right;">
                <div style="font-weight: bold;">${userInfo.name}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${userInfo.email}</div>
            </div>
            <button onclick="logout()" style="
                background: rgba(255,255,255,0.3);
                border: none;
                color: white;
                padding: 8px 15px;
                border-radius: 15px;
                cursor: pointer;
                font-size: 0.9rem;
            ">로그아웃</button>
        `;
        
        header.appendChild(userInfoDiv);
    }
}

// 멤버십 정보 표시
function displayMembershipInfo(membership) {
    const membershipInfo = document.getElementById('membershipInfo');
    
    membershipInfo.innerHTML = `
        <div class="membership-card active">
            <div class="membership-name">${membership.name}</div>
            <div class="membership-features">
                ${membership.features.map(feature => 
                    `<span class="feature-badge">${getFeatureDisplayName(feature)}</span>`
                ).join('')}
            </div>
            <div class="membership-expire">
                만료일: ${new Date(membership.expires_at).toLocaleDateString('ko-KR')}
                <br>
                <span class="days-remaining">남은 기간: ${membership.days_remaining}일</span>
            </div>
        </div>
    `;
}

// 멤버십 없음 표시
function displayNoMembership() {
    const membershipInfo = document.getElementById('membershipInfo');
    
    membershipInfo.innerHTML = `
        <div class="membership-card expired">
            <div class="membership-name">활성화된 멤버십이 없습니다</div>
            <p>멤버십을 구매하여 AI 튜터 기능을 이용해보세요!</p>
        </div>
    `;
}

// 오류 표시
function displayError(message) {
    const membershipInfo = document.getElementById('membershipInfo');
    membershipInfo.innerHTML = `<div class="error">${message}</div>`;
}

// 기능 활성화
function enableFeatures(features) {
    const buttons = {
        'learning': document.getElementById('learningBtn'),
        'conversation': document.getElementById('conversationBtn'),
        'analysis': document.getElementById('analysisBtn')
    };
    
    // 모든 버튼 비활성화
    Object.values(buttons).forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('enabled');
        btn.onclick = null;
    });
    
    // 허용된 기능만 활성화
    features.forEach(feature => {
        if (buttons[feature]) {
            buttons[feature].disabled = false;
            buttons[feature].classList.add('enabled');
        }
    });
    
    // 학습 버튼 클릭 이벤트
    if (features.includes('learning')) {
        buttons.learning.onclick = () => {
            window.location.href = 'learning.html';
        };
    }
    
    // 대화 버튼 클릭 이벤트
    if (features.includes('conversation')) {
        buttons.conversation.onclick = () => {
            window.location.href = 'conversation.html';
        };
    }
    
    // 분석 버튼 클릭 이벤트
    if (features.includes('analysis')) {
        buttons.analysis.onclick = () => {
            window.location.href = 'analysis.html';
        };
    }
}

// 모든 기능 비활성화
function disableAllFeatures() {
    const buttons = ['learningBtn', 'conversationBtn', 'analysisBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        btn.disabled = true;
        btn.classList.remove('enabled');
        btn.onclick = null;
    });
}

// 기능명 표시용 변환
function getFeatureDisplayName(feature) {
    const names = {
        'learning': '학습',
        'conversation': '대화',
        'analysis': '분석'
    };
    return names[feature] || feature;
}

// 멤버십 구매 처리
async function handlePurchase(membershipTypeId) {
    try {
        const result = await purchaseMembership(null, membershipTypeId);
        if (result) {
            alert(result.message);
            // 페이지 새로고침하여 새 멤버십 상태 표시
            window.location.reload();
        }
    } catch (error) {
        console.error('구매 실패:', error);
        alert('구매 처리 중 오류가 발생했습니다.');
    }
}

// 구매 버튼 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 확인
    if (!getCurrentUserId()) {
        return; // 로그인 페이지로 리다이렉트됨
    }
    
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    purchaseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const membershipTypeId = this.getAttribute('data-type');
            handlePurchase(membershipTypeId);
        });
    });
});