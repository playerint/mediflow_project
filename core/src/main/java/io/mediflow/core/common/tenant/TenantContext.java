package io.mediflow.core.common.tenant;

/**
 * 요청마다 "현재 병원 ID"를 스레드에 저장하는 컨텍스트.
 *
 * CLAUDE.md 4-1 규칙 구현 핵심:
 *   모든 DB 조회는 반드시 이 컨텍스트를 통해 hospital_id를 얻어 필터링한다.
 *   본사용 BO만 setHospitalId(null) 상태로 전체 조회가 허용된다.
 *
 * 사용 흐름:
 *   1. TenantInterceptor  → 요청 시작 시 setHospitalId() 호출
 *   2. Service/Repository → getHospitalId() 로 필터값 참조
 *   3. TenantInterceptor  → 요청 종료 시 clear() 호출
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_HOSPITAL_ID = new ThreadLocal<>();

    private TenantContext() {}

    public static void setHospitalId(Long hospitalId) {
        CURRENT_HOSPITAL_ID.set(hospitalId);
    }

    /** 현재 요청의 병원 ID 반환. null이면 본사 권한(전체 조회 허용). */
    public static Long getHospitalId() {
        return CURRENT_HOSPITAL_ID.get();
    }

    /** 병원 격리가 필요한 요청인지 확인 */
    public static boolean hasTenant() {
        return CURRENT_HOSPITAL_ID.get() != null;
    }

    /** 요청 종료 시 반드시 호출 — ThreadLocal 누수 방지 */
    public static void clear() {
        CURRENT_HOSPITAL_ID.remove();
    }
}
