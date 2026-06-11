# 새 백엔드 API 추가 스킬

## 언제 사용하나
프론트엔드가 필요로 하는 API가 백엔드에 아직 없을 때.

## 실행 순서 (MVC 패턴)

### 1. Entity (이미 있으면 생략)
`core/src/main/java/com/mediflow/core/entity/`

### 2. DTO 생성
```java
// dto/XxxRequest.java
// dto/XxxResponse.java
```

### 3. Repository
```java
// repository/XxxRepository.java
public interface XxxRepository extends JpaRepository<Xxx, Long> {
    List<Xxx> findByHospitalId(Long hospitalId); // hospital_id 필터 필수!
}
```

### 4. Service
```java
// service/XxxService.java
// 비즈니스 로직. 반드시 hospitalId 파라미터 받아서 필터링
```

### 5. Controller
```java
// controller/XxxController.java
@RestController
@RequestMapping("/api/v1/xxx")
public class XxxController {
    // JWT에서 hospitalId 추출해서 service에 전달
}
```

## 절대 규칙
- `hospital_id` 필터 없는 쿼리 금지
- 환자·상담 데이터는 병원 스키마(hospital_N)에 저장
- 새 엔드포인트는 JWT 인증 적용 (public 제외)
