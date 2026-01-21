# 🛠️ Wear OS ↔ Mobile 동기화 문제 해결 보고서

이 문서는 "MandalaPlan" 앱의 Wear OS 워치와 모바일 앱 간 데이터 동기화 실패 원인과 해결 과정을 정리한 것입니다.

## 🚨 1. 문제 상황
*   워치 앱에서 타이머 종료 후 "저장"을 눌러도 모바일 앱에 아무런 반응이 없음.
*   초기 로그 확인 시 별다른 에러가 보이지 않거나, 연결은 된 것 같은데 데이터가 안 넘어오는 현상.

---

## 🔍 2. 원인 분석 및 해결 과정

### 원인 1: 앱 서명(Signature) 불일치 🔒
가장 먼저 발견된 결정적인 원인은 **Logcat** 로그에 있었습니다.
```
W WearableService: Failed to deliver message to AppKey[<hidden>, ...]; ...
```
Google Data Layer API는 보안을 위해 **동일한 서명 키(Signing Key)**를 가진 앱끼리만 통신을 허용합니다. 개발 초기에는 Wear 앱과 Mobile 앱이 서로 다른 디버그 키(또는 기본 키)를 사용하고 있어 데이터 전달이 거부되었습니다.

**✅ 해결:**
*   `upload-keystore.jks`라는 동일한 키스토어 파일을 생성.
*   `frontend/wear/build.gradle`과 `frontend/android/app/build.gradle`의 `signingConfigs`를 수정하여 **두 앱이 같은 키로 서명되도록 강제**함.

---

### 원인 2: Application ID 불일치 🆔
서명을 맞춘 후에도 통신이 원활하지 않았습니다.
*   Phone App: `com.mandalaplan.app`
*   Wear App: `com.mandalaplan.wear`
Google Play Store 배포 및 Data Layer API의 원활한 노드 발견을 위해서는 패키지명이 달라도 되지만, `applicationId`가 일치하는 것이 가장 확실한 방법입니다.

**✅ 해결:**
*   Wear 앱의 `build.gradle`에서 `applicationId`를 `com.mandalaplan.app`으로 변경하여 모바일 앱과 일치시킴.

---

### 원인 3: 프론트엔드 수신 로직(Listener) 누락 🎧 (가장 결정적)
Native(Java) 단에서는 데이터를 정상적으로 수신했으나(`WearSyncPlugin` 로그 확인), 정작 **React(JS)** 코드에서 이 데이터를 받아처리하는 부분이 빠져 있었습니다.
Capacitor와 같은 하이브리드 앱 구조에서는 데이터 흐름이 다음과 같습니다:
`Watch` ➡️ `Phone (Native Java)` ➡️ `Capacitor Bridge` ➡️ `Phone (React JS)`

마지막 단계인 JS 리스너가 없어서 데이터가 증발하고 있었습니다.

**✅ 해결:**
*   `usePomodoro.ts` 훅(Hook)에 `WearSync.addListener` 코드를 추가.
*   워치에서 데이터가 오면 `onTaskTimerStop`을 호출하여 DB에 저장하도록 연결.

```typescript
// 추가된 코드 예시
useEffect(() => {
    WearSync.addListener('timerSessionReceived', (data) => {
        if (data.durationMinutes > 0) {
            // 저장 로직 실행
            onTaskTimerStop(data.durationMinutes, data.taskId);
        }
    });
}, []);
```

---

## 🎯 3. 결론
Wear OS 연동이 안 된 이유는 **"보안(서명) + 식별자(ID) + 수신부(코드)의 3중 문제"**였습니다.
하나라도 빠지면 연동이 되지 않으며, 특히 **하이브리드 앱**에서는 Native 로그뿐만 아니라 JS 코드의 수신부도 반드시 체크해야 함을 확인했습니다.

### 📝 Vercel/Railway 배포 관련
*   이 문제는 **로컬 블루투스 통신**과 **로컬 앱 로직**의 문제였으므로, Vercel(프론트엔드 호스팅)이나 Railway(백엔드) 설정과는 무관했습니다.
*   앱 업데이트를 위해서는 Vercel 배포가 아닌 **APK 재설치**가 필요합니다.
