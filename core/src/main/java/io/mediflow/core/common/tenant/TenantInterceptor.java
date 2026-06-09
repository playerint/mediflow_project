package io.mediflow.core.common.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 모든 HTTP 요청에서 hospital_id를 추출해 TenantContext에 세팅한다.
 *
 * TODO: JWT 토큰에서 hospitalId를 파싱하도록 교체 예정.
 *       현재는 헤더 X-Hospital-Id 값으로 임시 처리.
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String HEADER_HOSPITAL_ID = "X-Hospital-Id";

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler
    ) {
        String hospitalIdHeader = request.getHeader(HEADER_HOSPITAL_ID);
        if (hospitalIdHeader != null) {
            try {
                TenantContext.setHospitalId(Long.parseLong(hospitalIdHeader));
            } catch (NumberFormatException ignored) {
                // 잘못된 값은 무시 — 서비스 계층에서 null 체크
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler,
            Exception ex
    ) {
        TenantContext.clear();
    }
}
