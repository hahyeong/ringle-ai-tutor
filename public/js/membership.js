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
            enableFeatures(data.membership.features, data.membership);
            purchaseSection.style.display = 'none';
            
            // 멤버십 관리 버튼 표시
            const membershipActions = document.getElementById('membershipActions');
            if (membershipActions) {
                membershipActions.style.display = 'flex';
            }
        } else {
            // 멤버십이 없는 경우
            displayNoMembership();
            disableAllFeatures();
            purchaseSection.style.display = 'block';
            
            // 멤버십 관리 버튼 숨김
            const membershipActions = document.getElementById('membershipActions');
            if (membershipActions) {
                membershipActions.style.display = 'none';
            }
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
                background: #acacac;
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

// 멤버십 정보 표시 (횟수제 지원 추가)
function displayMembershipInfo(membership) {
    const membershipInfo = document.getElementById('membershipInfo');
    
    // 횟수제 멤버십인지 확인
    const isUsageBased = membership.usage_based;
    const usageRemaining = membership.usage_remaining;
    
    // 멤버십 상태에 따른 스타일 결정
    let statusClass = 'active';
    let statusMessage = '';
    
    if (isUsageBased && usageRemaining !== null) {
        if (usageRemaining <= 0) {
            statusClass = 'usage-exhausted';
            statusMessage = '🚫 사용 횟수 소진';
        } else if (usageRemaining <= 3) {
            statusClass = 'usage-warning';
            statusMessage = '⚠️ 사용 횟수 부족';
        } else {
            statusMessage = '✅ 사용 가능';
        }
    }
    
    membershipInfo.innerHTML = `
        <div class="membership-card ${statusClass}">
            <div class="membership-header">
                <div class="membership-name">${membership.name}</div>
                <div class="membership-status">${statusMessage}</div>
            </div>
            
            <div class="membership-features">
                ${membership.features.map(feature => 
                    `<span class="feature-badge">${getFeatureDisplayName(feature)}</span>`
                ).join('')}
            </div>
            
            <div class="membership-details">
                <div class="membership-expire">
                    📅 만료일: ${new Date(membership.expires_at).toLocaleDateString('ko-KR')}
                    <br>
                    <span class="days-remaining">⏰ 남은 기간: ${membership.days_remaining}일</span>
                </div>
                
                ${isUsageBased ? `
                    <div class="usage-info">
                        <div class="usage-counter">
                            🎯 남은 사용 횟수: 
                            <span class="usage-count ${usageRemaining <= 3 ? 'low' : ''}">${usageRemaining}회</span>
                        </div>
                        <div class="usage-progress">
                            ${generateUsageProgressBar(usageRemaining, getTotalUsageLimit(membership))}
                        </div>
                    </div>
                ` : `
                    <div class="unlimited-info">
                        ♾️ 무제한 사용 가능
                    </div>
                `}
            </div>
        </div>
    `;
    
    // 횟수제 멤버십 스타일 추가
    addUsageBasedStyles();
}

// 사용 횟수 진행률 바 생성
function generateUsageProgressBar(remaining, total) {
    if (!total || total <= 0) return '';
    
    const used = total - remaining;
    const percentage = (remaining / total) * 100;
    
    let barColor = '#4CAF50'; // 초록색 (여유)
    if (percentage <= 30) barColor = '#f44336'; // 빨간색 (위험)
    else if (percentage <= 50) barColor = '#ff9800'; // 주황색 (주의)
    
    return `
        <div class="progress-container">
            <div class="progress-bar" style="width: ${percentage}%; background-color: ${barColor}"></div>
            <div class="progress-text">${used}/${total} 사용됨</div>
        </div>
    `;
}

// 총 사용 한도 계산 (예시용 - 실제로는 서버에서 받아와야 함)
function getTotalUsageLimit(membership) {
    // 멤버십 이름에 따라 추정하거나, API에서 추가 정보를 받아와야 함
    if (membership.name.includes('횟수제')) {
        return 10; // 예시: 횟수제는 10회
    }
    return null; // 무제한
}

// 횟수제 멤버십 전용 스타일 추가
function addUsageBasedStyles() {
    if (document.getElementById('usage-styles')) return; // 이미 추가됨
    
    const style = document.createElement('style');
    style.id = 'usage-styles';
    style.textContent = `
        .membership-card.usage-exhausted {
            border-color: #f44336;
            background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
        }
        
        .membership-card.usage-warning {
            border-color: #ff9800;
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        }
        
        .membership-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .membership-status {
            font-size: 0.9rem;
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 15px;
            background: rgba(255,255,255,0.8);
        }
        
        .usage-info {
            margin-top: 15px;
            padding: 15px;
            background: rgba(255,255,255,0.3);
            border-radius: 10px;
        }
        
        .usage-counter {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .usage-count {
            font-size: 1.2rem;
            padding: 2px 8px;
            border-radius: 5px;
            background: rgba(255,255,255,0.8);
        }
        
        .usage-count.low {
            background: #ffcdd2;
            color: #d32f2f;
        }
        
        .progress-container {
            position: relative;
            background: rgba(255,255,255,0.5);
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 10px;
        }
        
        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.8rem;
            font-weight: bold;
            color: #333;
        }
        
        .unlimited-info {
            margin-top: 15px;
            padding: 15px;
            background: rgba(76, 175, 80, 0.2);
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
            color: #2e7d32;
        }
    `;
    
    document.head.appendChild(style);
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

// 기능 활성화 (멤버십 정보 추가)
function enableFeatures(features, membership) {
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
            // 횟수제 멤버십에서 사용 횟수가 소진된 경우 체크
            const canUse = !membership.usage_based || 
                          (membership.usage_remaining && membership.usage_remaining > 0);
            
            buttons[feature].disabled = !canUse;
            
            if (canUse) {
                buttons[feature].classList.add('enabled');
            } else {
                buttons[feature].classList.add('usage-exhausted');
                buttons[feature].title = '사용 횟수가 소진되었습니다';
            }
        }
    });
    
    // 학습 버튼 클릭 이벤트
    if (features.includes('learning')) {
        buttons.learning.onclick = () => {
            if (checkUsageBeforeAction(membership)) {
                window.location.href = 'learning.html';
            }
        };
    }
    
    // 대화 버튼 클릭 이벤트
    if (features.includes('conversation')) {
        buttons.conversation.onclick = () => {
            if (checkUsageBeforeAction(membership)) {
                window.location.href = 'conversation.html';
            }
        };
    }
    
    // 분석 버튼 클릭 이벤트
    if (features.includes('analysis')) {
        buttons.analysis.onclick = () => {
            if (checkUsageBeforeAction(membership)) {
                window.location.href = 'analysis.html';
            }
        };
    }
}

// 사용 전 횟수 체크
function checkUsageBeforeAction(membership) {
    if (membership.usage_based && membership.usage_remaining <= 0) {
        alert('사용 횟수를 모두 소진했습니다. 멤버십을 업그레이드해주세요.');
        return false;
    }
    
    if (membership.usage_based && membership.usage_remaining <= 3) {
        const confirmed = confirm(`남은 사용 횟수가 ${membership.usage_remaining}회입니다. 계속하시겠습니까?`);
        return confirmed;
    }
    
    return true;
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

// 실시간 멤버십 상태 업데이트 (대화 후 사용 횟수 갱신)
async function refreshMembershipStatus() {
    try {
        const data = await getMembershipStatus();
        if (data && data.has_membership) {
            displayMembershipInfo(data.membership);
        }
    } catch (error) {
        console.error('멤버십 상태 갱신 실패:', error);
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